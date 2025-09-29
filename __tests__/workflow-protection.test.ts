/**
 * Workflow Protection Tests
 *
 * Tests for GitHub repository workflow protection mechanisms including:
 * - CODEOWNERS file validation
 * - Branch protection documentation
 * - Security documentation completeness
 * - Workflow security configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Workflow Protection', () => {
  const rootDir = process.cwd();
  const githubDir = join(rootDir, '.github');
  const docsDir = join(rootDir, 'docs');

  describe('CODEOWNERS File', () => {
    const codeownersPath = join(githubDir, 'CODEOWNERS');

    test('should exist in .github directory', () => {
      expect(existsSync(codeownersPath)).toBe(true);
    });

    test('should have valid syntax and structure', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for basic structure
      expect(content).toMatch(/# Global ownership/);
      expect(content).toMatch(/# Workflow security/);
      expect(content).toMatch(/# Security configuration/);
      expect(content).toMatch(/# Documentation/);
    });

    test('should protect critical workflow files', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for workflow protection
      expect(content).toMatch(/\/\.github\/workflows\/.*@pppp606/);
      expect(content).toMatch(/\/\.github\/dependabot\.yml.*@pppp606/);
    });

    test('should protect security configuration files', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for security file protection
      expect(content).toMatch(/\/SECURITY\.md.*@pppp606/);
      expect(content).toMatch(/\/\.secretlintrc\.json.*@pppp606/);
      expect(content).toMatch(/\/package\.json.*@pppp606/);
    });

    test('should protect validation scripts', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for script protection
      expect(content).toMatch(/\/scripts\/validate-.*@pppp606/);
    });

    test('should have global ownership defined', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for global ownership
      expect(content).toMatch(/^\*\s+@pppp606/m);
    });

    test('should have documentation ownership', () => {
      if (!existsSync(codeownersPath)) {
        throw new Error('CODEOWNERS file does not exist');
      }

      const content = readFileSync(codeownersPath, 'utf8');

      // Check for docs protection
      expect(content).toMatch(/\/docs\/.*@pppp606/);
    });
  });

  describe('Branch Protection Documentation', () => {
    const branchProtectionPath = join(docsDir, 'BRANCH-PROTECTION.md');

    test('should exist in docs directory', () => {
      expect(existsSync(branchProtectionPath)).toBe(true);
    });

    test('should document required protection rules', () => {
      if (!existsSync(branchProtectionPath)) {
        throw new Error('Branch protection documentation does not exist');
      }

      const content = readFileSync(branchProtectionPath, 'utf8');

      // Check for essential protection rules
      expect(content).toMatch(/Required Status Checks/i);
      expect(content).toMatch(/Require pull request reviews/i);
      expect(content).toMatch(/Dismiss stale reviews/i);
      expect(content).toMatch(/Require review from CODEOWNERS/i);
      expect(content).toMatch(/Restrict pushes/i);
    });

    test('should include workflow-specific protection requirements', () => {
      if (!existsSync(branchProtectionPath)) {
        throw new Error('Branch protection documentation does not exist');
      }

      const content = readFileSync(branchProtectionPath, 'utf8');

      // Check for workflow protection specifics
      expect(content).toMatch(/Additional security review for workflow/i);
      expect(content).toMatch(/\.github\/workflows/);
      expect(content).toMatch(/security.*approval/i);
    });

    test('should provide administrator setup instructions', () => {
      if (!existsSync(branchProtectionPath)) {
        throw new Error('Branch protection documentation does not exist');
      }

      const content = readFileSync(branchProtectionPath, 'utf8');

      // Check for setup instructions
      expect(content).toMatch(/Setup Instructions/i);
      expect(content).toMatch(/Repository Settings/i);
      expect(content).toMatch(/Branches/i);
      expect(content).toMatch(/Add rule/i);
    });

    test('should include security checklist', () => {
      if (!existsSync(branchProtectionPath)) {
        throw new Error('Branch protection documentation does not exist');
      }

      const content = readFileSync(branchProtectionPath, 'utf8');

      // Check for security checklist
      expect(content).toMatch(/Security Checklist/i);
      expect(content).toMatch(/\[.*\].*CODEOWNERS/i);
      expect(content).toMatch(/\[.*\].*status.*checks/i);
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
      expect(content).toMatch(/Workflow Protection/i);
      expect(content).toMatch(/CODEOWNERS/);
      expect(content).toMatch(/Branch Protection/i);
    });

    test('should document security contact procedures', () => {
      if (!existsSync(securityPath)) {
        throw new Error('SECURITY.md does not exist');
      }

      const content = readFileSync(securityPath, 'utf8');

      // Check for contact procedures
      expect(content).toMatch(/Security Contact/i);
      expect(content).toMatch(/Reporting.*Vulnerability/i);
      expect(content).toMatch(/Response.*Time/i);
    });

    test('should include security response process', () => {
      if (!existsSync(securityPath)) {
        throw new Error('SECURITY.md does not exist');
      }

      const content = readFileSync(securityPath, 'utf8');

      // Check for response process
      expect(content).toMatch(/Security Response Process/i);
      expect(content).toMatch(/Acknowledgment/i);
      expect(content).toMatch(/Assessment/i);
      expect(content).toMatch(/Resolution/i);
      expect(content).toMatch(/Disclosure/i);
    });

    test('should document workflow security measures', () => {
      if (!existsSync(securityPath)) {
        throw new Error('SECURITY.md does not exist');
      }

      const content = readFileSync(securityPath, 'utf8');

      // Check for workflow security measures
      expect(content).toMatch(/Workflow.*Security/i);
      expect(content).toMatch(/Supply Chain.*Protection/i);
      expect(content).toMatch(/CI\/CD.*Security/i);
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
      expect(content).toMatch(/Security.*Practices/i);
      expect(content).toMatch(/security/i);
    });

    test('should reference security documentation', () => {
      if (!existsSync(readmePath)) {
        throw new Error('README.md does not exist');
      }

      const content = readFileSync(readmePath, 'utf8');

      // Check for security documentation references
      expect(content).toMatch(/SECURITY\.md/);
      expect(content).toMatch(/security.*policy/i);
    });

    test('should mention security features', () => {
      if (!existsSync(readmePath)) {
        throw new Error('README.md does not exist');
      }

      const content = readFileSync(readmePath, 'utf8');

      // Check for security features
      expect(content).toMatch(/secure/i);
      expect(content).toMatch(/SHA-pinned/i);
      expect(content).toMatch(/provenance/i);
    });
  });

  describe('Workflow Security Configuration', () => {
    test('should have secretlint configuration protecting workflows', () => {
      const secretlintPath = join(rootDir, '.secretlintrc.json');
      expect(existsSync(secretlintPath)).toBe(true);

      if (existsSync(secretlintPath)) {
        const content = readFileSync(secretlintPath, 'utf8');
        const config = JSON.parse(content);

        // Check for workflow file scanning
        expect(config.rules).toBeDefined();
        expect(Array.isArray(config.rules)).toBe(true);
      }
    });

    test('should have validation scripts for workflow security', () => {
      const scriptsDir = join(rootDir, 'scripts');
      expect(existsSync(scriptsDir)).toBe(true);

      // Check for validation scripts
      const shaValidationPath = join(scriptsDir, 'validate-sha-pinning.js');
      const permissionsValidationPath = join(scriptsDir, 'validate-permissions.js');

      expect(existsSync(shaValidationPath)).toBe(true);
      expect(existsSync(permissionsValidationPath)).toBe(true);
    });

    test('should protect package.json scripts from unauthorized changes', () => {
      const packagePath = join(rootDir, 'package.json');
      expect(existsSync(packagePath)).toBe(true);

      if (existsSync(packagePath)) {
        const content = readFileSync(packagePath, 'utf8');
        const pkg = JSON.parse(content);

        // Check for security-related scripts
        expect(pkg.scripts).toHaveProperty('lint:secrets');
        expect(pkg.scripts).toHaveProperty('validate:sha-pinning');
        expect(pkg.scripts).toHaveProperty('validate:permissions');
      }
    });
  });

  describe('Security Contact and Response', () => {
    test('should have defined security contact information', () => {
      const securityPath = join(rootDir, 'SECURITY.md');

      if (existsSync(securityPath)) {
        const content = readFileSync(securityPath, 'utf8');

        // Check for contact information
        expect(content).toMatch(/Contact.*Information/i);
        expect(content).toMatch(/Email|GitHub/i);
      }
    });

    test('should define response timeframes', () => {
      const securityPath = join(rootDir, 'SECURITY.md');

      if (existsSync(securityPath)) {
        const content = readFileSync(securityPath, 'utf8');

        // Check for response times
        expect(content).toMatch(/48.*hours/i);
        expect(content).toMatch(/7.*days/i);
      }
    });

    test('should provide vulnerability reporting guidelines', () => {
      const securityPath = join(rootDir, 'SECURITY.md');

      if (existsSync(securityPath)) {
        const content = readFileSync(securityPath, 'utf8');

        // Check for reporting guidelines
        expect(content).toMatch(/What to Include/i);
        expect(content).toMatch(/Step-by-step/i);
        expect(content).toMatch(/Proof-of-concept/i);
      }
    });
  });

  describe('Documentation Standards', () => {
    test('should have consistent markdown formatting in security docs', () => {
      const securityPath = join(rootDir, 'SECURITY.md');
      const branchProtectionPath = join(docsDir, 'BRANCH-PROTECTION.md');

      [securityPath, branchProtectionPath].forEach(path => {
        if (existsSync(path)) {
          const content = readFileSync(path, 'utf8');

          // Check for proper markdown structure
          expect(content).toMatch(/^#\s+/m); // Has main heading
          expect(content).toMatch(/^##\s+/m); // Has subheadings
          expect(content).not.toMatch(/^\t/m); // No tabs for indentation
        }
      });
    });

    test('should have cross-references between security documents', () => {
      const securityPath = join(rootDir, 'SECURITY.md');
      const readmePath = join(rootDir, 'README.md');

      if (existsSync(readmePath)) {
        const readmeContent = readFileSync(readmePath, 'utf8');
        expect(readmeContent).toMatch(/SECURITY\.md/);
      }

      if (existsSync(securityPath)) {
        const securityContent = readFileSync(securityPath, 'utf8');
        // Security doc should reference branch protection if it exists
        const branchProtectionPath = join(docsDir, 'BRANCH-PROTECTION.md');
        if (existsSync(branchProtectionPath)) {
          expect(securityContent).toMatch(/BRANCH-PROTECTION\.md|branch.*protection/i);
        }
      }
    });
  });
});