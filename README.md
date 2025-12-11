# React Security & Performance Audit Plugin

This package audits React projects (React 16 and React 18) for **performance** and **security** issues and produces a downloadable structured report and a small UI to browse results.

## What it checks (high level)

1. Static AST-based performance heuristics (inline functions in props, large inline arrays, deprecated lifecycle usage).
2. Static security heuristics:
   - Use of `dangerouslySetInnerHTML`
   - Use of `eval`, `new Function`, or `setTimeout`/`setInterval` with string arguments
   - Direct assignments to `innerHTML` or `outerHTML`
   - Unescaped template usage in `dangerouslySetInnerHTML` or string concatenation into `innerHTML`
   - Presence of untrusted `target="_blank"` without `rel="noopener noreferrer"`
3. Dependency & compatibility checks:
   - Reads target project's `package.json` to detect React version (16.x vs 18.x)
   - Runs `npm audit --json` (if available) to include dependency vulnerability summary

## Quick usage
1. Install dependencies for this plugin: `npm install` (in plugin root)
2. Build UI: `npm run build-ui` (or go into `ui-src` and run `npm install` then `npm run build`)
3. Start your target project (if you want runtime profiling) or skip runtime profiling.
4. Run the CLI:

```
node ./src/cli.js --path "/path/to/target/project" --output ./my-report.json --serve 3001
```

Use `--no-runtime` to skip Puppeteer profiling.

## Download
After running the CLI with `--serve`, open `http://localhost:3001` and download the JSON report.

---

Detailed installation and troubleshooting steps are included inside the package files.