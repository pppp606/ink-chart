# Branch Protection Rules

This document outlines the required branch protection rules for the ink-chart repository to ensure security and prevent unauthorized workflow modifications.

## Overview

Branch protection rules are essential for:
- Preventing unauthorized workflow modifications
- Ensuring proper review of security-critical changes
- Maintaining code quality and consistency
- Protecting against supply chain attacks

## Required Status Checks

The following status checks must pass before merging:

- **Build**: `npm run build`
- **Type Check**: `npm run typecheck`
- **Lint**: `npm run lint`
- **Tests**: `npm run test`
- **Security Scan**: `npm run lint:secrets`
- **SHA Pinning Validation**: `npm run validate:sha-pinning`
- **Permissions Validation**: `npm run validate:permissions`

## Pull Request Requirements

### Require Pull Request Reviews
- **Minimum reviews required**: 1
- **Dismiss stale reviews**: Enabled
- **Require review from CODEOWNERS**: Enabled
- **Restrict push permissions**: Enabled

### Special Review Requirements

#### Workflow Changes
Any changes to `.github/workflows/` require:
- Security approval from repository maintainer
- Additional security review for workflow modifications
- Validation of SHA pinning in new actions
- Review of permission minimization

#### Security Configuration Files
Changes to the following files require security review:
- `SECURITY.md`
- `.secretlintrc.json`
- `.secretlintignore`
- `package.json`
- `package-lock.json`
- Validation scripts in `/scripts/validate-*`

#### Documentation Updates
Documentation changes require maintainer review:
- `README.md`
- `/docs/*`
- Security documentation updates

## Setup Instructions

### For Repository Administrators

1. **Access Repository Settings**
   - Go to repository → Settings → Branches
   - Click "Add rule" or edit existing rule

2. **Configure Branch Protection Rule**
   - Branch name pattern: `main`
   - Enable "Restrict pushes that create matching branches"

3. **Required Status Checks**
   - Enable "Require status checks to pass before merging"
   - Enable "Require branches to be up to date before merging"
   - Add required checks:
     - `build`
     - `typecheck`
     - `lint`
     - `test`
     - `security-scan`

4. **Pull Request Settings**
   - Enable "Require pull request reviews before merging"
   - Set "Required approving reviews" to 1
   - Enable "Dismiss stale pull request approvals when new commits are pushed"
   - Enable "Require review from CODEOWNERS"

5. **Push Restrictions**
   - Enable "Restrict pushes that create matching branches"
   - Only allow administrators and maintain history

6. **Additional Settings**
   - Enable "Do not allow bypassing the above settings"
   - Enable "Require conversation resolution before merging"

### CODEOWNERS Integration

The `.github/CODEOWNERS` file automatically assigns reviewers:

```
# Global ownership
* @pppp606

# Workflow security
/.github/workflows/ @pppp606
/.github/dependabot.yml @pppp606

# Security configuration
/SECURITY.md @pppp606
/.secretlintrc.json @pppp606
/package.json @pppp606
```

## Security Checklist

Before enabling branch protection, ensure:

- [ ] CODEOWNERS file is properly configured
- [ ] Required status checks are working in CI
- [ ] Workflow security validation scripts are in place
- [ ] Security configuration files are protected
- [ ] Maintainer has proper repository permissions
- [ ] Emergency procedures are documented
- [ ] Team members understand the review process

## Workflow Security Approval Process

### Standard Changes
1. Developer creates pull request
2. Automated checks run (build, test, lint, security scan)
3. CODEOWNERS automatically assigns reviewer
4. One approval required from code owner
5. Merge after all checks pass

### Workflow Changes (High Security)
1. Developer creates pull request with workflow changes
2. Automated security validation runs
3. **Additional security review required**
4. Security team validates:
   - SHA pinning compliance
   - Permission minimization
   - Secret handling
   - Supply chain security
5. Two approvals required (standard + security)
6. Merge after enhanced validation

### Emergency Procedures

In case of critical security issues:

1. **Immediate Response**
   - Contact repository administrator
   - Document the security concern
   - Temporary branch protection bypass (admin only)

2. **Post-Emergency**
   - Re-enable branch protection
   - Review and document bypass reason
   - Update security procedures if needed

## Monitoring and Compliance

### Regular Audits
- Monthly review of protection rule compliance
- Quarterly security review of workflow changes
- Annual assessment of CODEOWNERS effectiveness

### Compliance Validation
Use the following scripts to validate protection compliance:

```bash
# Validate workflow SHA pinning
npm run validate:sha-pinning

# Validate workflow permissions
npm run validate:permissions

# Run security scan
npm run lint:secrets
```

### Reporting Issues

If you discover issues with branch protection:
1. Report to repository maintainer immediately
2. Document the issue in GitHub issues (if not security-sensitive)
3. Follow the security reporting process for sensitive issues

## Best Practices

### For Contributors
- Test locally before creating PR
- Ensure all checks pass
- Provide clear commit messages
- Reference relevant issues
- Respond promptly to review feedback

### For Reviewers
- Verify security implications of changes
- Check for proper documentation updates
- Validate test coverage for new features
- Ensure compliance with coding standards
- Review workflow changes carefully

### For Maintainers
- Monitor protection rule effectiveness
- Update rules as project evolves
- Train team on security procedures
- Maintain emergency contact information
- Document security decisions

## Related Documentation

- [SECURITY.md](../SECURITY.md) - Security policy and reporting
- [CODEOWNERS](../.github/CODEOWNERS) - Code ownership definitions
- [Workflow Security Tests](../__tests__/workflow-protection.test.ts) - Automated validation

## Questions or Issues

For questions about branch protection rules:
1. Check this documentation first
2. Review existing GitHub issues
3. Contact repository maintainer
4. Follow security reporting process for sensitive matters

---

*This document is part of the ink-chart security framework and should be reviewed regularly to ensure continued effectiveness.*