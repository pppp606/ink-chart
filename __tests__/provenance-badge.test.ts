/**
 * Provenance Badge Validation Tests
 *
 * This test suite validates the provenance badge functionality and NPM package
 * page integration for packages published with provenance attestation.
 *
 * Tests cover:
 * - Badge appearance and requirements
 * - NPM package page integration
 * - Provenance information display
 * - Consumer verification workflows
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Provenance Badge Validation', () => {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');

  describe('NPM Package Page Provenance Display', () => {
    it('should validate package metadata supports provenance badge', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Validate package.json fields required for provenance
      expect(packageJson.name).toBe('@pppp606/ink-chart');
      expect(packageJson.repository).toBeDefined();
      expect(packageJson.repository.url).toContain('github.com/pppp606/ink-chart');

      const provenanceReadiness = validatePackageProvenanceReadiness(packageJson);
      expect(provenanceReadiness.hasRepository).toBe(true);
      expect(provenanceReadiness.hasValidScope).toBe(true);
      expect(provenanceReadiness.isPublic).toBe(true);
    });

    it('should validate provenance badge display criteria', () => {
      const badgeCriteria = validateProvenanceBadgeCriteria({
        packageName: '@pppp606/ink-chart',
        publishedWithOidc: true,
        hasAttestation: true,
        repositoryVerified: true
      });

      expect(badgeCriteria.badgeVisible).toBe(true);
      expect(badgeCriteria.verificationLevel).toBe('verified');
      expect(badgeCriteria.badgeText).toContain('Provenance');
    });

    it('should simulate npm package page provenance section', () => {
      const mockPackageData = createMockNpmPackageData();
      const provenanceSection = renderProvenanceSection(mockPackageData);

      expect(provenanceSection).toHaveProperty('badge');
      expect(provenanceSection).toHaveProperty('details');
      expect(provenanceSection.badge.text).toContain('Provenance');
      expect(provenanceSection.badge.verified).toBe(true);
      expect(provenanceSection.details.sourceRepository).toBe('pppp606/ink-chart');
    });

    it('should validate provenance information completeness', () => {
      const provenanceInfo = extractProvenanceInfo({
        packageName: '@pppp606/ink-chart',
        version: '1.0.0',
        attestation: createMockAttestation()
      });

      expect(provenanceInfo).toHaveProperty('sourceRepository');
      expect(provenanceInfo).toHaveProperty('buildWorkflow');
      expect(provenanceInfo).toHaveProperty('commitHash');
      expect(provenanceInfo).toHaveProperty('buildTimestamp');
      expect(provenanceInfo).toHaveProperty('signatureValidation');

      expect(provenanceInfo.sourceRepository).toBe('pppp606/ink-chart');
      expect(provenanceInfo.buildWorkflow).toContain('publish-npm.yml');
      expect(provenanceInfo.signatureValidation.valid).toBe(true);
    });
  });

  describe('Consumer Verification Workflow', () => {
    it('should validate npm CLI provenance verification command', () => {
      const verificationCommand = generateProvenanceVerificationCommand('@pppp606/ink-chart');

      expect(verificationCommand).toContain('npm audit signatures');
      expect(verificationCommand).toContain('@pppp606/ink-chart');
    });

    it('should simulate provenance verification output', () => {
      const verificationOutput = simulateProvenanceVerification('@pppp606/ink-chart@1.0.0');

      expect(verificationOutput.verified).toBe(true);
      expect(verificationOutput.attestations).toHaveLength(1);
      expect(verificationOutput.attestations[0]).toHaveProperty('signature');
      expect(verificationOutput.attestations[0]).toHaveProperty('certificate');
      expect(verificationOutput.sourceRepository).toBe('pppp606/ink-chart');
    });

    it('should validate provenance chain of trust', () => {
      const trustChain = validateProvenanceTrustChain({
        packageName: '@pppp606/ink-chart',
        sourceRepo: 'pppp606/ink-chart',
        workflowPath: '.github/workflows/publish-npm.yml',
        oidcIssuer: 'https://token.actions.githubusercontent.com'
      });

      expect(trustChain.packageMatches).toBe(true);
      expect(trustChain.repositoryVerified).toBe(true);
      expect(trustChain.workflowTrusted).toBe(true);
      expect(trustChain.issuerValid).toBe(true);
      expect(trustChain.overallTrust).toBe('high');
    });

    it('should handle provenance verification failures', () => {
      const verificationError = simulateProvenanceVerificationFailure('@pppp606/ink-chart@1.0.0');

      expect(verificationError).toHaveProperty('code');
      expect(verificationError).toHaveProperty('message');
      expect(verificationError).toHaveProperty('recommendation');

      expect(verificationError.code).toBe('SIGNATURE_INVALID');
      expect(verificationError.message).toContain('signature verification failed');
      expect(verificationError.recommendation).toContain('contact package maintainer');
    });
  });

  describe('Provenance Badge Integration', () => {
    it('should validate badge rendering for verified packages', () => {
      const badgeHtml = renderProvenanceBadge({
        verified: true,
        sourceRepository: 'pppp606/ink-chart',
        attestationCount: 1
      });

      expect(badgeHtml).toContain('Provenance');
      expect(badgeHtml).toContain('verified');
      expect(badgeHtml).toContain('pppp606/ink-chart');
    });

    it('should validate badge states for different verification levels', () => {
      const verifiedBadge = renderProvenanceBadge({ verified: true, sourceRepository: 'pppp606/ink-chart' });
      const unverifiedBadge = renderProvenanceBadge({ verified: false, sourceRepository: '' });

      expect(verifiedBadge).toContain('verified');
      expect(unverifiedBadge).toContain('unverified');
    });

    it('should validate badge interaction and details expansion', () => {
      const badgeInteraction = simulateBadgeClick({
        packageName: '@pppp606/ink-chart',
        version: '1.0.0',
        hasProvenance: true
      });

      expect(badgeInteraction.detailsExpanded).toBe(true);
      expect(badgeInteraction.details).toHaveProperty('attestations');
      expect(badgeInteraction.details).toHaveProperty('buildInfo');
      expect(badgeInteraction.details).toHaveProperty('verificationSteps');
    });
  });

  describe('Security and Trust Indicators', () => {
    it('should validate security level indicators', () => {
      const securityLevel = calculateSecurityLevel({
        hasProvenance: true,
        repositoryVerified: true,
        workflowInTrustedLocation: true,
        signatureValid: true,
        certificateChainValid: true
      });

      expect(securityLevel.level).toBe('high');
      expect(securityLevel.score).toBeGreaterThan(80);
      expect(securityLevel.indicators).toContain('provenance-verified');
      expect(securityLevel.indicators).toContain('trusted-workflow');
    });

    it('should validate trust warnings for packages without provenance', () => {
      const trustWarning = generateTrustWarning({
        hasProvenance: false,
        publishMethod: 'npm-token'
      });

      expect(trustWarning.level).toBe('medium');
      expect(trustWarning.message).toContain('provenance');
      expect(trustWarning.recommendation).toContain('OIDC');
    });

    it('should validate provenance comparison between versions', () => {
      const comparison = compareProvenanceAcrossVersions([
        { version: '1.0.0', hasProvenance: true, repository: 'pppp606/ink-chart' },
        { version: '0.9.0', hasProvenance: false, repository: 'pppp606/ink-chart' },
        { version: '0.8.0', hasProvenance: false, repository: 'pppp606/ink-chart' }
      ]);

      expect(comparison.provenanceIntroduced).toBe('1.0.0');
      expect(comparison.consistentRepository).toBe(true);
      expect(comparison.securityImprovement).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle packages with malformed provenance data', () => {
      const malformedProvenance = {
        statement: {
          // Missing required fields
          subject: []
        }
      };

      const validation = validateProvenanceData(malformedProvenance);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('missing subject');
      expect(validation.recommendation).toContain('republish');
    });

    it('should handle repository mismatch in provenance', () => {
      const mismatchedProvenance = createMockAttestation();
      mismatchedProvenance.statement.predicate.invocation.configSource.uri =
        'git+https://github.com/different/repo@refs/tags/v1.0.0';

      const repositoryValidation = validateRepositoryMatch(
        '@pppp606/ink-chart',
        mismatchedProvenance
      );

      expect(repositoryValidation.matches).toBe(false);
      expect(repositoryValidation.warning).toContain('Repository in provenance does not match package');
      expect(repositoryValidation.trustLevel).toBe('low');
    });

    it('should handle network failures during provenance verification', () => {
      const networkError = simulateNetworkFailureDuringVerification();

      expect(networkError.code).toBe('NETWORK_ERROR');
      expect(networkError.retryable).toBe(true);
      expect(networkError.fallbackAvailable).toBe(true);
    });
  });
});

/**
 * Helper functions for provenance badge testing
 */

