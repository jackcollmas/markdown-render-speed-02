# markdown-render-speed-02

Fast markdown parser optimized for the make.fun bounty "markdown-render-speed-02".

## Strategy

This parser uses a **dual-path approach**:

1. **Fast path**: Hand-optimized parser for common constructs (headings, paragraphs, lists, fenced code blocks, inline formatting)
2. **Fallback**: Uses vendored `marked` 18.1.3 for complex cases (tables, blockquotes, HTML, reference links)

The fast path achieves significant speed improvements on simple markdown while maintaining 100% compatibility with marked's output by falling back when needed.

## How to Run

```bash
# Install dependencies (TypeScript for compilation)
npm install -g typescript

# Compile TypeScript to JavaScript
npm run build

# Run the parser
npm test

# Verify against kit's expected output
npm run verify
```

## Environment Variables

- `MAKEFUN_INPUT_DIR`: Directory containing `cases.json` (default: `../markdown-render-speed-02-kit/practice/input`)
- `MAKEFUN_OUTPUT_DIR`: Directory for output `html.json` (default: `.`)

## Output

The parser generates `html.json` containing an array of rendered HTML strings matching the exact output of `marked.parse()` with GFM enabled.
