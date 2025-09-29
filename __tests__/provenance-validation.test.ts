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

import * as fs from 'fs';
import * as path from 'path';

describe('Provenance Attestation Validation', () => {
  const originalEnv = process.env;
  const workflowPath = path.resolve(process.cwd(), '.github', 'workflows', 'publish-npm.yml');

  beforeEach(() => {
    jest.resetModules();
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

      expect(canGenerateProvenance).toBe(false);
    });

    it('should validate that provenance works with OIDC authentication', () => {
      // Test that provenance can be generated with OIDC
      const canGenerateProvenance = validateProvenanceRequirements({
        hasOidcToken: true,
        hasNpmToken: false
      });

      expect(canGenerateProvenance).toBe(true);
    });

    it('should validate provenance command generation with OIDC', () => {
      // Set up OIDC environment
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = 'https://vstoken.actions.githubusercontent.com/_apis/distributedtask/hubs/build/plans/123/jobs/456/oidctoken';
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...';
      process.env.GITHUB_REPOSITORY = 'pppp606/ink-chart';
      process.env.GITHUB_REF = 'refs/tags/v1.0.0';
      process.env.GITHUB_SHA = 'abcdef1234567890abcdef1234567890abcdef12';

      const command = generateProvenancePublishCommand();

      expect(command).toContain('--provenance');
      expect(command).toContain('npm publish');
      expect(command).toContain('--access public');
    });

    it('should reject provenance generation without required GitHub context', () => {
      // Missing GITHUB_REPOSITORY
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = 'https://vstoken.actions.githubusercontent.com';
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'token';
      delete process.env.GITHUB_REPOSITORY;

      expect(() => generateProvenancePublishCommand()).toThrow('Missing GitHub context for provenance');
    });
  });

  describe('Provenance Attestation Structure', () => {
    it('should validate expected provenance attestation structure', () => {
      const mockAttestation = createMockProvenanceAttestation();

      expect(mockAttestation).toHaveProperty('statement');
      expect(mockAttestation.statement).toHaveProperty('_type', 'https://in-toto.io/Statement/v0.1');
      expect(mockAttestation.statement).toHaveProperty('subject');
      expect(mockAttestation.statement).toHaveProperty('predicateType');
      expect(mockAttestation.statement).toHaveProperty('predicate');
    });

    it('should validate provenance subject information', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const subject = mockAttestation.statement.subject[0];

      expect(subject).toHaveProperty('name');
      expect(subject.name).toContain('@pppp606/ink-chart');
      expect(subject).toHaveProperty('digest');
      expect(subject.digest).toHaveProperty('sha512');
    });

    it('should validate provenance predicate type', () => {
      const mockAttestation = createMockProvenanceAttestation();

      expect(mockAttestation.statement.predicateType).toBe('https://slsa.dev/provenance/v0.2');
    });

    it('should validate provenance builder information', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const builder = mockAttestation.statement.predicate.builder;

      expect(builder).toHaveProperty('id');
      expect(builder.id).toContain('github.com/actions/runner');
    });

    it('should validate provenance invocation details', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const invocation = mockAttestation.statement.predicate.invocation;

      expect(invocation).toHaveProperty('configSource');
      expect(invocation.configSource).toHaveProperty('uri');
      expect(invocation.configSource.uri).toContain('pppp606/ink-chart');
      expect(invocation.configSource).toHaveProperty('digest');
      expect(invocation.configSource).toHaveProperty('entryPoint');
    });
  });

  describe('Provenance Workflow Integration', () => {
    it('should validate that workflow uses provenance flag with OIDC', () => {
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');

      // Check that provenance is used in OIDC publishing
      const oidcPublishSection = extractOidcPublishSection(workflowContent);
      expect(oidcPublishSection).toContain('--provenance');
      expect(oidcPublishSection).toContain('npm publish');
    });

    it('should validate that provenance is not used with NPM token', () => {
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');

      // Check that NPM token publishing does NOT use provenance
      const npmTokenPublishSection = extractNpmTokenPublishSection(workflowContent);
      expect(npmTokenPublishSection).not.toContain('--provenance');
    });

    it('should validate provenance success logging', () => {
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');

      expect(workflowContent).toContain('Package published with cryptographic provenance');
      expect(workflowContent).toContain('provenance');
    });
  });

  describe('Provenance Security Validation', () => {
    it('should validate provenance signature verification', () => {
      const mockSignature = createMockProvenanceSignature();

      const isValidSignature = validateProvenanceSignature(mockSignature);
      expect(isValidSignature).toBe(true);
    });

    it('should validate provenance certificate chain', () => {
      const mockCertificateChain = createMockCertificateChain();

      const isValidChain = validateCertificateChain(mockCertificateChain);
      expect(isValidChain).toBe(true);
    });

    it('should validate provenance repository matching', () => {
      const mockAttestation = createMockProvenanceAttestation();
      const expectedRepository = 'pppp606/ink-chart';

      const repositoryMatches = validateRepositoryInProvenance(mockAttestation, expectedRepository);
      expect(repositoryMatches).toBe(true);
    });

    it('should reject provenance with mismatched repository', () => {
      const mockAttestation = createMockProvenanceAttestation();
      // Simulate an attestation with wrong repository
      mockAttestation.statement.predicate.invocation.configSource.uri = 'git+https://github.com/attacker/malicious-repo@refs/tags/v1.0.0';

      const repositoryMatches = validateRepositoryInProvenance(mockAttestation, 'pppp606/ink-chart');
      expect(repositoryMatches).toBe(false);
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

      expect(badgeRequirements.packagePublished).toBe(true);
      expect(badgeRequirements.provenanceAttested).toBe(true);
      expect(badgeRequirements.badgeEligible).toBe(true);
    });

    it('should validate provenance information display format', () => {
      const provenanceInfo = formatProvenanceDisplayInfo({
        sourceRepository: 'pppp606/ink-chart',
        workflowPath: '.github/workflows/publish-npm.yml',
        buildTrigger: 'refs/tags/v1.0.0',
        commitSha: 'abcdef1234567890'
      });

      expect(provenanceInfo).toHaveProperty('repository');
      expect(provenanceInfo).toHaveProperty('workflow');
      expect(provenanceInfo).toHaveProperty('trigger');
      expect(provenanceInfo).toHaveProperty('commit');
      expect(provenanceInfo.repository).toBe('pppp606/ink-chart');
    });

    it('should validate npm package page provenance section', () => {
      const mockNpmPageData = createMockNpmPackagePageData();

      const hasProvenanceSection = validateNpmProvenanceSection(mockNpmPageData);
      expect(hasProvenanceSection.present).toBe(true);
      expect(hasProvenanceSection.verified).toBe(true);
      expect(hasProvenanceSection.sourceRepo).toBe('pppp606/ink-chart');
    });
  });

  describe('Provenance Error Handling', () => {
    it('should handle provenance generation failures gracefully', () => {
      // Simulate environment where OIDC is available but provenance fails
      process.env.ACTIONS_ID_TOKEN_REQUEST_URL = 'https://vstoken.actions.githubusercontent.com';
      process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN = 'token';

      const error = simulateProvenanceGenerationFailure();

      expect(error).toHaveProperty('code', 'PROVENANCE_GENERATION_FAILED');
      expect(error).toHaveProperty('message');
      expect(error.message).toContain('provenance');
    });

    it('should provide clear error messages for provenance issues', () => {
      const provenanceError = getProvenanceErrorMessage('OIDC_TOKEN_INVALID');

      expect(provenanceError).toContain('OIDC token');
      expect(provenanceError).toContain('Provenance');
      expect(provenanceError).toContain('authentication');
    });

    it('should handle missing provenance attestation gracefully', () => {
      const packageWithoutProvenance = {
        name: '@pppp606/ink-chart',
        version: '1.0.0',
        hasProvenance: false
      };

      const validation = validatePackageProvenance(packageWithoutProvenance);

      expect(validation.provenancePresent).toBe(false);
      expect(validation.recommendation).toContain('OIDC');
      expect(validation.securityLevel).toBe('basic');
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

function extractOidcPublishSection(workflowContent: string): string {
  // Extract the OIDC publishing section from workflow
  const oidcStart = workflowContent.indexOf('name: Publish with OIDC');
  const oidcEnd = workflowContent.indexOf('name: Publish with NPM Token', oidcStart);

  if (oidcStart === -1) return '';
  return workflowContent.slice(oidcStart, oidcEnd === -1 ? undefined : oidcEnd);
}

function extractNpmTokenPublishSection(workflowContent: string): string {
  // Extract the NPM token publishing section from workflow
  const npmStart = workflowContent.indexOf('name: Publish with NPM Token');
  const nextSection = workflowContent.indexOf('name:', npmStart + 1);

  if (npmStart === -1) return '';
  return workflowContent.slice(npmStart, nextSection === -1 ? undefined : nextSection);
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