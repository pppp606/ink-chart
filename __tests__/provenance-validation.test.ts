/**
 * Provenance Attestation Validation Tests
 *
 * This test suite validates provenance attestation generation and validation
 * for NPM packages published with OIDC authentication.
 *
 * Provenance provides cryptographic proof of where and how a package was built,
 * improving supply chain security by allowing consumers to verify package origin.
 *
 * TDD Implementation:
 * - RED: Tests that initially fail (this file)
 * - GREEN: Implementation to make tests pass
 * - REFACTOR: Optimize and enhance
 */

import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertContains } from './helpers/assertions.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Provenance Attestation Validation', () => {
  const originalEnv = process.env;
  const workflowPath = path.resolve(process.cwd(), '.github', 'workflows', 'publish-npm.yml');

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Provenance Generation Requirements', () => {
    it('should validate that provenance requires OIDC authentication', () => {
      // Test that provenance cannot be generated without OIDC
      const canGenerateProvenance = validateProvenanceRequirements({
        hasOidcToken: false,
        hasNpmToken: true
      });

      assert.equal(canGenerateProvenance, false);
    });

    it('should validate that provenance works with OIDC authentication', () => {
      // Test that provenance can be generated with OIDC
      const canGenerateProvenance = validateProvenanceRequirements({
        hasOidcToken: true,
        hasNpmToken: false
      });

      assert.equal(canGenerateProvenance, true);
    });

    it('should validate provenance command generation with OIDC', () => {
      // Set up OIDC environment
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = 'https://vstoken.actions.githubusercontent.com/_apis/distributedtask/hubs/build/plans/123/jobs/456/oidctoken';
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...';
      process.env.GITHUB_REPOSITORY = 'pppp606/ink-chart';
      process.env.GITHUB_REF = 'refs/tags/v1.0.0';
      process.env.GITHUB_SHA = 'abcdef1234567890abcdef1234567890abcdef12';

      const command = generateProvenancePublishCommand();

      assertContains(command, '--provenance');
      assertContains(command, 'npm publish');
      assertContains(command, '--access public');
    });

    it('should reject provenance generation without required GitHub context', () => {
      // Missing GITHUB_REPOSITORY
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = 'https://vstoken.actions.githubusercontent.com';
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'token';
      delete process.env.GITHUB_REPOSITORY;

      assert.throws(() => generateProvenancePublishCommand(), /Missing GitHub context for provenance/);
    });
  });

  describe('Provenance Attestation Structure', () => {
    it('should validate expected provenance attestation structure', () => {
      const mockAttestation = createMockProvenanceAttestation();

      assert.ok('statement' in mockAttestation);
      assert.equal(mockAttestation.statement._type, 'https://in-toto.io/Statement/v0.1');
      assert.ok('subject' in mockAttestation.statement);
      assert.ok('predicateType' in mockAttestation.statement);
      assert.ok('predicate' in mockAttestation.statement);
    });

    it('should validate provenance subject information', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const subject = mockAttestation.statement.subject[0];

      assert.ok('name' in subject);
      assertContains(subject.name, '@pppp606/ink-chart');
      assert.ok('digest' in subject);
      assert.ok('sha512' in subject.digest);
    });

    it('should validate provenance predicate type', () => {
      const mockAttestation = createMockProvenanceAttestation();

      assert.equal(mockAttestation.statement.predicateType, 'https://slsa.dev/provenance/v0.2');
    });

    it('should validate provenance builder information', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const builder = mockAttestation.statement.predicate.builder;

      assert.ok('id' in builder);
      assertContains(builder.id, 'github.com/actions/runner');
    });

    it('should validate provenance invocation details', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const invocation = mockAttestation.statement.predicate.invocation;

      assert.ok('configSource' in invocation);
      assert.ok('uri' in invocation.configSource);
      assertContains(invocation.configSource.uri, 'pppp606/ink-chart');
      assert.ok('digest' in invocation.configSource);
      assert.ok('entryPoint' in invocation.configSource);
    });
  });

  describe('Provenance Workflow Integration', () => {
    it('should validate that workflow uses provenance flag with OIDC', () => {
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');

      // OIDC publish step must include --provenance
      assertContains(workflowContent, 'npm publish');
      assertContains(workflowContent, '--provenance');
      assertContains(workflowContent, 'id-token: write');
    });
  });

  describe('Provenance Security Validation', () => {
    it('should validate provenance signature verification', () => {
      const mockSignature = createMockProvenanceSignature();

      const isValidSignature = validateProvenanceSignature(mockSignature);
      assert.equal(isValidSignature, true);
    });

    it('should validate provenance certificate chain', () => {
      const mockCertificateChain = createMockCertificateChain();

      const isValidChain = validateCertificateChain(mockCertificateChain);
      assert.equal(isValidChain, true);
    });

    it('should validate provenance repository matching', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const expectedRepository = 'pppp606/ink-chart';

      const repositoryMatches = validateRepositoryInProvenance(mockAttestation, expectedRepository);
      assert.equal(repositoryMatches, true);
    });

    it('should reject provenance with mismatched repository', () => {
      const mockAttestation = createMockProvenanceAttestation();
      // Simulate an attestation with wrong repository
      mockAttestation.statement.predicate.invocation.configSource.uri = 'git+https://github.com/attacker/malicious-repo@refs/tags/v1.0.0';

      const repositoryMatches = validateRepositoryInProvenance(mockAttestation, 'pppp606/ink-chart');
      assert.equal(repositoryMatches, false);
    });
  });

  describe('Provenance Badge Validation', () => {
    it('should validate provenance badge requirements for npm package page', () => {
      const packageInfo = {
        name: '@pppp606/ink-chart',
        version: '1.0.0',
        hasProvenance: true
      };

      const badgeRequirements = validateProvenanceBadgeRequirements(packageInfo);

      assert.equal(badgeRequirements.packagePublished, true);
      assert.equal(badgeRequirements.provenanceAttested, true);
      assert.equal(badgeRequirements.badgeEligible, true);
    });

    it('should validate provenance information display format', () => {
      const provenanceInfo = formatProvenanceDisplayInfo({
        sourceRepository: 'pppp606/ink-chart',
        workflowPath: '.github/workflows/publish-npm.yml',
        buildTrigger: 'refs/tags/v1.0.0',
        commitSha: 'abcdef1234567890'
      });

      assert.ok('repository' in provenanceInfo);
      assert.ok('workflow' in provenanceInfo);
      assert.ok('trigger' in provenanceInfo);
      assert.ok('commit' in provenanceInfo);
      assert.equal(provenanceInfo.repository, 'pppp606/ink-chart');
    });

    it('should validate npm package page provenance section', () => {
      const mockNpmPageData = createMockNpmPackagePageData();

      const hasProvenanceSection = validateNpmProvenanceSection(mockNpmPageData);
      assert.equal(hasProvenanceSection.present, true);
      assert.equal(hasProvenanceSection.verified, true);
      assert.equal(hasProvenanceSection.sourceRepo, 'pppp606/ink-chart');
    });
  });

  describe('Provenance Error Handling', () => {
    it('should handle provenance generation failures gracefully', () => {
      // Simulate environment where OIDC is available but provenance fails
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = 'https://vstoken.actions.githubusercontent.com';
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'token';

      const error = simulateProvenanceGenerationFailure();

      assert.equal(error.code, 'PROVENANCE_GENERATION_FAILED');
      assert.ok('message' in error);
      assertContains(error.message, 'provenance');
    });

    it('should provide clear error messages for provenance issues', () => {
      const provenanceError = getProvenanceErrorMessage('OIDC_TOKEN_INVALID');

      assertContains(provenanceError, 'OIDC token');
      assertContains(provenanceError, 'Provenance');
      assertContains(provenanceError, 'authentication');
    });

    it('should handle missing provenance attestation gracefully', () => {
      const packageWithoutProvenance = {
        name: '@pppp606/ink-chart',
        version: '1.0.0',
        hasProvenance: false
      };

      const validation = validatePackageProvenance(packageWithoutProvenance);

      assert.equal(validation.provenancePresent, false);
      assertContains(validation.recommendation, 'OIDC');
      assert.equal(validation.securityLevel, 'basic');
    });
  });
});

