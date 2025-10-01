# Security Policy

## Supported Versions

We provide security updates for the following versions of ink-chart:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within ink-chart, please send an email to the maintainer. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### Security Contact

For security-related communications:

- **GitHub**: Create a private security advisory in the repository
- **Email**: Contact repository maintainer directly for urgent security matters
- **Response Time**: Security reports acknowledged within 48 hours

### Contact Information

- **Email**: Contact via GitHub issues for non-security matters, or reach out directly through GitHub for security concerns

## Response Time

- **Acknowledgment**: We aim to acknowledge security reports within 48 hours
- **Resolution Time**: Critical vulnerabilities will be addressed within 7 days

### What to Include

When reporting a vulnerability, please include:

1. Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
2. Full paths of source file(s) related to the manifestation of the issue
3. The location of the affected source code (tag/branch/commit or direct URL)
4. Any special configuration required to reproduce the issue
5. Step-by-step instructions to reproduce the issue
6. Proof-of-concept or exploit code (if possible)
7. Impact of the issue, including how an attacker might exploit the issue

### Security Response Process

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
2. **Assessment**: We will assess the vulnerability and determine its severity
3. **Resolution**: We will work on a fix and determine a release timeline
4. **Disclosure**: We will coordinate the disclosure of the vulnerability

### Security Best Practices

When using ink-chart:

1. Keep your dependencies updated
2. Run `npm audit` regularly to check for vulnerabilities
3. Use the latest stable version of ink-chart
4. Follow secure coding practices in your applications

### Automated Security Measures

This project implements several automated security measures:

- **Dependency Scanning**: npm audit runs in CI/CD pipeline
- **Secret Detection**: secretlint scans for accidentally committed secrets
- **Permission Minimization**: GitHub Actions workflows use minimal permissions
- **SHA Pinning**: GitHub Actions use SHA-pinned versions for security

### Workflow Protection

This repository implements comprehensive workflow protection to prevent supply chain attacks:

#### CODEOWNERS Protection
- All workflow files (`.github/workflows/`) require maintainer approval
- Security configuration files require code owner review
- Package and dependency changes require security approval
- Documentation changes are protected by code ownership rules

#### Branch Protection Rules
- Required status checks for all security validations
- Pull request reviews mandatory for all changes
- Workflow changes require additional security review
- See [Branch Protection Documentation](docs/BRANCH-PROTECTION.md) for details

#### CI/CD Security
- All GitHub Actions use SHA-pinned versions for reproducibility
- Minimal permissions implemented across all workflows
- OIDC authentication with attestation and provenance
- Secretlint validation prevents accidental secret exposure
- Automated validation of workflow security configurations

#### Supply Chain Protection
- Dependency updates through Dependabot with security review
- Package publishing with provenance attestation
- Comprehensive security scanning in CI pipeline
- Regular security audits and compliance validation

### Security Updates

Security updates will be released as patch versions and announced through:

- GitHub releases
- npm package updates
- Security advisories (for critical issues)

Thank you for helping keep ink-chart and the community safe!