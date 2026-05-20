#!/usr/bin/env node

/**
 * Validates that every third-party GitHub Action used in workflow files is
 * pinned to a full 40-character commit SHA. Local actions (./...) and Docker
 * actions (docker://...) are skipped.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_DIR = path.join(__dirname, '..', '.github', 'workflows');
const SHA_PATTERN = /^[a-f0-9]{40}$/;
const USES_PATTERN = /^\s*-?\s*uses:\s*['"]?([^@\s'"]+)@([^\s'"#]+)/gm;

function isPinnable(actionName) {
  if (actionName.startsWith('./')) return false;
  if (actionName.startsWith('docker://')) return false;
  return true;
}

function validateWorkflowFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  let match;
  while ((match = USES_PATTERN.exec(content)) !== null) {
    const actionName = match[1];
    const version = match[2];

    if (!isPinnable(actionName)) continue;

    if (!SHA_PATTERN.test(version)) {
      violations.push({
        action: `${actionName}@${version}`,
        issue: `Using mutable ref "${version}" instead of a 40-character commit SHA`,
      });
    }
  }

  return violations;
}

function main() {
  console.log('🔍 Validating GitHub Actions SHA Pinning...\n');

  if (!fs.existsSync(WORKFLOW_DIR)) {
    console.error('❌ Workflows directory not found');
    process.exit(1);
  }

  const workflowFiles = fs
    .readdirSync(WORKFLOW_DIR)
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map((file) => path.join(WORKFLOW_DIR, file));

  if (workflowFiles.length === 0) {
    console.error('❌ No workflow files found');
    process.exit(1);
  }

  let totalViolations = 0;

  workflowFiles.forEach((filePath) => {
    console.log(`\nValidating ${path.basename(filePath)}...`);
    const violations = validateWorkflowFile(filePath);
    totalViolations += violations.length;

    if (violations.length === 0) {
      console.log('✅ All actions properly SHA-pinned');
    } else {
      console.log(`❌ Found ${violations.length} violation(s):`);
      violations.forEach((violation) => {
        console.log(`  - ${violation.action}`);
        console.log(`    ${violation.issue}`);
      });
    }
  });

  console.log(`\n📊 Summary: ${totalViolations} total violation(s) found`);

  if (totalViolations > 0) {
    console.log('\n❌ SHA pinning validation failed');
    console.log('All third-party GitHub Actions must use a full 40-character commit SHA.');
    process.exit(1);
  }

  console.log('\n✅ All GitHub Actions are properly SHA-pinned');
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateWorkflowFile };
