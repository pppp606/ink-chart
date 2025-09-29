#!/usr/bin/env node

/**
 * Validation script to check that GitHub Actions are pinned to specific SHAs
 * This script will fail if any action uses version tags instead of commit SHAs
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_DIR = path.join(__dirname, '..', '.github', 'workflows');
const SHA_PATTERN = /^[a-f0-9]{40}$/; // Full 40-character SHA

// Expected actions that should be SHA-pinned
const EXPECTED_ACTIONS = [
  'actions/checkout',
  'actions/setup-node',
  'actions/create-release'
];

function validateWorkflowFile(filePath) {
  console.log(`\nValidating ${path.basename(filePath)}...`);

  const content = fs.readFileSync(filePath, 'utf8');
  const workflow = yaml.load(content);

  const violations = [];

  function checkSteps(steps, jobName = '') {
    if (!steps) return;

    steps.forEach((step, index) => {
      if (step.uses) {
        const [actionName, version] = step.uses.split('@');

        if (EXPECTED_ACTIONS.includes(actionName)) {
          if (!version || !SHA_PATTERN.test(version)) {
            violations.push({
              job: jobName,
              step: index + 1,
              action: step.uses,
              issue: version ? `Using version tag "${version}" instead of SHA` : 'Missing version/SHA'
            });
          }
        }
      }
    });
  }

  // Check all jobs
  if (workflow.jobs) {
    Object.entries(workflow.jobs).forEach(([jobName, job]) => {
      checkSteps(job.steps, jobName);
    });
  }

  return violations;
}

function main() {
  console.log('🔍 Validating GitHub Actions SHA Pinning...\n');

  if (!fs.existsSync(WORKFLOW_DIR)) {
    console.error('❌ Workflows directory not found');
    process.exit(1);
  }

  const workflowFiles = fs.readdirSync(WORKFLOW_DIR)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map(file => path.join(WORKFLOW_DIR, file));

  if (workflowFiles.length === 0) {
    console.error('❌ No workflow files found');
    process.exit(1);
  }

  let totalViolations = 0;

  workflowFiles.forEach(filePath => {
    const violations = validateWorkflowFile(filePath);
    totalViolations += violations.length;

    if (violations.length === 0) {
      console.log('✅ All actions properly SHA-pinned');
    } else {
      console.log(`❌ Found ${violations.length} violations:`);
      violations.forEach(violation => {
        console.log(`  - Job "${violation.job}", Step ${violation.step}: ${violation.action}`);
        console.log(`    ${violation.issue}`);
      });
    }
  });

  console.log(`\n📊 Summary: ${totalViolations} total violations found`);

  if (totalViolations > 0) {
    console.log('\n❌ SHA pinning validation failed');
    console.log('All GitHub Actions should use specific commit SHAs instead of version tags for security.');
    process.exit(1);
  } else {
    console.log('\n✅ All GitHub Actions are properly SHA-pinned');
    process.exit(0);
  }
}

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateWorkflowFile };