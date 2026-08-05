// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const scriptPath = join(process.cwd(), 'scripts', 'analyzeAtsPdf.mjs');
const temporaryDirectories = [];

const runAnalyzer = (args, env = process.env) => spawnSync(process.execPath, [scriptPath, ...args], {
  encoding: 'utf8',
  env,
  timeout: 10_000,
  windowsHide: true,
});

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { recursive: true, force: true });
  });
});

describe('analyzeAtsPdf', () => {
  it('fails fast when no PDF is provided', () => {
    const result = runAnalyzer([]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Uso:/);
  });

  it('rejects missing or non-PDF input before invoking external tools', () => {
    const result = runAnalyzer(['missing.txt']);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/no existe o no tiene extensión \.pdf/i);
  });

  it('reports a blocked prerequisite without exposing PDF contents', () => {
    const directory = mkdtempSync(join(tmpdir(), 'oneitb-ats-test-'));
    temporaryDirectories.push(directory);
    const pdfPath = join(directory, 'fixture.pdf');
    writeFileSync(pdfPath, '%PDF-1.4\nfixture-content-that-must-not-be-logged\n%%EOF');

    const result = runAnalyzer([pdfPath], { ...process.env, PATH: '' });

    expect(result.status).toBe(2);
    expect(result.stdout).toMatch(/POPLER_NOT_AVAILABLE/);
    expect(result.stdout).not.toContain('fixture-content-that-must-not-be-logged');
  });
});
