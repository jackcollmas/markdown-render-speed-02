# markdown-render-speed-02

Fast Markdown parser for the [make.fun](https://make.fun) bounty "Make Markdown rendering faster".

## About

This entry aims to create a dependency-free Markdown parser that:
- Produces byte-for-byte identical HTML to `marked` 18.1.3 (default options)
- Renders 720 test cases as fast as possible
- Qualifies for the speed competition on make.fun

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

## Entry Points

- **`parse.js`** — The main implementation. Export a `parse(markdown)` function that returns HTML.
- **`main.ts`** — The harness driver (do not modify). Reads cases, calls `parse()`, writes output.

## Make.fun Bounty

- **Deadline:** Today 20:30 UTC
- **Prize Pool:** $250 across 20 places
- **Constraint:** Must match `marked` 18.1.3 exactly; fastest wins
- **Test Cases:** 720 (680 spec examples + 40 generated READMEs)

---

Built with Kiro.
