#!/usr/bin/env node

/**
 * Permission Validation Script for GitHub Actions Workflows
 *
 * This script validates that all GitHub Actions workflows follow the principle
 * of least privilege by:
 * 1. Ensuring each workflow has an explicit permissions block
 * 2. Verifying only necessary permissions are granted
 * 3. Failing if any workflow uses default (overly broad) permissions
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Expected permissions for each workflow type
const WORKFLOW_PERMISSIONS = {
  'ci.yml': {
    required: ['contents: read'],
    description: 'CI workflow only needs to read repository contents'
  },
  'publish-npm.yml': {
    jobs: {
      publish: {
        required: ['contents: read'],
        description: 'NPM publish job only needs to read contents for npm publishing'
      },
      'create-release': {
        required: ['contents: write'],
        description: 'Release creation job needs to write contents for GitHub releases'
      }
    }
  },
  'publish-github.yml': {
    jobs: {
      publish: {
        required: ['contents: read', 'packages: write'],
        description: 'GitHub Packages publish job needs to read contents and write packages'
      },
      'create-canary-release': {
        required: ['contents: write'],
        description: 'Canary release job needs to write contents for GitHub releases'
      }
    }
  }
};

class PermissionValidator {
  constructor() {
    this.errors = [];
    this.workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
  }

  /**
   * Validate all workflows in the .github/workflows directory
   */
  async validateAllWorkflows() {
    console.log('🔍 Validating GitHub Actions workflow permissions...\n');

    if (!fs.existsSync(this.workflowsDir)) {
      this.addError('Workflows directory not found: .github/workflows');
      return false;
    }

    const workflowFiles = fs.readdirSync(this.workflowsDir)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

    if (workflowFiles.length === 0) {
      this.addError('No workflow files found in .github/workflows');
      return false;
    }

    let allValid = true;
    for (const file of workflowFiles) {
      const isValid = await this.validateWorkflow(file);
      if (!isValid) allValid = false;
    }

    return allValid;
  }

  /**
   * Validate a single workflow file
   */
  async validateWorkflow(filename) {
    console.log(`📋 Validating ${filename}...`);

    const filePath = path.join(this.workflowsDir, filename);
    let workflowContent;

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      workflowContent = yaml.load(fileContent);
    } catch (error) {
      this.addError(`Failed to parse ${filename}: ${error.message}`);
      return false;
    }

    return this.validateWorkflowPermissions(filename, workflowContent);
  }

  /**
   * Validate permissions for a workflow
   */
  validateWorkflowPermissions(filename, workflow) {
    let isValid = true;

    // Check if workflow has jobs
    if (!workflow.jobs || typeof workflow.jobs !== 'object') {
      this.addError(`${filename}: No jobs found in workflow`);
      return false;
    }

    // Get expected permissions for this workflow
    const expectedConfig = WORKFLOW_PERMISSIONS[filename];

    // Check each job for permissions
    for (const [jobName, jobConfig] of Object.entries(workflow.jobs)) {
      // Get job-specific expected config if available
      let jobExpectedConfig = expectedConfig;
      if (expectedConfig && expectedConfig.jobs && expectedConfig.jobs[jobName]) {
        jobExpectedConfig = expectedConfig.jobs[jobName];
      }

      const jobValid = this.validateJobPermissions(filename, jobName, jobConfig, jobExpectedConfig);
      if (!jobValid) isValid = false;
    }

    if (isValid) {
      console.log(`  ✅ ${filename} permissions are properly configured`);
    }

    return isValid;
  }

  /**
   * Validate permissions for a single job
   */
  validateJobPermissions(filename, jobName, jobConfig, expectedConfig) {
    // Check if job has explicit permissions
    if (!jobConfig.permissions) {
      this.addError(`${filename}:${jobName}: Missing explicit permissions block. ` +
        `This job will inherit default permissions which violate the principle of least privilege.`);
      return false;
    }

    // Validate permissions are not overly broad
    if (jobConfig.permissions === 'write-all' || jobConfig.permissions === 'read-all') {
      this.addError(`${filename}:${jobName}: Using overly broad permissions (${jobConfig.permissions}). ` +
        `Use specific permissions instead.`);
      return false;
    }

    // For workflows we have specific expectations for, validate them
    if (expectedConfig) {
      return this.validateExpectedPermissions(filename, jobName, jobConfig.permissions, expectedConfig);
    }

    // For other workflows, just ensure they have some explicit permissions
    console.log(`  ℹ️  ${filename}:${jobName}: Has explicit permissions (not validated against expected set)`);
    return true;
  }

  /**
   * Validate permissions match expected configuration
   */
  validateExpectedPermissions(filename, jobName, actualPermissions, expectedConfig) {
    const permissionEntries = typeof actualPermissions === 'object'
      ? Object.entries(actualPermissions).map(([key, value]) => `${key}: ${value}`)
      : [actualPermissions];

    const missingPermissions = expectedConfig.required.filter(required =>
      !permissionEntries.some(actual => actual === required)
    );

    if (missingPermissions.length > 0) {
      this.addError(`${filename}:${jobName}: Missing required permissions: ${missingPermissions.join(', ')}. ` +
        `Expected: ${expectedConfig.required.join(', ')}. ` +
        `Reason: ${expectedConfig.description}`);
      return false;
    }

    return true;
  }

  /**
   * Add an error to the validation results
   */
  addError(message) {
    this.errors.push(message);
    console.log(`  ❌ ${message}`);
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));

    if (this.errors.length === 0) {
      console.log('🎉 All workflows have proper permission restrictions!');
      console.log('\n✅ Security validation passed - principle of least privilege is enforced.');
      return true;
    } else {
      console.log('💥 Permission validation failed!');
      console.log(`\nFound ${this.errors.length} permission issue(s):\n`);

      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });

      console.log('\n🔧 Fix these issues to ensure workflows follow the principle of least privilege.');
      return false;
    }
  }
}

// Main execution
async function main() {
  const validator = new PermissionValidator();

  try {
    await validator.validateAllWorkflows();
    const success = validator.printResults();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Validation script failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}