import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse } from './parse.js';

// Get input/output directories from environment
const inputDir = process.env.MAKEFUN_INPUT_DIR || '../markdown-render-speed-02-kit/practice/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '.';

// Read cases
const casesPath = join(inputDir, 'cases.json');
const casesData = JSON.parse(readFileSync(casesPath, 'utf8'));

// Process all cases
const startTime = performance.now();
const results = casesData.cases.map((testCase: { markdown: string }) => {
  return parse(testCase.markdown);
});
const endTime = performance.now();

// Write output
const outputPath = join(outputDir, 'html.json');
writeFileSync(outputPath, JSON.stringify(results, null, 2));

// Report timing
const duration = (endTime - startTime).toFixed(2);
console.log(`Processed ${results.length} cases in ${duration}ms`);
console.log(`Average: ${(parseFloat(duration) / results.length).toFixed(3)}ms per case`);
