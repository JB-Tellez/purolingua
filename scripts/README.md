# scripts

## Overview
This directory holds developer tooling scripts. Right now it contains one script, `analyze-test-coverage.ts`. It is a static CLI that looks for exports and logic branches with no matching test file or test reference. It uses regular expressions on each line, not a TypeScript AST. `AGENTS.md` asks you to run it on changed files as part of the TDD workflow.

`__tests__/` contains only tests, so it has no contract of its own.

## Interface
- CLI: `node scripts/analyze-test-coverage.ts <file-or-directory>`. It prints a Markdown report to stdout.
- Exported functions (from `analyze-test-coverage.ts`):
  - `parseExports(source: string): Array<{ kind; name; line }>`: finds exported declarations only: `export [default] [async] function`, `export const|let|var`, `export [default] class` (plus the methods directly in that class body), and `export interface|type`.
  - `parseLogicBranches(source: string): Array<{ type; line; text }>`: finds `if`, `else`, `for`/`while`, `switch`, `catch`, ternary, optional chaining, and `return` lines.
  - `findTestFile(sourceFilePath: string): string | null`
  - `parseTestFile(testFilePath: string, source: string): string[]`: collects the identifiers a test file references, from imports, string literals, and calls.
  - `analyzeGaps(exports, branches, testedNames): Gap[]`
  - `generateMarkdownReport(sourcePath, testPath, exports, branches, gaps): string`
  - `runCLI(argv: string[] = process.argv.slice(2)): void`
- Internal (not exported): `interface Gap`, `runOnFile`, and `runOnDirectory`.

## Invariants
- Comment lines (those starting with `//`, `*`, or `/*`) are skipped when parsing exports and branches.
- `parseExports` ignores non-exported declarations: private helpers are expected to be tested through the exports that use them. Object-literal methods inside functions are not reported as class methods.
- `analyzeGaps` treats an export as tested when any tested name matches it case-insensitively or is a case-insensitive substring of the export name. This matching is loose and can produce false negatives (gaps that go unreported).
- Severity rules: a missing `function`, `class`, or `method` is `high`. A missing `const` whose name starts with `use` is `high`. A missing `interface` or `type` is `low` (tsc already checks them). Every other missing export is `medium`. Only `catch` and `switch` branches are reported as logic-branch gaps, always as `medium`.
- `findTestFile` checks these locations in order, returning the first that exists: sibling `<name>{TEST_SUFFIXES}`, `__tests__/<name>.ts(x)`, `__tests__/<name>{TEST_SUFFIXES}`, and, for sources under `src/`, the mirror `src/__tests__/<same dirs>/<name>{TEST_SUFFIXES}`; for sources under `src/app/`, also `src/__tests__/components/<name>{TEST_SUFFIXES}` (study sessions) and `src/__tests__/app/<name>{TEST_SUFFIXES}`. `TEST_SUFFIXES` is `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`. The mirror resolves from `process.cwd()`, so run the CLI from the repository root.
- Tests named after a behaviour rather than their source file are not found. For example, route `page.tsx` / `layout.tsx` files are covered by `src/__tests__/app/localeValidation.test.tsx` and `listPageHeadings.test.tsx`, but the analyzer reports them as missing a test file.
- In directory mode, the script skips dot-directories and `node_modules`, and it skips `*.test.*` and `*.spec.*` files. It only analyzes `.ts`, `.tsx`, `.js`, and `.jsx` files. Non-test files inside test folders are analyzed like source: on `src/`, `src/__tests__/setup.ts` shows its exported mocks as untested gaps; ignore that entry.
- `runCLI` runs automatically only when the module is the process entry point (it compares `process.argv[1]` with `import.meta.url`). Importing the module in tests does not run the CLI.

## Side Effects
- Reads the filesystem synchronously (`fs.readFileSync`, `fs.existsSync`, `fs.statSync`, `fs.readdirSync`).
- Writes the report to stdout with `console.log`, and writes warnings and errors with `console.warn` and `console.error`.
- `runCLI` calls `process.exit(1)` when no argument is given, the path does not exist, or the path is neither a file nor a directory.
- It never writes files.

## Verification
- Run: `npx vitest run --config vitest.scripts.config.ts` (runs `scripts/__tests__/analyze-test-coverage.test.ts`). The main `vitest.config.ts` also includes `scripts/__tests__/**`, so `npx vitest run scripts/__tests__` works too.
- Smoke test: `node scripts/analyze-test-coverage.ts src/lib/`
