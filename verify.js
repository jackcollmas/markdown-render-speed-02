import { readFileSync } from 'fs';

const expected = JSON.parse(readFileSync('../markdown-render-speed-02-kit/practice/reference/expected.json', 'utf8'));
const actual = JSON.parse(readFileSync('html.json', 'utf8'));

let matches = 0;
let mismatches = [];

for (let i = 0; i < expected.cases.length; i++) {
  if (expected.cases[i].html === actual[i]) {
    matches++;
  } else {
    mismatches.push(i);
  }
}

console.log(matches === 720 ? '✅ PASS' : '❌ FAIL', '-', matches, '/ 720');

if (mismatches.length > 0 && mismatches.length <= 10) {
  console.log('\nFirst mismatches:', mismatches.slice(0, 5));
}
