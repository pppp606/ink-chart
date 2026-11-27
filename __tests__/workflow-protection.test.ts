/**
 * Workflow Protection Tests
 *
 * Tests for GitHub repository workflow protection mechanisms including:
 * - CODEOWNERS file validation
 * - Branch protection documentation
 * - Security documentation completeness
 * - Workflow security configuration
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { assertMatch } from './helpers/assertions.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Workflow Protection', () => {
  const rootDir = process.cwd();
  const githubDir = join(rootDir, '.github');

  describe('CODEOWNERS File', () => {
    const codeownersPath = join(githubDir, 'CODEOWNERS');

    test('should exist in .github directory', () => {
      assert.equal(existsSync(codeownersPath), true);
    });

    test('should have valid syntax and structure', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for basic structure
      assertMatch(content, /# Global ownership/);
      assertMatch(content, /# Workflow security/);
      assertMatch(content, /# Security configuration/);
      assertMatch(content, /# Documentation/);
    });

    test('should protect critical workflow files', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for workflow protection
      assertMatch(content, /\/\.github\/workflows\/.*@pppp606/);
      assertMatch(content, /\/\.github\/dependabot\.yml.*@pppp606/);
    });

    test('should protect security configuration files', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for security file protection
      assertMatch(content, /\/SECURITY\.md.*@pppp606/);
      assertMatch(content, /\/\.secretlintrc\.json.*@pppp606/);
      assertMatch(content, /\/package\.json.*@pppp606/);
    });

    test('should protect validation scripts', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for script protection
      assertMatch(content, /\/scripts\/validate-.*@pppp606/);
    });

    test('should have global ownership defined', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for global ownership
      assertMatch(content, /^\*\s+@pppp606/m);
    });

    test('should have documentation ownership', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for documentation ownership (README)
      assertMatch(content, /\/README\.md.*@pppp606/);
    });
  });

  describe('Security Documentation Completeness', () => {
    const securityPath = join(rootDir, 'SECURITY.md');

    test('should include workflow protection information', () => {
      if (!existsSync(securityPath)) {
        throw new Error('SECURITY.md does not exist');
      }

      const content = readFileSync(securityPath, 'utf8');

      // Check for workflow protection content
      assertMatch(content, /Workflow Protection/i);
      assertMatch(content, /CODEOWNERS/);
      assertMatch(content, /Branch Protection/i);
    });

    test('should document security contact procedures', () => {
      if (!existsSync(securityPath)) {
        throw new Error('SECURITY.md does not exist');
      }

      const content = readFileSync(securityPath, 'utf8');

      // Check for contact procedures
      assertMatch(content, /Security Contact/i);
      assertMatch(content, /Reporting.*Vulnerability/i);
      assertMatch(content, /Response.*Time/i);
    });

    test('should include security response process', () => {
      if (!existsSync(securityPath)) {
        throw new Error('SECURITY.md does not exist');
      }

      const content = readFileSync(securityPath, 'utf8');

      // Check for response process
      assertMatch(content, /Security Response Process/i);
      assertMatch(content, /Acknowledgment/i);
      assertMatch(content, /Assessment/i);
      assertMatch(content, /Resolution/i);
      assertMatch(content, /Disclosure/i);
    });

    test('should document workflow security measures', () => {
      if (!existsSync(securityPath)) {
        throw new Error('SECURITY.md does not exist');
      }

      const content = readFileSync(securityPath, 'utf8');

      // Check for workflow security measures
      assertMatch(content, /Workflow.*Security/i);
      assertMatch(content, /Supply Chain.*Protection/i);
      assertMatch(content, /CI\/CD.*Security/i);
    });
  });

  describe('README Security Section', () => {
    const readmePath = join(rootDir, 'README.md');

    test('should include security practices section', () => {
      if (!existsSync(readmePath)) {
        throw new Error('README.md does not exist');
      }

      const content = readFileSync(readmePath, 'utf8');

      // Check for security section
      assertMatch(content, /Security.*Practices/i);
      assertMatch(content, /security/i);
    });

    test('should reference security documentation', () => {
      if (!existsSync(readmePath)) {
        throw new Error('README.md does not exist');
      }

      const content = readFileSync(readmePath, 'utf8');

      // Check for security documentation references
      assertMatch(content, /SECURITY\.md/);
      assertMatch(content, /security.*policy/i);
    });

    test('should mention security features', () => {
      if (!existsSync(readmePath)) {
        throw new Error('README.md does not exist');
      }

      const content = readFileSync(readmePath, 'utf8');

      // Check for security features
      assertMatch(content, /secure/i);
      assertMatch(content, /SHA-pinned/i);
      assertMatch(content, /provenance/i);
    });
  });

  describe('Workflow Security Configuration', () => {
    test('should have secretlint configuration protecting workflows', () => {
      const secretlintPath = join(rootDir, '.secretlintrc.json');
      assert.equal(existsSync(secretlintPath), true);

      if (existsSync(secretlintPath)) {
        const content = readFileSync(secretlintPath, 'utf8');
        const config = JSON.parse(content);

        // Check for workflow file scanning
        assert.notEqual(config.rules, undefined);
        assert.equal(Array.isArray(config.rules), true);
      }
    });

    test('should have validation scripts for workflow security', () => {
      const scriptsDir = join(rootDir, 'scripts');
      assert.equal(existsSync(scriptsDir), true);

      // Check for validation scripts
      const shaValidationPath = join(scriptsDir, 'validate-sha-pinning.js');
      const permissionsValidationPath = join(scriptsDir, 'validate-permissions.js');

      assert.equal(existsSync(shaValidationPath), true);
      assert.equal(existsSync(permissionsValidationPath), true);
    });

    test('should protect package.json scripts from unauthorized changes', () => {
      const packagePath = join(rootDir, 'package.json');
      assert.equal(existsSync(packagePath), true);

      if (existsSync(packagePath)) {
        const content = readFileSync(packagePath, 'utf8');
        const pkg = JSON.parse(content);

        // Check for security-related scripts
        assert.ok('lint:secrets' in pkg.scripts);
        assert.ok('validate:sha-pinning' in pkg.scripts);
        assert.ok('validate:permissions' in pkg.scripts);
      }
    });
  });

  describe('Security Contact and Response', () => {
    test('should have defined security contact information', () => {
      const securityPath = join(rootDir, 'SECURITY.md');

      if (existsSync(securityPath)) {
        const content = readFileSync(securityPath, 'utf8');

        // Check for contact information
        assertMatch(content, /Contact.*Information/i);
        assertMatch(content, /Email|GitHub/i);
      }
    });

    test('should define response timeframes', () => {
      const securityPath = join(rootDir, 'SECURITY.md');

      if (existsSync(securityPath)) {
        const content = readFileSync(securityPath, 'utf8');

        // Check for response times
        assertMatch(content, /48.*hours/i);
        assertMatch(content, /7.*days/i);
      }
    });

    test('should provide vulnerability reporting guidelines', () => {
      const securityPath = join(rootDir, 'SECURITY.md');

      if (existsSync(securityPath)) {
        const content = readFileSync(securityPath, 'utf8');

        // Check for reporting guidelines
        assertMatch(content, /What to Include/i);
        assertMatch(content, /Step-by-step/i);
        assertMatch(content, /Proof-of-concept/i);
      }
    });
  });
});