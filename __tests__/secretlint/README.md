# Secretlint Test Files

This directory contains test files with sample secrets used to validate the secretlint configuration using Test-Driven Development (TDD) approach.

## Files

- `sample-secrets.js` - JavaScript file with various types of hardcoded secrets
- `sample-secrets.env` - Environment file with API keys and credentials
- `sample-config.json` - JSON configuration file with embedded secrets

## Purpose

These files are intentionally created with fake secrets to test that secretlint:

1. **Detects various types of secrets** including:
   - API keys (OpenAI, Stripe, AWS)
   - GitHub tokens
   - NPM tokens
   - Database credentials
   - Private keys
   - JWT secrets
   - Webhook URLs

2. **Works across different file types**:
   - JavaScript/TypeScript files
   - Environment files (.env)
   - JSON configuration files

## TDD Approach

1. **RED**: These test files should initially cause secretlint to fail (detect secrets)
2. **GREEN**: Configure secretlint to properly detect these secrets
3. **REFACTOR**: Fine-tune configuration to minimize false positives

## Note

All secrets in these files are fake and for testing purposes only. They should never be used in real applications.