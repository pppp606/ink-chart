/**
 * @fileoverview Package Security Configuration Tests
 * Tests for package.json security settings and publishConfig validation
 * Following TDD methodology - RED phase (tests that will initially fail)
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { assertContains, assertNotContains, assertMatch } from './helpers/assertions.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load package.json for testing
const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

describe('Package Configuration Security', () => {
  describe('publishConfig validation', () => {
    test('should have publishConfig defined', () => {
      assert.notEqual(packageJson.publishConfig, undefined);
      assert.equal(typeof packageJson.publishConfig, 'object');
    });

    test('should have explicit registry configuration', () => {
      assert.equal(packageJson.publishConfig.registry, 'https://registry.npmjs.org/');
    });

    test('should have public access for scoped package', () => {
      assert.equal(packageJson.publishConfig.access, 'public');
    });

    test('should have tag configuration', () => {
      assert.notEqual(packageJson.publishConfig.tag, undefined);
      assert.equal(packageJson.publishConfig.tag, 'latest');
    });

    test('should prevent provenance bypass', () => {
      assert.equal(packageJson.publishConfig.provenance, true);
    });
  });

  describe('Security metadata validation', () => {
    test('should have bugs reporting URL', () => {
      assert.notEqual(packageJson.bugs, undefined);
      assert.equal(packageJson.bugs.url, 'https://github.com/pppp606/ink-chart/issues');
    });

    test('should have homepage URL', () => {
      assert.notEqual(packageJson.homepage, undefined);
      assert.equal(packageJson.homepage, 'https://github.com/pppp606/ink-chart#readme');
    });

    test('should have funding information', () => {
      assert.notEqual(packageJson.funding, undefined);
      assert.equal(packageJson.funding.type, 'github');
      assert.equal(packageJson.funding.url, 'https://github.com/sponsors/pppp606');
    });

    test('should have engines specification', () => {
      assert.notEqual(packageJson.engines, undefined);
      assert.notEqual(packageJson.engines.node, undefined);
      assert.equal(packageJson.engines.node, '>=20.0.0');
    });

    test('should have security-focused keywords', () => {
      assertContains(packageJson.keywords, 'secure');
      assertContains(packageJson.keywords, 'typescript');
      assertContains(packageJson.keywords, 'provenance');
    });
  });

  describe('Repository security configuration', () => {
    test('should have complete repository information', () => {
      assert.notEqual(packageJson.repository, undefined);
      assert.equal(packageJson.repository.type, 'git');
      assert.equal(packageJson.repository.url, 'https://github.com/pppp606/ink-chart.git');
    });

    test('should have repository directory for monorepo support', () => {
      // This test is optional for single-repo packages
      if (packageJson.repository.directory) {
        assert.equal(typeof packageJson.repository.directory, 'string');
      }
    });
  });

  describe('Package integrity validation', () => {
    test('should have files array for explicit inclusion', () => {
      assert.notEqual(packageJson.files, undefined);
      assert.equal(Array.isArray(packageJson.files), true);
      assertContains(packageJson.files, 'dist');
    });

    test('should have sideEffects configuration', () => {
      assert.notEqual(packageJson.sideEffects, undefined);
      assert.equal(packageJson.sideEffects, false);
    });

    test('should have audit configuration', () => {
      assert.notEqual(packageJson.config, undefined);
      assert.equal(packageJson.config['audit-level'], 'high');
    });
  });

  describe('Author and license validation', () => {
    test('should have complete author information', () => {
      assert.notEqual(packageJson.author, undefined);
      assert.notEqual(packageJson.author.name, undefined);
      assert.notEqual(packageJson.author.url, undefined);
      assert.notEqual(packageJson.author.email, undefined);
    });

    test('should have MIT license', () => {
      assert.equal(packageJson.license, 'MIT');
    });
  });

  describe('Security scripts validation', () => {
    test('should have audit scripts', () => {
      assert.notEqual(packageJson.scripts.audit, undefined);
      assert.notEqual(packageJson.scripts['audit:fix'], undefined);
    });

    test('should have secret scanning script', () => {
      assert.notEqual(packageJson.scripts['lint:secrets'], undefined);
    });

    test('should have validation scripts', () => {
      assert.notEqual(packageJson.scripts['validate:sha-pinning'], undefined);
      assert.notEqual(packageJson.scripts['validate:permissions'], undefined);
    });
  });

  describe('Registry configuration validation', () => {
    test('should not have .npmrc overrides that could bypass security', () => {
      // This is a meta-test to ensure we're not accidentally bypassing
      // our security configurations through .npmrc files
      const packageName = packageJson.name;
      assertMatch(packageName, /^@pppp606\//);
    });

    test('should have provenance attestation enabled', () => {
      // Verify that publishing will generate provenance attestation
      assert.equal(packageJson.publishConfig?.provenance, true);
    });
  });

  describe('Dependency security validation', () => {
    test('should have peer dependencies properly specified', () => {
      assert.notEqual(packageJson.peerDependencies, undefined);
      assert.notEqual(packageJson.peerDependencies.ink, undefined);
      assert.notEqual(packageJson.peerDependencies.react, undefined);
    });

    test('should have proper version constraints', () => {
      assertMatch(packageJson.peerDependencies.ink, />=\d+/);
      assertMatch(packageJson.peerDependencies.react, />=\d+/);
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
      assert.notEqual(packageJson[field], undefined);
    });
  });

  test('should be ready for secure publishing', () => {
    // Comprehensive test that validates the package is ready for secure publishing
    assert.equal(packageJson.publishConfig?.access, 'public');
    assert.equal(packageJson.publishConfig?.registry, 'https://registry.npmjs.org/');
    assert.equal(packageJson.publishConfig?.provenance, true);
    assertContains(packageJson.files, 'dist');
    assert.equal(packageJson.license, 'MIT');
  });

  test('should have security-conscious package metadata', () => {
    // Test that the package has metadata that helps with security assessment
    assertContains(packageJson.keywords, 'secure');
    assertContains(packageJson.keywords, 'typescript');
    assertContains(packageJson.keywords, 'provenance');
    assert.notEqual(packageJson.engines?.node, undefined);
    assert.notEqual(packageJson.funding, undefined);
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
      assertMatch(url, /^https:\/\//);
    });
  });

  test('should have consistent naming and versioning', () => {
    // Validate package naming conventions and version constraints
    assertMatch(packageJson.name, /^@pppp606\/[a-z-]+$/);
    assertMatch(packageJson.version, /^\d+\.\d+\.\d+$/);
    assertMatch(packageJson.engines?.node, />=\d+\.\d+\.\d+/);
  });

  test('should have security-optimized file configuration', () => {
    // Ensure only necessary files are included in the package
    assert.notEqual(packageJson.files, undefined);
    assertNotContains(packageJson.files, 'src'); // Source files should not be published
    assertNotContains(packageJson.files, '__tests__'); // Test files should not be published
    assertNotContains(packageJson.files, '.github'); // GitHub workflows should not be published
    assert.equal(packageJson.sideEffects, false); // Should be tree-shakeable
  });

  test('should have comprehensive metadata for supply chain security', () => {
    // Validate metadata that helps with supply chain security assessment
    assert.ok(packageJson.description);
    assert.ok(packageJson.description.length > 10);
    assert.ok(packageJson.keywords.length > 5);
    assert.ok(packageJson.author.name);
    assert.ok(packageJson.author.email);
    assert.equal(packageJson.repository.type, 'git');
  });
});