// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const frontendRoot = process.cwd();
const sourceRoot = path.join(frontendRoot, 'src');
const fontAwesomeRoot = path.join(frontendRoot, 'node_modules/@fortawesome/fontawesome-free');
const metadataPath = path.join(fontAwesomeRoot, 'metadata/icon-families.json');
const fontAwesomePackagePath = path.join(fontAwesomeRoot, 'package.json');
const requiredWebfonts = [
  'fa-brands-400.woff2',
  'fa-regular-400.woff2',
  'fa-solid-900.woff2',
  'fa-v4compatibility.woff2',
];
const iconStyleTokens = new Set([
  'solid', 'regular', 'brands', 'xs', 'sm', 'lg', 'xl', '2xl', 'fw', 'spin',
  'pulse', 'beat', 'fade', 'bounce', 'shake', 'flip', 'border', 'inverse',
]);

const collectSourceFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (fullPath.includes(`${path.sep}assets${path.sep}fonts`)) return [];
      return collectSourceFiles(fullPath);
    }
    if (entry.name.includes('.test.')) return [];
    return /\.(?:js|jsx|ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });

describe('local visual assets', () => {
  it('does not depend on third-party core font or icon hosts', () => {
    const indexHtml = fs.readFileSync(path.join(frontendRoot, 'index.html'), 'utf8');
    const indexCss = fs.readFileSync(path.join(sourceRoot, 'index.css'), 'utf8');
    const mainSource = fs.readFileSync(path.join(sourceRoot, 'main.jsx'), 'utf8');
    const combined = `${indexHtml}\n${indexCss}`;

    expect(combined).not.toMatch(/fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare/i);
    expect(mainSource).toContain('@fortawesome/fontawesome-free/css/all.min.css');
    expect(mainSource).not.toContain('assets/fonts/fontawesome');
  });

  it('pins one official Font Awesome distribution with CSS, metadata and WOFF2 assets', () => {
    const packageManifest = JSON.parse(fs.readFileSync(fontAwesomePackagePath, 'utf8'));
    const appManifest = JSON.parse(fs.readFileSync(path.join(frontendRoot, 'package.json'), 'utf8'));
    const lockfile = JSON.parse(fs.readFileSync(path.join(frontendRoot, 'package-lock.json'), 'utf8'));
    const lockedPackage = lockfile.packages['node_modules/@fortawesome/fontawesome-free'];

    expect(appManifest.dependencies['@fortawesome/fontawesome-free']).toBe('6.7.2');
    expect(packageManifest.version).toBe('6.7.2');
    expect(packageManifest.license).toContain('OFL-1.1');
    expect(lockedPackage.version).toBe('6.7.2');
    expect(lockedPackage.integrity).toMatch(/^sha512-/);
    expect(fs.existsSync(path.join(fontAwesomeRoot, 'css/all.min.css'))).toBe(true);
    expect(fs.existsSync(metadataPath)).toBe(true);

    requiredWebfonts.forEach((fileName) => {
      expect(fs.statSync(path.join(fontAwesomeRoot, 'webfonts', fileName)).size).toBeGreaterThan(0);
    });

    expect(fs.existsSync(path.join(sourceRoot, 'assets/fonts/fontawesome-free-6.1.2-web'))).toBe(false);
  });

  it('uses only icons supported by the bundled Font Awesome metadata', () => {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const supported = new Set(Object.keys(metadata));
    const activeIcons = new Set();

    collectSourceFiles(sourceRoot).forEach((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      for (const match of source.matchAll(/\bfa-([a-z][a-z0-9-]*)\b/g)) {
        if (!iconStyleTokens.has(match[1])) activeIcons.add(match[1]);
      }
    });

    const unsupported = [...activeIcons].filter((icon) => !supported.has(icon)).sort();
    expect(unsupported).toEqual([]);
    expect(activeIcons.size).toBeGreaterThan(50);
  });

  it('declares Spanish metadata and repository-owned OneITB identity', () => {
    const indexHtml = fs.readFileSync(path.join(frontendRoot, 'index.html'), 'utf8');

    expect(indexHtml).toContain('<html lang="es">');
    expect(indexHtml).toContain('<title>OneITB | Red académica institucional</title>');
    expect(indexHtml).toContain('href="/src/assets/only-logo.png"');
    expect(indexHtml).not.toContain('/vite.svg');
  });

  it('does not require a remote generated avatar for UI fallbacks', () => {
    const source = collectSourceFiles(sourceRoot)
      .map((filePath) => fs.readFileSync(filePath, 'utf8'))
      .join('\n');

    expect(source).not.toContain('ui-avatars.com');

    const navSource = fs.readFileSync(
      path.join(sourceRoot, 'Components/layout/private/Nav.jsx'),
      'utf8',
    );
    expect(navSource).toContain('getInitials');
  });

  it('preserves accessible motion and print fallbacks', () => {
    const indexCss = fs.readFileSync(path.join(sourceRoot, 'index.css'), 'utf8');
    const profileSource = fs.readFileSync(
      path.join(sourceRoot, 'Components/profile/UserProfile.tsx'),
      'utf8',
    );
    const editorSource = fs.readFileSync(
      path.join(sourceRoot, 'Components/profile/CvEditorProfile.tsx'),
      'utf8',
    );

    expect(indexCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(indexCss).toMatch(/transition-duration:\s*0ms\s*!important/);
    expect(indexCss).toMatch(/@media\s+print/);
    expect(indexCss).toMatch(/size:\s*A4/);
    expect(indexCss).toContain('font-family: Arial, "Segoe UI", sans-serif !important');
    expect(profileSource).toContain('<CVATSPrintTemplate');
    expect(editorSource).toContain('<CVATSPrintTemplate');
    expect(profileSource).toContain('useCvAtsPrint');
    expect(editorSource).toContain('useCvAtsPrint');
    expect(profileSource).not.toContain('window.print()');
    expect(editorSource).not.toContain('window.print()');
    expect(indexCss).not.toMatch(/\.cv-ats-document[^}]*height:\s*297mm/s);
    expect(indexCss).not.toMatch(/\.cv-ats-document[^}]*overflow:\s*hidden/s);
  });
});
