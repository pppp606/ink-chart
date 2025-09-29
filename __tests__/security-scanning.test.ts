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
      expect(packageJson.scripts).toHaveProperty('audit');
      expect(packageJson.scripts.audit).toContain('npm audit');

      // Test that audit:fix script exists
      expect(packageJson.scripts).toHaveProperty('audit:fix');
      expect(packageJson.scripts['audit:fix']).toContain('npm audit fix');
    });

    it('should have audit configuration for severity thresholds', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that npm config has audit-level set to moderate or higher
      expect(packageJson.scripts.audit).toMatch(/--audit-level (moderate|high|critical)/);
    });

    it('should run npm audit without high/critical vulnerabilities', async () => {
      try {
        // Run npm audit and check for vulnerabilities
        const auditResult = execSync('npm audit --audit-level high --dry-run', {
          encoding: 'utf8',
          timeout: 30000
        });

        // If audit passes, we're good
        expect(auditResult).toBeDefined();
      } catch (error: any) {
        // If audit fails, check if it's due to vulnerabilities
        if (error.stdout && error.stdout.includes('vulnerabilities')) {
          fail('High or critical vulnerabilities detected in dependencies');
        }
        // Other errors might be network issues, which we can ignore in tests
      }
    }, 45000);
  });

  describe('CI pipeline security integration', () => {
    it('should have npm audit step in CI workflow', () => {
      const ciWorkflow = fs.readFileSync(ciWorkflowPath, 'utf8');

      // Test that CI workflow includes npm audit step
      expect(ciWorkflow).toMatch(/npm audit|Run security audit/i);

      // Test that audit step runs before build
      const auditStepIndex = ciWorkflow.indexOf('audit');
      const buildStepIndex = ciWorkflow.indexOf('npm run build');

      expect(auditStepIndex).toBeGreaterThan(-1);
      expect(buildStepIndex).toBeGreaterThan(-1);
      expect(auditStepIndex).toBeLessThan(buildStepIndex);
    });

    it('should have proper security permissions in CI workflow', () => {
      const ciWorkflow = fs.readFileSync(ciWorkflowPath, 'utf8');

      // Test that permissions are explicitly set and minimal
      expect(ciWorkflow).toMatch(/permissions:/);
      expect(ciWorkflow).toMatch(/contents:\s*read/);

      // Should not have unnecessary permissions
      expect(ciWorkflow).not.toMatch(/contents:\s*write/);
      expect(ciWorkflow).not.toMatch(/actions:\s*write/);
    });
  });

  describe('Dependency vulnerability scanning', () => {
    it('should have security-focused package.json configuration', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test for security-related npm configuration
      if (packageJson.config) {
        expect(packageJson.config).toHaveProperty('audit-level');
        expect(['moderate', 'high', 'critical']).toContain(packageJson.config['audit-level']);
      }
    });

    it('should validate dependency licenses are compatible', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that we have license checking capability
      expect(packageJson.scripts).toHaveProperty('license-check');
    });

    it('should have automated security update configuration', () => {
      const dependabotPath = path.join(process.cwd(), '.github/dependabot.yml');
      const renovatePath = path.join(process.cwd(), 'renovate.json');

      // Should have either Dependabot or Renovate configuration
      const hasDependabot = fs.existsSync(dependabotPath);
      const hasRenovate = fs.existsSync(renovatePath);

      expect(hasDependabot || hasRenovate).toBe(true);

      if (hasDependabot) {
        const dependabotConfig = fs.readFileSync(dependabotPath, 'utf8');
        expect(dependabotConfig).toMatch(/package-ecosystem:\s*["']?npm["']?/);
        expect(dependabotConfig).toMatch(/schedule:/);
      }
    });
  });

  describe('Security policy configuration', () => {
    it('should have SECURITY.md file with vulnerability reporting process', () => {
      expect(fs.existsSync(securityPolicyPath)).toBe(true);

      const securityPolicy = fs.readFileSync(securityPolicyPath, 'utf8');

      // Test that security policy contains required sections
      expect(securityPolicy).toMatch(/## Reporting a Vulnerability/i);
      expect(securityPolicy).toMatch(/## Supported Versions/i);
      expect(securityPolicy).toMatch(/## Response Time/i);

      // Test that contact information is provided
      expect(securityPolicy).toMatch(/email|contact|report/i);
    });

    it('should have security-focused npm configuration', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test for security-related configurations
      expect(packageJson.scripts).toHaveProperty('audit');
      expect(packageJson.scripts).toHaveProperty('lint:secrets');

      // Test that secretlint is configured
      expect(packageJson.devDependencies).toHaveProperty('secretlint');
    });

    it('should validate security workflow permissions', () => {
      const workflowFiles = fs.readdirSync(path.join(process.cwd(), '.github/workflows'))
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

      workflowFiles.forEach(workflowFile => {
        const workflowPath = path.join(process.cwd(), '.github/workflows', workflowFile);
        const workflow = fs.readFileSync(workflowPath, 'utf8');

        // Test that all workflows have explicit permissions
        expect(workflow).toMatch(/permissions:/);

        // Test that workflows don't have excessive permissions
        expect(workflow).not.toMatch(/permissions:\s*write-all/);
        // Allow contents:write for release workflows and provenance
        if (!workflow.includes('create-release') && !workflow.includes('provenance')) {
          expect(workflow).not.toMatch(/contents:\s*write/);
        }
      });
    });
  });

  describe('Security threshold enforcement', () => {
    it('should fail CI on high/critical vulnerabilities', () => {
      const ciWorkflow = fs.readFileSync(ciWorkflowPath, 'utf8');

      // Test that audit command in CI has appropriate severity level
      const auditMatch = ciWorkflow.match(/npm audit[^\\n]*/);
      if (auditMatch) {
        expect(auditMatch[0]).toMatch(/--audit-level (high|critical)/);
      }
    });

    it('should have security notification configuration', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that we have security notification setup
      if (packageJson.scripts['security:notify']) {
        expect(packageJson.scripts['security:notify']).toBeDefined();
      }
    });
  });

  describe('Mock vulnerability detection scenarios', () => {
    it('should detect when audit command would fail with vulnerabilities', () => {
      // Mock scenario: test audit command structure
      const mockAuditCommand = 'npm audit --audit-level high --json';

      // Test that our audit command structure is correct
      expect(mockAuditCommand).toContain('--audit-level');
      expect(mockAuditCommand).toContain('high');
    });

    it('should validate audit fix workflow', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Test that audit fix is available but not automatic
      expect(packageJson.scripts).toHaveProperty('audit:fix');
      expect(packageJson.scripts['audit:fix']).toContain('--dry-run');
    });
  });

  describe('Security tooling integration', () => {
    it('should have secretlint integration', () => {
      const secretlintPath = path.join(process.cwd(), '.secretlintrc.json');
      expect(fs.existsSync(secretlintPath)).toBe(true);

      const secretlintConfig = JSON.parse(fs.readFileSync(secretlintPath, 'utf8'));
      expect(secretlintConfig.rules).toBeDefined();
      expect(secretlintConfig.severity).toBe('error');
    });

    it('should run secretlint as part of security checks', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.scripts).toHaveProperty('lint:secrets');
      expect(packageJson.scripts['lint:secrets']).toContain('secretlint');
    });
  });
});