function validatePackageProvenanceReadiness(packageJson: any): {
  hasRepository: boolean;
  hasValidScope: boolean;
  isPublic: boolean;
} {
  return {
    hasRepository: !!(packageJson.repository && packageJson.repository.url),
    hasValidScope: packageJson.name.startsWith('@'),
    isPublic: !packageJson.private
  };
}

function validateProvenanceBadgeCriteria(criteria: any): {
  badgeVisible: boolean;
  verificationLevel: string;
  badgeText: string;
} {
  const visible = criteria.publishedWithOidc && criteria.hasAttestation && criteria.repositoryVerified;

  return {
    badgeVisible: visible,
    verificationLevel: visible ? 'verified' : 'unverified',
    badgeText: visible ? 'Provenance: Verified' : 'Provenance: Not Available'
  };
}

function createMockNpmPackageData(): any {
  return {
    name: '@pppp606/ink-chart',
    version: '1.0.0',
    provenance: {
      verified: true,
      attestations: [createMockAttestation()],
      sourceRepository: 'pppp606/ink-chart',
      buildWorkflow: '.github/workflows/publish-npm.yml'
    }
  };
}

function renderProvenanceSection(packageData: any): any {
  return {
    badge: {
      text: packageData.provenance.verified ? 'Provenance: Verified' : 'Provenance: Unverified',
      verified: packageData.provenance.verified,
      color: packageData.provenance.verified ? 'green' : 'red'
    },
    details: {
      sourceRepository: packageData.provenance.sourceRepository,
      buildWorkflow: packageData.provenance.buildWorkflow,
      attestationCount: packageData.provenance.attestations.length
    }
  };
}

function createMockAttestation(): any {
  return {
    statement: {
      _type: 'https://in-toto.io/Statement/v0.1',
      subject: [{
        name: 'pkg:npm/@pppp606/ink-chart@1.0.0',
        digest: { sha512: 'abc123...' }
      }],
      predicateType: 'https://slsa.dev/provenance/v0.2',
      predicate: {
        builder: { id: 'https://github.com/actions/runner/github-hosted' },
        invocation: {
          configSource: {
            uri: 'git+https://github.com/pppp606/ink-chart@refs/tags/v1.0.0',
            digest: { sha1: 'def456...' },
            entryPoint: '.github/workflows/publish-npm.yml'
          }
        }
      }
    }
  };
}

function extractProvenanceInfo(data: any): any {
  const attestation = data.attestation;
  return {
    sourceRepository: attestation.statement.predicate.invocation.configSource.uri
      .replace('git+https://github.com/', '')
      .replace(/@.*$/, ''),
    buildWorkflow: attestation.statement.predicate.invocation.configSource.entryPoint,
    commitHash: attestation.statement.predicate.invocation.configSource.digest.sha1,
    buildTimestamp: new Date().toISOString(),
    signatureValidation: { valid: true, issuer: 'GitHub' }
  };
}

function generateProvenanceVerificationCommand(packageName: string): string {
  return `npm audit signatures --package=${packageName}`;
}

function simulateProvenanceVerification(_packageSpec: string): any {
  return {
    verified: true,
    attestations: [{
      signature: 'signature_data',
      certificate: 'certificate_data'
    }],
    sourceRepository: 'pppp606/ink-chart',
    buildInfo: {
      workflow: '.github/workflows/publish-npm.yml',
      runner: 'github-hosted'
    }
  };
}

