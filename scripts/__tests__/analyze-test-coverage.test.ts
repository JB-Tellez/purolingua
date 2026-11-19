import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Mock fs module and reload the script
// ---------------------------------------------------------------------------

function mockFs(counters?: Record<string, number>) {
  const getCount = (p: string) => {
    if (counters) return counters[p] !== undefined ? counters[p]++ > 0 : false;
    return false;
  };

  return {
    existsSync: vi.fn((p: string) => getCount(p)),
    readFileSync: vi.fn((p: string) => ''),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// 1. parseExports
// ---------------------------------------------------------------------------

describe('parseExports', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should extract a named exported function', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export function greet(name: string): string {\n  return name;\n}';
    const result = parseExports(source);
    expect(result).toContainEqual({ kind: 'function', name: 'greet', line: 1 });
  });

  it('should extract an async exported function', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export async function fetchUser(id: number): Promise<User> {\n  return {} as any;\n}';
    const result = parseExports(source);
    expect(result).toContainEqual({ kind: 'function', name: 'fetchUser', line: 1 });
  });

  it('ignores non-exported declarations (private helpers are tested through their exports)', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = [
      'function helper(): void {}',
      'const LIMIT = 3;',
      'interface Props { a: string }',
      'type Mode = "a" | "b";',
      'class Internal {',
      '  run() {}',
      '}',
    ].join('\n');
    expect(parseExports(source)).toEqual([]);
  });

  it('extracts a default-exported function (React components)', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export default function SiteHeader({ lang }: Props) {\n  return null;\n}';
    expect(parseExports(source)).toContainEqual({ kind: 'function', name: 'SiteHeader', line: 1 });
  });

  it('does not report object-literal methods inside an exported function as class methods', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export function make() {\n  return {\n    start() {},\n  };\n}';
    expect(parseExports(source).map((e: any) => e.name)).toEqual(['make']);
  });

  it('should extract an exported const', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export const MAX_RETRIES = 3;';
    const result = parseExports(source);
    expect(result).toContainEqual({ kind: 'const', name: 'MAX_RETRIES', line: 1 });
  });

  it('should extract a class', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export class SpeakerService implements ISpeaker {\n  speak() {}\n}';
    const result = parseExports(source);
    expect(result).toContainEqual({ kind: 'class', name: 'SpeakerService', line: 1 });
  });

  it('should extract class methods (excluding hooks)', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export class Timer {\n  start() {}\n  stop() {}\n  useEffect() {}\n  render() {}\n  resume() {}\n}';
    const result = parseExports(source);
    const names = result.filter((e: any) => e.kind === 'method').map((e: any) => e.name);
    expect(names).toContain('start');
    expect(names).toContain('stop');
    expect(names).toContain('resume');
    expect(names).not.toContain('useEffect');
    expect(names).not.toContain('render');
  });

  it('should not detect control-flow keywords as methods', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = `export class Example {
  run() {
    if (condition) { return; }
    for (let i = 0; i < n; i++) {}
    while (alive) {}
    switch (state) {}
    catch (e) {}
    else { return; }
  }
}`;
    const result = parseExports(source);
    const methodNames = result.filter((e: any) => e.kind === 'method').map((e: any) => e.name);
    expect(methodNames).not.toContain('if');
    expect(methodNames).not.toContain('for');
    expect(methodNames).not.toContain('while');
    expect(methodNames).not.toContain('switch');
    expect(methodNames).not.toContain('catch');
    expect(methodNames).not.toContain('else');
    expect(methodNames).toContain('run');
  });

  it('should extract an interface', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export interface SpeakerConfig {\n  rate: number;\n}';
    const result = parseExports(source);
    expect(result).toContainEqual({ kind: 'interface', name: 'SpeakerConfig', line: 1 });
  });

  it('should extract a type alias', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = 'export type VoiceState = \'idle\' | \'speaking\' | \'paused\';';
    const result = parseExports(source);
    expect(result).toContainEqual({ kind: 'type', name: 'VoiceState', line: 1 });
  });

  it('should skip comments', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    const source = '// export function hidden() {}\n/* export const BLOCKED = 1; */\nexport function real(): void {}';
    const result = parseExports(source);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('real');
  });

  it('should return an empty array for an empty source', async () => {
    const { parseExports } = await import('../analyze-test-coverage');
    expect(parseExports('')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. parseLogicBranches
// ---------------------------------------------------------------------------

describe('parseLogicBranches', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should detect if statements', async () => {
    const { parseLogicBranches } = await import('../analyze-test-coverage');
    const source = 'if (isSupported) { return null; }';
    const result = parseLogicBranches(source);
    expect(result).toContainEqual({ type: 'if', line: 1, text: expect.any(String) });
  });

  it('should detect else blocks', async () => {
    const { parseLogicBranches } = await import('../analyze-test-coverage');
    const source = '} else {\n  return fallback;\n}';
    const result = parseLogicBranches(source);
    expect(result).toContainEqual({ type: 'else', line: 1, text: expect.any(String) });
  });

  it('should detect for and while loops', async () => {
    const { parseLogicBranches } = await import('../analyze-test-coverage');
    const source = 'for (let i = 0; i < n; i++) {}\nwhile (alive) {}';
    const result = parseLogicBranches(source);
    const types = result.map((r: any) => r.type);
    expect(types).toContain('for');
    expect(types).toContain('while');
  });

  it('should detect switch and catch blocks', async () => {
    const { parseLogicBranches } = await import('../analyze-test-coverage');
    const source = 'switch (state) {}\ncatch (e) {}';
    const result = parseLogicBranches(source);
    const types = result.map((r: any) => r.type);
    expect(types).toContain('switch');
    expect(types).toContain('catch');
  });

  it('should detect ternary expressions', async () => {
    const { parseLogicBranches } = await import('../analyze-test-coverage');
    const source = 'const label = ready ? \'ok\' : \'wait\';';
    const result = parseLogicBranches(source);
    expect(result).toContainEqual(expect.objectContaining({ type: 'ternary' }));
  });

  it('should detect optional chaining', async () => {
    const { parseLogicBranches } = await import('../analyze-test-coverage');
    const source = 'const name = obj?.name ?? \'anon\';';
    const result = parseLogicBranches(source);
    expect(result).toContainEqual(expect.objectContaining({ type: 'optional' }));
  });

  it('should return an empty array for source with no branches', async () => {
    const { parseLogicBranches } = await import('../analyze-test-coverage');
    const result = parseLogicBranches('export const X = 1;');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. findTestFile
// ---------------------------------------------------------------------------

describe('findTestFile', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should return the test file path when it exists', async () => {
    const fsMock = mockFs();
    fsMock.existsSync.mockImplementation((p: string) => p.endsWith('.test.ts'));
    vi.doMock('fs', () => fsMock);
    const { findTestFile } = await import('../analyze-test-coverage');
    const result = findTestFile('/src/hooks/something.ts');
    expect(result).toContain('.test.ts');
  });

  it('should return null when no test file is found', async () => {
    const fsMock = mockFs();
    fsMock.existsSync.mockReturnValue(false);
    vi.doMock('fs', () => fsMock);
    const { findTestFile } = await import('../analyze-test-coverage');
    expect(findTestFile('/src/unknown.ts')).toBeNull();
  });

  it('should try .spec.ts as an alternative', async () => {
    const fsMock = mockFs();
    fsMock.existsSync.mockImplementation((p: string) => p.endsWith('.spec.ts'));
    vi.doMock('fs', () => fsMock);
    const { findTestFile } = await import('../analyze-test-coverage');
    const result = findTestFile('/src/hooks/foo.ts');
    expect(result).toContain('.spec.ts');
  });

  describe('src/__tests__ mirror tree', () => {
    const cwd = process.cwd();
    const src = (...segs: string[]) => path.join(cwd, 'src', ...segs);
    const mirror = (...segs: string[]) => path.join(cwd, 'src', '__tests__', ...segs);

    async function findWith(existing: string[], sourcePath: string) {
      const fsMock = mockFs();
      const present = new Set(existing);
      fsMock.existsSync.mockImplementation((p: string) => present.has(p));
      vi.doMock('fs', () => fsMock);
      const { findTestFile } = await import('../analyze-test-coverage');
      return findTestFile(sourcePath);
    }

    it('finds a .test.ts mirror for a .ts source (src/lib/srs.ts)', async () => {
      const expected = mirror('lib', 'srs.test.ts');
      expect(await findWith([expected], src('lib', 'srs.ts'))).toBe(expected);
    });

    it('still finds a .test.tsx mirror for a .ts source (hook tests)', async () => {
      const expected = mirror('hooks', 'useLevelFilter.test.tsx');
      expect(await findWith([expected], src('hooks', 'useLevelFilter.ts'))).toBe(expected);
    });

    it('finds a .test.ts mirror for a .tsx source', async () => {
      const expected = mirror('components', 'Widget.test.ts');
      expect(await findWith([expected], src('components', 'Widget.tsx'))).toBe(expected);
    });

    it('finds .spec.ts and .spec.tsx mirrors', async () => {
      const specTs = mirror('lib', 'srs.spec.ts');
      expect(await findWith([specTs], src('lib', 'srs.ts'))).toBe(specTs);

      vi.resetModules();
      const specTsx = mirror('components', 'Widget.spec.tsx');
      expect(await findWith([specTsx], src('components', 'Widget.tsx'))).toBe(specTsx);
    });

    it('resolves a cwd-relative source path, as the CLI passes it', async () => {
      const expected = mirror('lib', 'generateChoices.test.ts');
      expect(await findWith([expected], path.join('src', 'lib', 'generateChoices.ts'))).toBe(expected);
    });

    it('prefers a sibling test file over the mirror', async () => {
      const sibling = src('lib', 'srs.test.ts');
      expect(await findWith([sibling, mirror('lib', 'srs.test.ts')], src('lib', 'srs.ts'))).toBe(sibling);
    });

    it('finds src/app session tests kept in src/__tests__/components', async () => {
      const expected = mirror('components', 'StudySession.test.tsx');
      const source = src('app', '[lang]', 'rephrase', '[deck]', 'StudySession.tsx');
      expect(await findWith([expected], source)).toBe(expected);
    });

    it('finds src/app tests kept in src/__tests__/app', async () => {
      const expected = mirror('app', 'homePage.test.tsx');
      expect(await findWith([expected], src('app', 'homePage.tsx'))).toBe(expected);
    });

    it('does not look in src/__tests__/components for sources outside src/app', async () => {
      const unrelated = mirror('components', 'srs.test.ts');
      expect(await findWith([unrelated], src('lib', 'srs.ts'))).toBeNull();
    });

    it('does not mirror sources outside src/', async () => {
      const outside = path.join(cwd, 'scripts', 'tool.ts');
      const bogus = path.join(cwd, 'src', '__tests__', '..', 'scripts', 'tool.test.ts');
      expect(await findWith([bogus], outside)).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// 4. parseTestFile
// ---------------------------------------------------------------------------

describe('parseTestFile', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should extract imported names from import statements', async () => {
    const { parseTestFile } = await import('../analyze-test-coverage');
    const source = 'import { useVoiceRecognition, SpeakerService } from \'../hooks\';';
    const result = parseTestFile('/tmp/fake.test.ts', source);
    expect(result).toContain('useVoiceRecognition');
    expect(result).toContain('SpeakerService');
  });

  it('should exclude test utilities from tested names', async () => {
    const { parseTestFile } = await import('../analyze-test-coverage');
    const source = 'import { expect, vi, act, describe } from \'vitest\';';
    const result = parseTestFile('/tmp/fake.test.ts', source);
    expect(result).not.toContain('expect');
    expect(result).not.toContain('vi');
    expect(result).not.toContain('act');
    expect(result).not.toContain('describe');
  });

  it('should detect camelCase identifiers in test describe strings', async () => {
    const { parseTestFile } = await import('../analyze-test-coverage');
    const source = 'describe(\'voice recognition feature\', () => {\n  it(\'should initialize correctly\', () => {});\n});';
    const result = parseTestFile('/tmp/fake.test.ts', source);
    expect(result).toContain('voice');
    expect(result).toContain('recognition');
  });
});

// ---------------------------------------------------------------------------
// 5. analyzeGaps
// ---------------------------------------------------------------------------

describe('analyzeGaps', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should flag high-severity untested functions', async () => {
    const { analyzeGaps } = await import('../analyze-test-coverage');
    const exports = [{ kind: 'function', name: 'greet', line: 1 }];
    const gaps = analyzeGaps(exports, [], []);
    expect(gaps).toContainEqual(
      expect.objectContaining({ type: 'export', kind: 'function', name: 'greet', severity: 'high' })
    );
  });

  it('should flag high-severity untested classes', async () => {
    const { analyzeGaps } = await import('../analyze-test-coverage');
    const exports = [{ kind: 'class', name: 'Engine', line: 10 }];
    const gaps = analyzeGaps(exports, [], []);
    expect(gaps).toContainEqual(
      expect.objectContaining({ severity: 'high' })
    );
  });

  it('should flag high-severity untested hooks (useXxx consts)', async () => {
    const { analyzeGaps } = await import('../analyze-test-coverage');
    const exports = [{ kind: 'const', name: 'useAuth', line: 5 }];
    const gaps = analyzeGaps(exports, [], []);
    expect(gaps).toContainEqual(
      expect.objectContaining({ severity: 'high' })
    );
  });

  it('should flag interfaces and types as low severity (tsc already checks them)', async () => {
    const { analyzeGaps } = await import('../analyze-test-coverage');
    const exports = [
      { kind: 'interface', name: 'Config', line: 1 },
      { kind: 'type', name: 'Status', line: 3 },
    ];
    const gaps = analyzeGaps(exports, [], []);
    expect(gaps.map((g: any) => g.severity)).toEqual(['low', 'low']);
  });

  it('should flag catch and switch logic branches', async () => {
    const { analyzeGaps } = await import('../analyze-test-coverage');
    const branches = [
      { type: 'catch', line: 20, text: '' },
      { type: 'switch', line: 35, text: '' },
      { type: 'if', line: 10, text: '' },
    ];
    const gaps = analyzeGaps([], branches, []);
    expect(gaps).toContainEqual(expect.objectContaining({ type: 'logic-branch', severity: 'medium' }));
    // if should NOT be flagged
    const ifGap = gaps.find((g: any) => g.type === 'logic-branch' && (g.name as string).includes('if'));
    expect(ifGap).toBeUndefined();
  });

  it('should not flag exports when a tested name matches', async () => {
    const { analyzeGaps } = await import('../analyze-test-coverage');
    const exports = [{ kind: 'function', name: 'greet', line: 1 }];
    const testedNames = ['greet'];
    const gaps = analyzeGaps(exports, [], testedNames);
    expect(gaps).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 6. generateMarkdownReport
// ---------------------------------------------------------------------------

describe('generateMarkdownReport', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should include source and test file info', async () => {
    const { generateMarkdownReport } = await import('../analyze-test-coverage');
    const report = generateMarkdownReport(
      'src/foo.ts',
      'src/foo.test.ts',
      [],
      [],
      []
    );
    expect(report).toContain('src/foo.ts');
    expect(report).toContain('src/foo.test.ts');
  });

  it('should indicate "Not found" when test path is null', async () => {
    const { generateMarkdownReport } = await import('../analyze-test-coverage');
    const report = generateMarkdownReport(
      'src/bar.ts',
      null,
      [],
      [],
      []
    );
    expect(report).toContain('Not found');
  });

  it('should show a positive message when there are no gaps', async () => {
    const { generateMarkdownReport } = await import('../analyze-test-coverage');
    const report = generateMarkdownReport(
      'src/baz.ts',
      'src/baz.test.ts',
      [],
      [],
      []
    );
    expect(report).toContain('No test gaps detected');
  });

  it('should include a Summary table', async () => {
    const { generateMarkdownReport } = await import('../analyze-test-coverage');
    const report = generateMarkdownReport(
      'src/sum.ts',
      'src/sum.test.ts',
      [{ kind: 'function', name: 'x', line: 1 }],
      [],
      [{ type: 'export', kind: 'function', name: 'x', line: 1, severity: 'high' }]
    );
    expect(report).toContain('| High severity | 1 |');
    expect(report).toContain('| **Total gaps** | **1** |');
  });
});

// ---------------------------------------------------------------------------
// 7. CLI behavior
// ---------------------------------------------------------------------------

describe('suggested test path (no test file found)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  const gap = { type: 'export', kind: 'function', name: 'Foo', line: 1, severity: 'high' };
  const report = async (source: string) => {
    const { generateMarkdownReport } = await import('../analyze-test-coverage');
    return generateMarkdownReport(path.join(process.cwd(), source), null, [], [], [gap]);
  };

  it('suggests the src/__tests__ mirror for a source under src/, keeping .tsx', async () => {
    expect(await report('src/components/Foo.tsx')).toContain(path.join('src', '__tests__', 'components', 'Foo.test.tsx'));
  });

  it('suggests .test.ts for a .ts source', async () => {
    expect(await report('src/lib/foo.ts')).toContain(path.join('src', '__tests__', 'lib', 'foo.test.ts'));
  });

  it('suggests a sibling test file outside src/', async () => {
    expect(await report('scripts/foo.ts')).toContain(path.join('scripts', 'foo.test.ts'));
  });
});

describe('isEntryPoint', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('matches the script path even when it contains a space (URL-escaped in import.meta.url)', async () => {
    const { isEntryPoint } = await import('../analyze-test-coverage');
    expect(isEntryPoint('/tmp/my dir/script.ts', 'file:///tmp/my%20dir/script.ts')).toBe(true);
  });

  it('does not match another script or a missing argv[1]', async () => {
    const { isEntryPoint } = await import('../analyze-test-coverage');
    expect(isEntryPoint('/tmp/other.ts', 'file:///tmp/script.ts')).toBe(false);
    expect(isEntryPoint(undefined, 'file:///tmp/script.ts')).toBe(false);
  });
});

describe('CLI entry point', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should print usage and exit when called with no arguments', async () => {
    const { runCLI } = await import('../analyze-test-coverage');
    const exitErr = new Error('CLI_EXIT') as any;
    exitErr.code = 1;
    vi.spyOn(process, 'exit').mockImplementation(() => { throw exitErr; });

    expect(() => runCLI([])).toThrow('CLI_EXIT');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should error when the target path does not exist', async () => {
    const { runCLI } = await import('../analyze-test-coverage');
    const exitErr = new Error('CLI_EXIT') as any;
    exitErr.code = 1;
    vi.spyOn(process, 'exit').mockImplementation(() => { throw exitErr; });
    const errorSpy = vi.spyOn(console, 'error');

    expect(() => runCLI(['/nonexistent/path.ts'])).toThrow('CLI_EXIT');
    expect(errorSpy).toHaveBeenCalledWith('Path not found: /nonexistent/path.ts');
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