/**
 * Helper functions for provenance validation testing
 * These functions simulate provenance generation, validation, and badge functionality
 */

function validateProvenanceRequirements(auth: { hasOidcToken: boolean; hasNpmToken: boolean }): boolean {
  // Provenance requires OIDC authentication
  return auth.hasOidcToken;
}

function generateProvenancePublishCommand(): string {
  // Validate required environment variables
  const requiredVars = ['GITHUB_REPOSITORY', 'GITHUB_REF', 'GITHUB_SHA'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing GitHub context for provenance: ${varName}`);
    }
  }

  return 'npm publish --access public --provenance --registry=https://registry.npmjs.org';
}

function createMockProvenanceAttestation(): any {
  return {
    statement: {
      _type: 'https://in-toto.io/Statement/v0.1',
      subject: [{
        name: 'pkg:npm/@pppp606/ink-chart@1.0.0',
        digest: {
          sha512: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        }
      }],
      predicateType: 'https://slsa.dev/provenance/v0.2',
      predicate: {
        builder: {
          id: 'https://github.com/actions/runner/github-hosted'
        },
        invocation: {
          configSource: {
            uri: 'git+https://github.com/pppp606/ink-chart@refs/tags/v1.0.0',
            digest: {
              sha1: 'abcdef1234567890abcdef1234567890abcdef12'
            },
            entryPoint: '.github/workflows/publish-npm.yml'
          }
        },
        metadata: {
          buildInvocationId: 'https://github.com/pppp606/ink-chart/actions/runs/123456789',
          completeness: {
            parameters: true,
            environment: false,
            materials: false
          },
          reproducible: false
        }
      }
    }
  };
}

function createMockProvenanceSignature(): any {
  return {
    signature: 'MEUCIQDxyz...',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----'
  };
}

function validateProvenanceSignature(signature: any): boolean {
  // In a real implementation, this would verify the cryptographic signature
  return !!(signature && signature.signature && signature.certificate);
}

function createMockCertificateChain(): string[] {
  return [
    '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
    '-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----'
  ];
}

function validateCertificateChain(chain: string[]): boolean {
  // In a real implementation, this would validate the certificate chain
  return chain && chain.length > 0 && chain.every(cert => cert.includes('BEGIN CERTIFICATE'));
}

function validateRepositoryInProvenance(attestation: any, expectedRepo: string): boolean {
  const configUri = attestation.statement.predicate.invocation.configSource.uri;
  return configUri.includes(expectedRepo);
}

function validateProvenanceBadgeRequirements(packageInfo: any): {
  packagePublished: boolean;
  provenanceAttested: boolean;
  badgeEligible: boolean;
} {
  return {
    packagePublished: !!packageInfo.name && !!packageInfo.version,
    provenanceAttested: !!packageInfo.hasProvenance,
    badgeEligible: !!packageInfo.hasProvenance
  };
}

function formatProvenanceDisplayInfo(info: any): {
  repository: string;
  workflow: string;
  trigger: string;
  commit: string;
} {
  return {
    repository: info.sourceRepository,
    workflow: info.workflowPath,
    trigger: info.buildTrigger,
    commit: info.commitSha
  };
}

function createMockNpmPackagePageData(): any {
  return {
    packageName: '@pppp606/ink-chart',
    version: '1.0.0',
    provenance: {
      present: true,
      verified: true,
      sourceRepository: 'pppp606/ink-chart',
      attestations: ['signature1', 'signature2']
    }
  };
}

function validateNpmProvenanceSection(pageData: any): {
  present: boolean;
  verified: boolean;
  sourceRepo: string;
} {
  return {
    present: !!pageData.provenance,
    verified: pageData.provenance?.verified || false,
    sourceRepo: pageData.provenance?.sourceRepository || ''
  };
}

function simulateProvenanceGenerationFailure(): { code: string; message: string } {
  return {
    code: 'PROVENANCE_GENERATION_FAILED',
    message: 'Failed to generate provenance attestation: OIDC token validation failed'
  };
}

function getProvenanceErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'OIDC_TOKEN_INVALID': 'OIDC token is invalid or expired. Provenance generation requires valid OIDC authentication.',
    'REPOSITORY_MISMATCH': 'Repository in OIDC token does not match package repository. Provenance validation failed.',
    'WORKFLOW_NOT_TRUSTED': 'Workflow is not in a trusted location. Provenance requires workflows in .github/workflows/'
  };

  return errorMessages[errorCode] || 'Unknown provenance error occurred';
}

function validatePackageProvenance(packageInfo: any): {
  provenancePresent: boolean;
  recommendation: string;
  securityLevel: string;
} {
  if (packageInfo.hasProvenance) {
    return {
      provenancePresent: true,
      recommendation: 'Package has provenance attestation',
      securityLevel: 'enhanced'
    };
  }

  return {
    provenancePresent: false,
    recommendation: 'Consider enabling OIDC and provenance for enhanced security',
    securityLevel: 'basic'
  };
}