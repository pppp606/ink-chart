# OIDC Authentication Setup for npm Publishing

This document explains the OpenID Connect (OIDC) authentication setup for secure npm publishing in GitHub Actions.

## Overview

OIDC provides enhanced security for npm publishing by replacing long-lived `NPM_TOKEN` secrets with short-lived, automatically rotating tokens. This approach eliminates the need to manage permanent tokens while providing better security and audit trails.

## Benefits

- **Enhanced Security**: Short-lived tokens (15 minutes) vs permanent tokens
- **Automatic Rotation**: No manual token renewal required
- **No Secret Management**: No need to store long-lived credentials
- **Built-in Audit Trail**: All publishing actions are tied to specific GitHub Actions runs
- **Provenance Support**: Enables npm package provenance for supply chain security

## Current Implementation

The workflow automatically detects the available authentication method:

1. **OIDC Authentication** (preferred): Uses GitHub's built-in OIDC provider
   - Requires `id-token: write` permission
   - Uses `--provenance` flag for enhanced security
   - No secrets required in repository

2. **NPM Token Authentication** (fallback): Uses traditional NPM_TOKEN
   - Maintains backward compatibility
   - Uses stored `NPM_TOKEN` secret

## Manual Setup Required in npm Registry

To enable OIDC publishing, the following manual steps are required in the npm registry:

### 1. Configure Trusted Publisher

1. Go to your package page on npmjs.com
2. Navigate to Settings → Publishing Access
3. Add a new "Trusted Publisher"
4. Configure with these settings:
   - **Provider**: GitHub Actions
   - **Repository**: `pppp606/ink-chart`
   - **Workflow**: `.github/workflows/publish-npm.yml`
   - **Environment**: (leave empty for any environment)

### 2. Verify Configuration

After setup, the workflow will automatically use OIDC when:
- The package is configured for trusted publishing in npm
- The workflow has `id-token: write` permission
- GitHub provides the required OIDC environment variables

## Testing

The implementation includes comprehensive tests in `__tests__/oidc-validation.test.ts` that validate:

- OIDC environment variables in CI
- Package configuration for OIDC publishing
- Authentication method detection logic
- Security validation of OIDC claims
- Backward compatibility during transition

## Monitoring

The workflow provides clear logging to indicate which authentication method is being used:

- 🔐 OIDC authentication: "Using OIDC authentication for publishing"
- 🔑 NPM Token: "Using NPM_TOKEN authentication for publishing"
- ❌ No authentication: Workflow fails with clear error message

## Transition Strategy

The implementation supports gradual transition:

1. **Phase 1**: Deploy OIDC-ready workflow (current)
2. **Phase 2**: Configure trusted publisher in npm registry
3. **Phase 3**: Verify OIDC publishing works correctly
4. **Phase 4**: Optionally remove NPM_TOKEN secret

This approach ensures no publishing downtime during the transition.