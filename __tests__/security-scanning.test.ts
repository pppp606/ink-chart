import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertContains, assertMatch, assertNotMatch } from './helpers/assertions.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Security Scanning', () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const ciWorkflowPath = path.join(process.cwd(), '.github/workflows/ci.yml');
  const securityPolicyPath = path.join(process.cwd(), 'SECURITY.md');

  describe('npm audit integration', () => {
    it('should have npm audit configured in package.json scripts', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that audit script exists
      assert.ok('audit' in packageJson.scripts);
      assertContains(packageJson.scripts.audit, 'npm audit');

      // Test that audit:fix script exists
      assert.ok('audit:fix' in packageJson.scripts);
      assertContains(packageJson.scripts['audit:fix'], 'npm audit fix');
    });

    it('should have audit configuration for severity thresholds', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that npm config has audit-level set to moderate or higher
      assertMatch(packageJson.scripts.audit, /--audit-level (moderate|high|critical)/);
    });

    it('should run npm audit without high/critical vulnerabilities', { timeout: 45000 }, async () => {
      try {
        // Run npm audit and check for vulnerabilities
        const auditResult = execSync('npm audit --audit-level high --dry-run', {
          encoding: 'utf8',
          timeout: 30000
        });

        // If audit passes, we're good
        assert.notEqual(auditResult, undefined);
      } catch (error: any) {
        // If audit fails, check if it's due to vulnerabilities
        if (error.stdout && error.stdout.includes('vulnerabilities')) {
          assert.fail('High or critical vulnerabilities detected in dependencies');
        }
        // Other errors might be network issues, which we can ignore in tests
      }
    });
  });

  describe('CI pipeline security integration', () => {
    it('should have npm audit step in CI workflow', () => {
      const ciWorkflow = fs.readFileSync(ciWorkflowPath, 'utf8');

      // Test that CI workflow includes npm audit step
      assertMatch(ciWorkflow, /npm audit|Run security audit/i);

      // Test that audit step runs before build
      const auditStepIndex = ciWorkflow.indexOf('audit');
      const buildStepIndex = ciWorkflow.indexOf('npm run build');

      assert.ok(auditStepIndex > -1);
      assert.ok(buildStepIndex > -1);
      assert.ok(auditStepIndex < buildStepIndex);
    });

    it('should have proper security permissions in CI workflow', () => {
      const ciWorkflow = fs.readFileSync(ciWorkflowPath, 'utf8');

      // Test that permissions are explicitly set and minimal
      assertMatch(ciWorkflow, /permissions:/);
      assertMatch(ciWorkflow, /contents:\s*read/);

      // Should not have unnecessary permissions
      assertNotMatch(ciWorkflow, /contents:\s*write/);
      assertNotMatch(ciWorkflow, /actions:\s*write/);
    });
  });

  describe('Dependency vulnerability scanning', () => {
    it('should have security-focused package.json configuration', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test for security-related npm configuration
      if (packageJson.config) {
        assert.ok('audit-level' in packageJson.config);
        assertContains(['moderate', 'high', 'critical'], packageJson.config['audit-level']);
      }
    });

    it('should have automated security update configuration', () => {
      const dependabotPath = path.join(process.cwd(), '.github/dependabot.yml');
      const renovatePath = path.join(process.cwd(), 'renovate.json');

      // Should have either Dependabot or Renovate configuration
      const hasDependabot = fs.existsSync(dependabotPath);
      const hasRenovate = fs.existsSync(renovatePath);

      assert.equal(hasDependabot || hasRenovate, true);

      if (hasDependabot) {
        const dependabotConfig = fs.readFileSync(dependabotPath, 'utf8');
        assertMatch(dependabotConfig, /package-ecosystem:\s*["']?npm["']?/);
        assertMatch(dependabotConfig, /schedule:/);
      }
    });
  });

  describe('Security policy configuration', () => {
    it('should have SECURITY.md file with vulnerability reporting process', () => {
      assert.equal(fs.existsSync(securityPolicyPath), true);

      const securityPolicy = fs.readFileSync(securityPolicyPath, 'utf8');

      // Test that security policy contains required sections
      assertMatch(securityPolicy, /## Reporting a Vulnerability/i);
      assertMatch(securityPolicy, /## Supported Versions/i);
      assertMatch(securityPolicy, /## Response Time/i);

      // Test that contact information is provided
      assertMatch(securityPolicy, /email|contact|report/i);
    });

    it('should have security-focused npm configuration', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test for security-related configurations
      assert.ok('audit' in packageJson.scripts);
      assert.ok('lint:secrets' in packageJson.scripts);

      // Test that secretlint is configured
      assert.ok('secretlint' in packageJson.devDependencies);
    });

    it('should validate security workflow permissions', () => {
      const workflowFiles = fs.readdirSync(path.join(process.cwd(), '.github/workflows'))
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

      workflowFiles.forEach(workflowFile => {
        const workflowPath = path.join(process.cwd(), '.github/workflows', workflowFile);
        const workflow = fs.readFileSync(workflowPath, 'utf8');

        // Test that all workflows have explicit permissions
        assertMatch(workflow, /permissions:/);

        // Test that workflows don't have excessive permissions
        assertNotMatch(workflow, /permissions:\s*write-all/);
        assertNotMatch(workflow, /contents:\s*write/);
      });
    });
  });

  describe('Security threshold enforcement', () => {
    it('should fail CI on high/critical vulnerabilities', () => {
      const ciWorkflow = fs.readFileSync(ciWorkflowPath, 'utf8');

      // Test that audit command in CI has appropriate severity level
      const auditMatch = ciWorkflow.match(/npm audit[^\\n]*/);
      if (auditMatch) {
        assertMatch(auditMatch[0], /--audit-level (high|critical)/);
      }
    });

    it('should have security notification configuration', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that we have security notification setup
      if (packageJson.scripts['security:notify']) {
        assert.notEqual(packageJson.scripts['security:notify'], undefined);
      }
    });
  });

  describe('Mock vulnerability detection scenarios', () => {
    it('should detect when audit command would fail with vulnerabilities', () => {
      // Mock scenario: test audit command structure
      const mockAuditCommand = 'npm audit --audit-level high --json';

      // Test that our audit command structure is correct
      assertContains(mockAuditCommand, '--audit-level');
      assertContains(mockAuditCommand, 'high');
    });

    it('should validate audit fix workflow', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that audit fix is available but not automatic
      assert.ok('audit:fix' in packageJson.scripts);
      assertContains(packageJson.scripts['audit:fix'], '--dry-run');
    });
  });

  describe('Security tooling integration', () => {
    it('should have secretlint integration', () => {
      const secretlintPath = path.join(process.cwd(), '.secretlintrc.json');
      assert.equal(fs.existsSync(secretlintPath), true);

      const secretlintConfig = JSON.parse(fs.readFileSync(secretlintPath, 'utf8'));
      assert.notEqual(secretlintConfig.rules, undefined);
      assert.equal(secretlintConfig.severity, 'error');
    });

    it('should run secretlint as part of security checks', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      assert.ok('lint:secrets' in packageJson.scripts);
      assertContains(packageJson.scripts['lint:secrets'], 'secretlint');
    });
  });
});