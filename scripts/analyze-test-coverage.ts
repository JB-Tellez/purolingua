#!/usr/bin/env node
/**
 * analyze-test-coverage.ts
 *
 * Static analysis tool that identifies missing test coverage for a given
 * source file or directory. It searches for corresponding .test.ts / .spec.ts
 * files and reports functions, classes, or logic branches that lack tests.
 *
 * Usage:
 *   node scripts/analyze-test-coverage.ts <file-or-directory>
 *   node scripts/analyze-test-coverage.ts src/hooks/useVoiceRecognition.ts
 *   node scripts/analyze-test-coverage.ts src/lib/
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// 1. Parsing helpers — extract exports, classes, methods, logic branches
// ---------------------------------------------------------------------------

export function parseExports(source: string): Array<{ kind: string; name: string; line: number }> {
  const exports: Array<{ kind: string; name: string; line: number }> = [];
  const lines = source.split('\n');

  // Only exported declarations count: private helpers are tested through the
  // exports that use them. Methods count only inside an exported class body.
  const excludedMethods = new Set([
    'constructor', 'render',
    'useEffect', 'useState', 'useCallback', 'useMemo', 'useRef', 'useContext',
    'useId', 'useTransition', 'useDeferredValue', 'useLayoutEffect',
    'useInsertionEffect', 'useDebugValue', 'useSyncExternalStore', 'useReducer',
    'useActionState', 'useFormStatus', 'useOptimistic',
    // Control flow keywords that can appear indented inside methods
    'if', 'else', 'for', 'while', 'switch', 'catch', 'return', 'throw',
    'try', 'new', 'delete', 'typeof', 'void', 'debugger', 'with',
    'await', 'yield',
  ]);
  let classDepth = 0; // brace depth inside an exported class; 0 = not in one
  const braceDelta = (line: string) => (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    if (classDepth > 0) {
      // Methods sit directly in the class body (depth 1).
      const methodMatch = classDepth === 1 && line.match(/^\s+(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?[\s{]/);
      if (methodMatch && !excludedMethods.has(methodMatch[1])) {
        exports.push({ kind: 'method', name: methodMatch[1], line: lineNum });
      }
      classDepth += braceDelta(line);
      return;
    }

    // export [default] [async] function name(...)
    const fnMatch = line.match(/^\s*export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/);
    if (fnMatch) {
      exports.push({ kind: 'function', name: fnMatch[1], line: lineNum });
      return;
    }

    // export const/let/var name = ...
    const constMatch = line.match(/^\s*export\s+(?:const|let|var)\s+(\w+)\s*[=(:]/);
    if (constMatch) {
      exports.push({ kind: 'const', name: constMatch[1], line: lineNum });
      return;
    }

    // export [default] class ClassName
    const classMatch = line.match(/^\s*export\s+(?:default\s+)?class\s+(\w+)/);
    if (classMatch) {
      exports.push({ kind: 'class', name: classMatch[1], line: lineNum });
      classDepth = braceDelta(line);
      return;
    }

    // export interface / type
    const keywordMatch = line.match(/^\s*export\s+(interface|type)\s+(\w+)/);
    if (keywordMatch) {
      exports.push({ kind: keywordMatch[1], name: keywordMatch[2], line: lineNum });
    }
  });

  return exports;
}

export function parseLogicBranches(source: string): Array<{ type: string; line: number; text: string }> {
  const branches: Array<{ type: string; line: number; text: string }> = [];
  const lines = source.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    // if / else if
    if (/\bif\s*\(/.test(trimmed)) {
      branches.push({ type: 'if', line: lineNum, text: trimmed });
    }

    // else (bare or else if is already caught above)
    if (/^\s*else\s*$/.test(trimmed) || /else\s*\{/.test(trimmed) || /else\s*$/.test(trimmed)) {
      branches.push({ type: 'else', line: lineNum, text: trimmed });
    }

    // for / while
    if (/\b(for|while)\s*\(/.test(trimmed)) {
      branches.push({ type: trimmed.startsWith('for') ? 'for' : 'while', line: lineNum, text: trimmed });
    }

    // switch
    if (/\bswitch\s*\(/.test(trimmed)) {
      branches.push({ type: 'switch', line: lineNum, text: trimmed });
    }

    // catch
    if (/\bcatch\s*\(/.test(trimmed)) {
      branches.push({ type: 'catch', line: lineNum, text: trimmed });
    }

    // Ternary: ? ... :
    if (/\?\s*[^?]/.test(trimmed) && trimmed.includes(':')) {
      branches.push({ type: 'ternary', line: lineNum, text: trimmed });
    }

    // Optional chaining
    if (/\?\./.test(trimmed) || /\?[\.\[\(]/.test(trimmed)) {
      branches.push({ type: 'optional', line: lineNum, text: trimmed });
    }

    // Early return patterns
    if (/^\s*return\s+/.test(trimmed) && /^\s{0,2}/.test(line)) {
      branches.push({ type: 'early-return', line: lineNum, text: trimmed });
    }
  });

  return branches;
}

// ---------------------------------------------------------------------------
// 2. Test file discovery
// ---------------------------------------------------------------------------

const TEST_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];

export function findTestFile(sourceFilePath: string): string | null {
  const baseDir = path.dirname(sourceFilePath);
  const baseName = path.basename(sourceFilePath, path.extname(sourceFilePath));
  const withSuffixes = (base: string) => TEST_SUFFIXES.map((suffix) => `${base}${suffix}`);

  const candidates: string[] = [
    ...withSuffixes(path.join(baseDir, baseName)),
    path.join(baseDir, '__tests__', `${baseName}.ts`),
    path.join(baseDir, '__tests__', `${baseName}.tsx`),
    ...withSuffixes(path.join(baseDir, '__tests__', baseName)),
  ];

  // Also check src/__tests__/ mirror of src/ path
  try {
    const relativePath = path.relative(path.join(process.cwd(), 'src'), sourceFilePath);
    if (relativePath && !relativePath.startsWith('..')) {
      const mirroredBase = path.join(
        process.cwd(), 'src', '__tests__',
        path.dirname(relativePath),
        baseName
      );
      candidates.push(...withSuffixes(mirroredBase));
      // Route components under src/app/ are tested from src/__tests__/components/
      // (study sessions) or src/__tests__/app/ (pages), not a mirror of their route path.
      if (relativePath.split(path.sep)[0] === 'app') {
        for (const dir of ['components', 'app']) {
          candidates.push(...withSuffixes(path.join(process.cwd(), 'src', '__tests__', dir, baseName)));
        }
      }
    }
  } catch (e) {
    // path.relative can throw on Windows; ignore
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function parseTestFile(testFilePath: string, source: string): string[] {
  const testedNames: string[] = [];
  const lines = source.split('\n');

  // Common test utilities to exclude
  const testUtils = new Set([
    'if', 'for', 'while', 'switch', 'catch', 'expect', 'vi', 'act', 'render', 'screen',
    'beforeEach', 'afterEach', 'describe', 'it', 'test', 'expectTypeOf', 'assertType',
    'assert', 'not', 'toMatchObject', 'toHaveClass', 'toBe', 'toBeUndefined', 'toBeNull',
    'toBeTruthy', 'toBeFalsy', 'toHaveLength', 'toContain', 'toContainEqual', 'toEqual',
    'toThrow', 'toThrowError', 'toMatch', 'toMatchInlineSnapshot', 'toMatchSnapshot',
    'toStrictEqual', 'toThrowMatching', 'resolve', 'rejects'
  ]);

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Import patterns: import { SomeName } from '...'
    const importMatch = line.match(/(?:import|export)\s+.*\{([^}]+)\}/);
    if (importMatch) {
      importMatch[1].split(',').forEach((part) => {
        const name = part.trim().split(/\s+/)[0];
        if (name && !testUtils.has(name) && !['from', 'as', 'type', '*'].includes(name)) {
          testedNames.push(name);
        }
      });
    }

    // describe/it strings referencing names
    const stringMatch = line.match(/['"`]([^'"`]+)['"`]/);
    if (stringMatch) {
      const str = stringMatch[1];
      // Look for camelCase, PascalCase, or lowercase identifiers in test strings
      const names = str.match(/[A-Z][a-z]+\w*|_\w+|\w+[A-Z]\w*|\b[a-z]+\b/g);
      if (names) {
        testedNames.push(...names);
      }
    }

    // Direct function calls: useSomething(...), something(...)
    const callMatch = line.match(/(\w+)\s*\(/);
    if (callMatch && !testUtils.has(callMatch[1])) {
      testedNames.push(callMatch[1]);
    }
  });

  return [...new Set(testedNames)];
}

// ---------------------------------------------------------------------------
// 3. Gap analysis
// ---------------------------------------------------------------------------

interface Gap {
  type: string;
  kind?: string;
  name: string;
  line: number;
  severity: string;
}

export function analyzeGaps(exports: Array<{ kind: string; name: string; line: number }>, branches: Array<{ type: string; line: number; text: string }>, testedNames: string[]): Gap[] {
  const gaps: Gap[] = [];

  // Check exports
  exports.forEach((exp) => {
    const isTested = testedNames.some(
      (t) => t.toLowerCase() === exp.name.toLowerCase() || exp.name.toLowerCase().includes(t.toLowerCase())
    );

    if (!isTested) {
      // Types and interfaces are already checked by tsc, so they rank lowest.
      const severity =
        exp.kind === 'function' || exp.kind === 'class' || exp.kind === 'method'
          ? 'high'
          : exp.kind === 'const' && exp.name.startsWith('use')
            ? 'high'
            : exp.kind === 'interface' || exp.kind === 'type'
              ? 'low'
              : 'medium';

      gaps.push({
        type: 'export',
        kind: exp.kind,
        name: exp.name,
        line: exp.line,
        severity,
      });
    }
  });

  // Check logic branches — flag catch blocks and switch statements
  branches.forEach((branch) => {
    if (branch.type === 'catch' || branch.type === 'switch') {
      gaps.push({
        type: 'logic-branch',
        name: `${branch.type}-block`,
        line: branch.line,
        severity: 'medium',
      });
    }
  });

  return gaps;
}

// ---------------------------------------------------------------------------
// 4. Report generation
// ---------------------------------------------------------------------------

export function generateMarkdownReport(sourcePath: string, testPath: string | null, exports: Array<{ kind: string; name: string; line: number }>, branches: Array<{ type: string; line: number; text: string }>, gaps: Gap[]): string {
  const lines: string[] = [];

  lines.push('# Test Coverage Analysis Report');
  lines.push('');
  lines.push(`**Source:** \`${sourcePath}\``);
  lines.push(`**Test file:** ${testPath || '_Not found_'} (` + (testPath ? 'found' : 'missing') + `)`);
  lines.push('');

  // Summary
  const highGaps = gaps.filter((g) => g.severity === 'high');
  const mediumGaps = gaps.filter((g) => g.severity === 'medium');
  const lowGaps = gaps.filter((g) => g.severity === 'low');

  lines.push('## Summary');
  lines.push('');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  lines.push(`| High severity | ${highGaps.length} |`);
  lines.push(`| Medium severity | ${mediumGaps.length} |`);
  lines.push(`| Low severity | ${lowGaps.length} |`);
  lines.push(`| **Total gaps** | **${gaps.length}** |`);
  lines.push('');

  if (gaps.length === 0) {
    lines.push('No test gaps detected. Good work!');
    lines.push('');
    return lines.join('\n');
  }

  // Gaps by export
  const exportGaps = gaps.filter((g) => g.type === 'export');
  if (exportGaps.length > 0) {
    lines.push(`## Missing Export Tests (${exportGaps.length})`);
    lines.push('');
    lines.push('| Severity | Kind | Name | Line |');
    lines.push('|----------|------|------|------|');
    exportGaps.forEach((gap) => {
      lines.push(`| ${gap.severity} | ${gap.kind} | \`${gap.name}\` | ${gap.line} |`);
    });
    lines.push('');
  }

  // Gaps by logic branch
  const branchGaps = gaps.filter((g) => g.type === 'logic-branch');
  if (branchGaps.length > 0) {
    lines.push(`## Untested Logic Branches (${branchGaps.length})`);
    lines.push('');
    lines.push('| Severity | Type | Line |');
    lines.push('|----------|------|------|');
    branchGaps.forEach((gap) => {
      lines.push(`| ${gap.severity} | ${gap.name} | ${gap.line} |`);
    });
    lines.push('');
  }

  // Suggestions
  lines.push('## Suggested Actions');
  lines.push('');
  if (highGaps.length > 0) {
    lines.push('### Critical (must fix):');
    lines.push('');
    highGaps.forEach((gap) => {
      lines.push(`- Write a test for \`${gap.name}\` (line ${gap.line}, ${gap.kind || gap.type})`);
    });
    lines.push('');
  }

  if (mediumGaps.length > 0) {
    lines.push('### Recommended:');
    lines.push('');
    mediumGaps.forEach((gap) => {
      lines.push(`- Consider adding a test for ${gap.name} (line ${gap.line})`);
    });
    lines.push('');
  }

  if (!testPath) {
    lines.push('### Missing test file:');
    lines.push('');
    lines.push('No corresponding test file found. Suggested path:');
    lines.push('');
    const baseDir = path.dirname(sourcePath);
    const baseName = path.basename(sourcePath, path.extname(sourcePath));
    const suggestedTestPath = path.join(baseDir, `${baseName}.test.ts`);
    lines.push(`  \`${suggestedTestPath}\``);
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 5. Main entry point
// ---------------------------------------------------------------------------

function runOnFile(filePath: string) {
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) {
    console.warn(`Skipping non-source file: ${filePath}`);
    return;
  }

  const source = fs.readFileSync(filePath, 'utf-8');
  const exports = parseExports(source);
  const branches = parseLogicBranches(source);
  const testPath = findTestFile(filePath);
  const testedNames = testPath ? parseTestFile(testPath, fs.readFileSync(testPath, 'utf-8')) : [];
  const gaps = analyzeGaps(exports, branches, testedNames);
  const report = generateMarkdownReport(filePath, testPath, exports, branches, gaps);

  console.log(report);
}

function runOnDirectory(dirPath: string) {
  const sourceFiles: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '.next') continue;
        walk(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) && !/\.spec\.(ts|tsx)$/.test(entry.name)) {
        sourceFiles.push(fullPath);
      }
    }
  }

  walk(dirPath);

  if (sourceFiles.length === 0) {
    console.log(`No source files found in ${dirPath}`);
    return;
  }

  const allLines: string[] = [];

  allLines.push('# Test Coverage Analysis Report');
  allLines.push('');
  allLines.push(`**Directory:** \`${dirPath}\``);
  allLines.push(`**Files analyzed:** ${sourceFiles.length}`);
  allLines.push('');

  let totalGaps = 0;

  for (const file of sourceFiles) {
    const source = fs.readFileSync(file, 'utf-8');
    const exports = parseExports(source);
    const branches = parseLogicBranches(source);
    const testPath = findTestFile(file);
    const testedNames = testPath ? parseTestFile(testPath, fs.readFileSync(testPath, 'utf-8')) : [];
    const gaps = analyzeGaps(exports, branches, testedNames);
    totalGaps += gaps.length;

    if (gaps.length > 0 || !testPath) {
      allLines.push(`## \`${path.relative(process.cwd(), file)}\``);
      allLines.push('');
      allLines.push(`**Test file:** ${testPath || '_Not found_'} (` + (testPath ? 'found' : 'missing') + `)`);
      allLines.push(`**Exports:** ${exports.length} | **Logic branches:** ${branches.length} | **Gaps:** ${gaps.length}`);
      allLines.push('');

      if (gaps.length > 0) {
        const highCount = gaps.filter((g) => g.severity === 'high').length;
        const mediumCount = gaps.filter((g) => g.severity === 'medium').length;

        if (highCount > 0) {
          allLines.push('### High severity');
          allLines.push('');
          gaps.filter((g) => g.severity === 'high').forEach((gap) => {
            allLines.push(`- \`${gap.name}\` (line ${gap.line}, ${gap.kind || gap.type})`);
          });
          allLines.push('');
        }

        if (mediumCount > 0) {
          allLines.push('### Medium severity');
          allLines.push('');
          gaps.filter((g) => g.severity === 'medium').forEach((gap) => {
            allLines.push(`- \`${gap.name}\` (line ${gap.line}, ${gap.kind || gap.type})`);
          });
          allLines.push('');
        }
      }
    }
  }

  allLines.push('## Summary');
  allLines.push('');
  allLines.push(`Total files analyzed: ${sourceFiles.length}`);
  allLines.push(`Total gaps found: ${totalGaps}`);
  allLines.push('');

  if (totalGaps === 0) {
    allLines.push('No test gaps detected across all files. Good work!');
  }

  console.log(allLines.join('\n'));
}

// ---------------------------------------------------------------------------
// CLI entry point (extracted for testability)
// ---------------------------------------------------------------------------

export function runCLI(argv: string[] = process.argv.slice(2)): void {
  const args = argv;

  if (args.length === 0) {
    console.error('Usage: node scripts/analyze-test-coverage.ts <file-or-directory>');
    process.exit(1);
  }

  const target = args[0];
  if (!target) {
    console.error('Usage: node scripts/analyze-test-coverage.ts <file-or-directory>');
    process.exit(1);
  }
  const resolvedPath = path.resolve(target);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Path not found: ${resolvedPath}`);
    process.exit(1);
  }

  const stat = fs.statSync(resolvedPath);

  if (stat.isFile()) {
    runOnFile(resolvedPath);
  } else if (stat.isDirectory()) {
    runOnDirectory(resolvedPath);
  } else {
    console.error(`Unsupported file type: ${resolvedPath}`);
    process.exit(1);
  }
}

// Execute when run directly (not imported by tests)
const __filename = new URL(import.meta.url).pathname;
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runCLI();
}
