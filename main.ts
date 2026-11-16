#!/usr/bin/env node
/**
 * Markdown rendering speed test harness
 * 
 * Reads markdown test cases, renders each with our optimized parser,
 * and writes the HTML output for verification.
 * 
 * Environment variables:
 * - MAKEFUN_INPUT_DIR: Directory containing cases.json (default: /input)
 * - MAKEFUN_OUTPUT_DIR: Directory for html.json output (default: /output)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Read test cases
const casesPath = join(INPUT_DIR, 'cases.json');
const cases = JSON.parse(readFileSync(casesPath, 'utf8')) as { id: string; markdown: string }[];

// Parse each case
const html: string[] = [];
const startTime = Date.now();

for (const testCase of cases) {
  html.push(parse(testCase.markdown));
}

const endTime = Date.now();
const elapsed = endTime - startTime;

// Write output
const outputPath = join(OUTPUT_DIR, 'html.json');
writeFileSync(outputPath, JSON.stringify(html));

// Log performance stats
console.log(`✓ Parsed ${cases.length} cases in ${elapsed}ms`);
console.log(`  Average: ${(elapsed / cases.length).toFixed(3)}ms per case`);
