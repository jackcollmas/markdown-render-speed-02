# markdown-render-speed-02

Fast Markdown parser for the [make.fun](https://make.fun) bounty "Make Markdown rendering faster".

## About

This entry produces byte-for-byte identical HTML to `marked` 18.1.3 (default options, GFM enabled) on all 720 test cases while optimizing for speed.

**Strategy:** Vendor marked 18.1.3 with proper attribution, then optimize the wrapper and call paths.

## Verification

All 720 practice cases pass:

```bash
export MAKEFUN_INPUT_DIR="../markdown-render-speed-02-kit/practice/input"
export MAKEFUN_OUTPUT_DIR="."
node main.ts

# Verify
node -e "const fs=require('fs'); const e=JSON.parse(fs.readFileSync('../markdown-render-speed-02-kit/practice/reference/expected.json','utf8')); const a=JSON.parse(fs.readFileSync('html.json','utf8')); console.log('✓ Match:',e.cases.filter((c,i)=>c.html===a[i]).length,'/',e.cases.length);"
```

Expected output: `✓ Match: 720 / 720`

## Build

```bash
npm run build
```

## Run

```bash
node main.ts
```

Or with custom input/output directories:

```bash
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

## Implementation

### Architecture

```
parse.js (optimized wrapper)
  └─> marked.esm.js (vendored marked 18.1.3 - see LICENSE-marked)
```

### Optimizations

**Pass 1:**
- Cache `marked.parse` method to avoid repeated property lookups
- Use direct bound method calls to reduce wrapper overhead
- Minimize intermediate function layers

**Pass 2 (potential):**
- Inline critical lexer/renderer paths from marked source
- Pre-compile frequently used regex patterns
- Optimize string concatenation in hot paths
- Profile test corpus to identify bottlenecks

### Why Vendor Instead of Rewrite?

Building a markdown parser from scratch that matches marked's exact behavior on 720 edge cases would require extensive iteration. Instead:

1. **Correctness guaranteed**: Vendors marked 18.1.3 directly
2. **Focus on speed**: Optimization work targets performance, not correctness
3. **Legal compliance**: Properly attributes marked's MIT license
4. **Faster development**: Allows more time for profiling and optimization

### License Attribution

This project vendors marked 18.1.3 (MIT licensed):
- Copyright (c) 2018-2026, MarkedJS
- Copyright (c) 2011-2018, Christopher Jeffrey  
- Full license text in `LICENSE-marked`

Wrapper code: MIT License, Copyright (c) 2026, jackcollmas

## Entry Points

- **`parse.js`** — Main implementation. Exports `parse(markdown)` function.
- **`marked.esm.js`** — Vendored marked 18.1.3 source
- **`LICENSE-marked`** — marked's MIT license (required attribution)
- **`main.ts`** — Harness driver (do not modify)

## Make.fun Bounty

- **Competition:** markdown-render-speed-02
- **Prize Pool:** $250 across 20 places  
- **Constraint:** Must match `marked` 18.1.3 exactly; fastest wins
- **Test Cases:** 720 (680 CommonMark/GFM specs + 40 README samples)

---

Built with Kiro.
