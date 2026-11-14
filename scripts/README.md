# scripts

## Overview
This directory holds developer tooling scripts. Right now it contains one script, `analyze-test-coverage.ts`. It is a static CLI that looks for exports and logic branches with no matching test file or test reference. It uses regular expressions on each line, not a TypeScript AST. `AGENTS.md` asks you to run it on changed files as part of the TDD workflow.

`__tests__/` contains only tests, so it has no contract of its own.

## Interface
- CLI: `node scripts/analyze-test-coverage.ts <file-or-directory>`. It prints a Markdown report to stdout.
- Exported functions (from `analyze-test-coverage.ts`):
  - `parseExports(source: string): Array<{ kind; name; line }>`: finds `function`, `export const|let|var`, `class`, indented method-like lines, and `interface`/`type` declarations.
  - `parseLogicBranches(source: string): Array<{ type; line; text }>`: finds `if`, `else`, `for`/`while`, `switch`, `catch`, ternary, optional chaining, and `return` lines.
  - `findTestFile(sourceFilePath: string): string | null`
  - `parseTestFile(testFilePath: string, source: string): string[]`: collects the identifiers a test file references, from imports, string literals, and calls.
  - `analyzeGaps(exports, branches, testedNames): Gap[]`
  - `generateMarkdownReport(sourcePath, testPath, exports, branches, gaps): string`
  - `runCLI(argv: string[] = process.argv.slice(2)): void`
- Internal (not exported): `interface Gap`, `runOnFile`, and `runOnDirectory`.

## Invariants
- Comment lines (those starting with `//`, `*`, or `/*`) are skipped when parsing exports and branches.
- `parseExports` matches any `function name`, even when it is not exported. So module-private functions are reported as "exports".
- `analyzeGaps` treats an export as tested when any tested name matches it case-insensitively or is a case-insensitive substring of the export name. This matching is loose and can produce false negatives (gaps that go unreported).
- Severity rules: a missing `function`, `class`, or `method` is `high`. A missing `const` whose name starts with `use` is `high`. Every other missing export is `medium`. Only `catch` and `switch` branches are reported as logic-branch gaps, always as `medium`. No rule ever produces `low`.
- `findTestFile` checks these locations in order, returning the first that exists: sibling `<name>{TEST_SUFFIXES}`, `__tests__/<name>.ts(x)`, `__tests__/<name>{TEST_SUFFIXES}`, and, for sources under `src/`, the mirror `src/__tests__/<same dirs>/<name>{TEST_SUFFIXES}`. `TEST_SUFFIXES` is `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`. The mirror resolves from `process.cwd()`, so run the CLI from the repository root.
- Tests that do not mirror their source path are not found. For example, `src/app/[lang]/rephrase/[deck]/StudySession.tsx` is tested by `src/__tests__/components/StudySession.test.tsx`.
- In directory mode, the script skips dot-directories and `node_modules`, and it skips `*.test.*` and `*.spec.*` files. It only analyzes `.ts`, `.tsx`, `.js`, and `.jsx` files.
- `runCLI` runs automatically only when the module is the process entry point (it compares `process.argv[1]` with `import.meta.url`). Importing the module in tests does not run the CLI.

## Side Effects
- Reads the filesystem synchronously (`fs.readFileSync`, `fs.existsSync`, `fs.statSync`, `fs.readdirSync`).
- Writes the report to stdout with `console.log`, and writes warnings and errors with `console.warn` and `console.error`.
- `runCLI` calls `process.exit(1)` when no argument is given, the path does not exist, or the path is neither a file nor a directory.
- It never writes files.

## Verification
- Run: `npx vitest run --config vitest.scripts.config.ts` (runs `scripts/__tests__/analyze-test-coverage.test.ts`). The main `vitest.config.ts` also includes `scripts/__tests__/**`, so `npx vitest run scripts/__tests__` works too.
- Smoke test: `node scripts/analyze-test-coverage.ts src/lib/`
