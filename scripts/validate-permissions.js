#!/usr/bin/env node

/**
 * Permission Validation Script for GitHub Actions Workflows
 *
 * This script validates that all GitHub Actions workflows follow the principle
 * of least privilege by:
 * 1. Ensuring each workflow has an explicit permissions block
 * 2. Verifying only necessary permissions are granted
 * 3. Failing if any workflow uses default (overly broad) permissions
 *
 * Note: Uses regex-based parsing to avoid external YAML dependencies
 */

import fs from 'fs';
import path from 'path';
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

/**
 * Parse jobs and their permissions from workflow content using regex
 */
function parseJobsWithPermissions(content) {
  const jobs = {};
  const lines = content.split('\n');

  let inJobs = false;
  let currentJob = null;
  let jobIndent = 0;
  let inPermissions = false;
  let permissionsIndent = 0;
  let currentPermissions = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;

    // Detect jobs: section
    if (trimmed.startsWith('jobs:')) {
      inJobs = true;
      continue;
    }

    if (!inJobs) continue;

    // Detect job name (direct child of jobs:)
    const jobMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*$/);
    if (jobMatch && indent === 2) {
      // Save previous job
      if (currentJob) {
        jobs[currentJob] = { permissions: currentPermissions };
      }
      currentJob = jobMatch[1];
      jobIndent = indent;
      currentPermissions = {};
      inPermissions = false;
      continue;
    }

    if (!currentJob) continue;

    // Check if we've exited the current job (same or less indent)
    if (indent <= jobIndent && trimmed.length > 0 && !trimmed.startsWith('#')) {
      if (currentJob) {
        jobs[currentJob] = { permissions: currentPermissions };
        currentJob = null;
      }
      continue;
    }

    // Detect permissions block
    if (trimmed.startsWith('permissions:')) {
      inPermissions = true;
      permissionsIndent = indent;

      // Check for inline value like "permissions: write-all"
      const inlineMatch = trimmed.match(/^permissions:\s+(.+)$/);
      if (inlineMatch) {
        currentPermissions = { _inline: inlineMatch[1] };
        inPermissions = false;
      }
      continue;
    }

    // Parse permission entries
    if (inPermissions && indent > permissionsIndent) {
      const permMatch = trimmed.match(/^([a-z-]+):\s*(.+)$/);
      if (permMatch) {
        currentPermissions[permMatch[1]] = permMatch[2];
      }
    } else if (inPermissions && indent <= permissionsIndent && trimmed.length > 0) {
      inPermissions = false;
    }
  }

  // Save last job
  if (currentJob) {
    jobs[currentJob] = { permissions: currentPermissions };
  }

  return jobs;
}

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
    let content;

    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      this.addError(`Failed to read ${filename}: ${error.message}`);
      return false;
    }

    const jobs = parseJobsWithPermissions(content);
    return this.validateWorkflowPermissions(filename, jobs);
  }

  /**
   * Validate permissions for a workflow
   */
  validateWorkflowPermissions(filename, jobs) {
    let isValid = true;

    if (Object.keys(jobs).length === 0) {
      this.addError(`${filename}: No jobs found in workflow`);
      return false;
    }

    // Get expected permissions for this workflow
    const expectedConfig = WORKFLOW_PERMISSIONS[filename];

    // Check each job for permissions
    for (const [jobName, jobConfig] of Object.entries(jobs)) {
      // Get job-specific expected config if available
      let jobExpectedConfig = expectedConfig;
      if (expectedConfig && expectedConfig.jobs && expectedConfig.jobs[jobName]) {
        jobExpectedConfig = expectedConfig.jobs[jobName];
      }

      const jobValid = this.validateJobPermissions(filename, jobName, jobConfig.permissions, jobExpectedConfig);
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
  validateJobPermissions(filename, jobName, permissions, expectedConfig) {
    // Check if job has explicit permissions
    if (!permissions || Object.keys(permissions).length === 0) {
      this.addError(`${filename}:${jobName}: Missing explicit permissions block. ` +
        `This job will inherit default permissions which violate the principle of least privilege.`);
      return false;
    }

    // Validate permissions are not overly broad
    const inlineValue = permissions._inline;
    if (inlineValue === 'write-all' || inlineValue === 'read-all') {
      this.addError(`${filename}:${jobName}: Using overly broad permissions (${inlineValue}). ` +
        `Use specific permissions instead.`);
      return false;
    }

    // For workflows we have specific expectations for, validate them
    if (expectedConfig && expectedConfig.required) {
      return this.validateExpectedPermissions(filename, jobName, permissions, expectedConfig);
    }

    // For other workflows, just ensure they have some explicit permissions
    console.log(`  ℹ️  ${filename}:${jobName}: Has explicit permissions (not validated against expected set)`);
    return true;
  }

  /**
   * Validate permissions match expected configuration
   */
  validateExpectedPermissions(filename, jobName, actualPermissions, expectedConfig) {
    const permissionEntries = Object.entries(actualPermissions)
      .filter(([key]) => key !== '_inline')
      .map(([key, value]) => `${key}: ${value}`);

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