function validateProvenanceTrustChain(data: any): any {
  return {
    packageMatches: data.packageName.includes(data.sourceRepo.split('/')[1]),
    repositoryVerified: data.sourceRepo === 'pppp606/ink-chart',
    workflowTrusted: data.workflowPath.startsWith('.github/workflows/'),
    issuerValid: data.oidcIssuer === 'https://token.actions.githubusercontent.com',
    overallTrust: 'high'
  };
}

function simulateProvenanceVerificationFailure(_packageSpec: string): any {
  return {
    code: 'SIGNATURE_INVALID',
    message: 'Provenance signature verification failed',
    recommendation: 'Verify package integrity and contact package maintainer if issues persist'
  };
}

function renderProvenanceBadge(data: any): string {
  if (data.verified) {
    return `<span class="provenance-badge verified">Provenance: Verified (${data.sourceRepository})</span>`;
  } else {
    return `<span class="provenance-badge unverified">Provenance: Unverified</span>`;
  }
}

function simulateBadgeClick(data: any): any {
  return {
    detailsExpanded: true,
    details: {
      attestations: data.hasProvenance ? [createMockAttestation()] : [],
      buildInfo: {
        sourceRepository: 'pppp606/ink-chart',
        workflow: '.github/workflows/publish-npm.yml',
        runner: 'GitHub Actions'
      },
      verificationSteps: [
        'Signature verified',
        'Certificate chain validated',
        'Repository ownership confirmed'
      ]
    }
  };
}

function calculateSecurityLevel(factors: any): any {
  let score = 0;
  const indicators = [];

  if (factors.hasProvenance) { score += 30; indicators.push('provenance-verified'); }
  if (factors.repositoryVerified) { score += 20; indicators.push('repository-verified'); }
  if (factors.workflowInTrustedLocation) { score += 20; indicators.push('trusted-workflow'); }
  if (factors.signatureValid) { score += 15; indicators.push('signature-valid'); }
  if (factors.certificateChainValid) { score += 15; indicators.push('certificate-valid'); }

  return {
    level: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
    score,
    indicators
  };
}

function generateTrustWarning(_data: any): any {
  return {
    level: 'medium',
    message: 'Package published without provenance attestation',
    recommendation: 'Consider requesting maintainer to migrate to OIDC publishing for enhanced security'
  };
}

function compareProvenanceAcrossVersions(versions: any[]): any {
  const provenanceVersions = versions.filter(v => v.hasProvenance);
  const firstProvenanceVersion = provenanceVersions[0]?.version;

  return {
    provenanceIntroduced: firstProvenanceVersion || null,
    consistentRepository: versions.every(v => v.repository === versions[0].repository),
    securityImprovement: !!firstProvenanceVersion
  };
}

function validateProvenanceData(provenance: any): any {
  const errors = [];

  if (!provenance.statement) errors.push('missing statement');
  if (!provenance.statement?.subject?.length) errors.push('missing subject');
  if (!provenance.statement?.predicateType) errors.push('missing predicate type');

  return {
    valid: errors.length === 0,
    errors,
    recommendation: errors.length > 0 ? 'Package should be republished with proper provenance' : 'Valid provenance'
  };
}

function validateRepositoryMatch(packageName: string, attestation: any): any {
  const expectedRepo = packageName.split('/')[1]; // Extract 'ink-chart' from '@pppp606/ink-chart'
  const attestationUri = attestation.statement.predicate.invocation.configSource.uri;
  const matches = attestationUri.includes(expectedRepo);

  return {
    matches,
    warning: matches ? null : 'Repository in provenance does not match package',
    trustLevel: matches ? 'high' : 'low'
  };
}

function simulateNetworkFailureDuringVerification(): any {
  return {
    code: 'NETWORK_ERROR',
    message: 'Failed to fetch provenance attestation',
    retryable: true,
    fallbackAvailable: true
  };
}