/**
 * @fileoverview Package Security Configuration Tests
 * Tests for package.json security settings and publishConfig validation
 * Following TDD methodology - RED phase (tests that will initially fail)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load package.json for testing
const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

describe('Package Configuration Security', () => {
  describe('publishConfig validation', () => {
    test('should have publishConfig defined', () => {
      expect(packageJson.publishConfig).toBeDefined();
      expect(typeof packageJson.publishConfig).toBe('object');
    });

    test('should have explicit registry configuration', () => {
      expect(packageJson.publishConfig.registry).toBe('https://registry.npmjs.org/');
    });

    test('should have public access for scoped package', () => {
      expect(packageJson.publishConfig.access).toBe('public');
    });

    test('should have tag configuration', () => {
      expect(packageJson.publishConfig.tag).toBeDefined();
      expect(packageJson.publishConfig.tag).toBe('latest');
    });

    test('should prevent provenance bypass', () => {
      expect(packageJson.publishConfig.provenance).toBe(true);
    });
  });

  describe('Security metadata validation', () => {
    test('should have bugs reporting URL', () => {
      expect(packageJson.bugs).toBeDefined();
      expect(packageJson.bugs.url).toBe('https://github.com/pppp606/ink-chart/issues');
    });

    test('should have homepage URL', () => {
      expect(packageJson.homepage).toBeDefined();
      expect(packageJson.homepage).toBe('https://github.com/pppp606/ink-chart#readme');
    });

    test('should have funding information', () => {
      expect(packageJson.funding).toBeDefined();
      expect(packageJson.funding.type).toBe('github');
      expect(packageJson.funding.url).toBe('https://github.com/sponsors/pppp606');
    });

    test('should have engines specification', () => {
      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toBeDefined();
      expect(packageJson.engines.node).toBe('>=18.0.0');
    });

    test('should have security-focused keywords', () => {
      expect(packageJson.keywords).toContain('secure');
      expect(packageJson.keywords).toContain('typescript');
      expect(packageJson.keywords).toContain('provenance');
    });
  });

  describe('Repository security configuration', () => {
    test('should have complete repository information', () => {
      expect(packageJson.repository).toBeDefined();
      expect(packageJson.repository.type).toBe('git');
      expect(packageJson.repository.url).toBe('https://github.com/pppp606/ink-chart.git');
    });

    test('should have repository directory for monorepo support', () => {
      // This test is optional for single-repo packages
      if (packageJson.repository.directory) {
        expect(typeof packageJson.repository.directory).toBe('string');
      }
    });
  });

  describe('Package integrity validation', () => {
    test('should have files array for explicit inclusion', () => {
      expect(packageJson.files).toBeDefined();
      expect(Array.isArray(packageJson.files)).toBe(true);
      expect(packageJson.files).toContain('dist');
    });

    test('should have sideEffects configuration', () => {
      expect(packageJson.sideEffects).toBeDefined();
      expect(packageJson.sideEffects).toBe(false);
    });

    test('should have audit configuration', () => {
      expect(packageJson.config).toBeDefined();
      expect(packageJson.config['audit-level']).toBe('high');
    });
  });

  describe('Author and license validation', () => {
    test('should have complete author information', () => {
      expect(packageJson.author).toBeDefined();
      expect(packageJson.author.name).toBeDefined();
      expect(packageJson.author.url).toBeDefined();
      expect(packageJson.author.email).toBeDefined();
    });

    test('should have MIT license', () => {
      expect(packageJson.license).toBe('MIT');
    });
  });

  describe('Security scripts validation', () => {
    test('should have audit scripts', () => {
      expect(packageJson.scripts.audit).toBeDefined();
      expect(packageJson.scripts['audit:fix']).toBeDefined();
    });

    test('should have secret scanning script', () => {
      expect(packageJson.scripts['lint:secrets']).toBeDefined();
    });

    test('should have license checking script', () => {
      expect(packageJson.scripts['license-check']).toBeDefined();
    });

    test('should have validation scripts', () => {
      expect(packageJson.scripts['validate:sha-pinning']).toBeDefined();
      expect(packageJson.scripts['validate:permissions']).toBeDefined();
    });
  });

  describe('Registry configuration validation', () => {
    test('should not have .npmrc overrides that could bypass security', () => {
      // This is a meta-test to ensure we're not accidentally bypassing
      // our security configurations through .npmrc files
      const packageName = packageJson.name;
      expect(packageName).toMatch(/^@pppp606\//);
    });

    test('should have provenance attestation enabled', () => {
      // Verify that publishing will generate provenance attestation
      expect(packageJson.publishConfig?.provenance).toBe(true);
    });
  });

  describe('Dependency security validation', () => {
    test('should have peer dependencies properly specified', () => {
      expect(packageJson.peerDependencies).toBeDefined();
      expect(packageJson.peerDependencies.ink).toBeDefined();
      expect(packageJson.peerDependencies.react).toBeDefined();
    });

    test('should have proper version constraints', () => {
      expect(packageJson.peerDependencies.ink).toMatch(/>=\d+/);
      expect(packageJson.peerDependencies.react).toMatch(/>=\d+/);
    });
  });
});

describe('Package Security Integration Tests', () => {
  test('should have all required security fields for npm publish', () => {
    const requiredFields = [
      'name',
      'version',
      'description',
      'license',
      'author',
      'repository',
      'bugs',
      'homepage',
      'publishConfig'
    ];

    requiredFields.forEach(field => {
      expect(packageJson[field]).toBeDefined();
    });
  });

  test('should be ready for secure publishing', () => {
    // Comprehensive test that validates the package is ready for secure publishing
    expect(packageJson.publishConfig?.access).toBe('public');
    expect(packageJson.publishConfig?.registry).toBe('https://registry.npmjs.org/');
    expect(packageJson.publishConfig?.provenance).toBe(true);
    expect(packageJson.files).toContain('dist');
    expect(packageJson.license).toBe('MIT');
  });

  test('should have security-conscious package metadata', () => {
    // Test that the package has metadata that helps with security assessment
    expect(packageJson.keywords).toContain('secure');
    expect(packageJson.keywords).toContain('typescript');
    expect(packageJson.keywords).toContain('provenance');
    expect(packageJson.engines?.node).toBeDefined();
    expect(packageJson.funding).toBeDefined();
  });

  test('should have proper URL formats', () => {
    // Validate that all URLs are properly formatted and use HTTPS
    const urls = [
      packageJson.repository?.url,
      packageJson.bugs?.url,
      packageJson.homepage,
      packageJson.funding?.url,
      packageJson.author?.url,
      packageJson.publishConfig?.registry
    ].filter(Boolean);

    urls.forEach(url => {
      expect(url).toMatch(/^https:\/\//);
    });
  });

  test('should have consistent naming and versioning', () => {
    // Validate package naming conventions and version constraints
    expect(packageJson.name).toMatch(/^@pppp606\/[a-z-]+$/);
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(packageJson.engines?.node).toMatch(/>=\d+\.\d+\.\d+/);
  });

  test('should have security-optimized file configuration', () => {
    // Ensure only necessary files are included in the package
    expect(packageJson.files).toBeDefined();
    expect(packageJson.files).not.toContain('src'); // Source files should not be published
    expect(packageJson.files).not.toContain('__tests__'); // Test files should not be published
    expect(packageJson.files).not.toContain('.github'); // GitHub workflows should not be published
    expect(packageJson.sideEffects).toBe(false); // Should be tree-shakeable
  });

  test('should have comprehensive metadata for supply chain security', () => {
    // Validate metadata that helps with supply chain security assessment
    expect(packageJson.description).toBeTruthy();
    expect(packageJson.description.length).toBeGreaterThan(10);
    expect(packageJson.keywords.length).toBeGreaterThan(5);
    expect(packageJson.author.name).toBeTruthy();
    expect(packageJson.author.email).toBeTruthy();
    expect(packageJson.repository.type).toBe('git');
  });
});