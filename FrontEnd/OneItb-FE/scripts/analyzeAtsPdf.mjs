import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const MAX_PDF_BYTES = 25 * 1024 * 1024;
const COMMAND_TIMEOUT_MS = 15_000;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;

const usage = () => {
  console.error(
    'Uso: npm run analyze:ats -- <archivo.pdf> [--expect "texto"] [--min-pages 2] [--require-links]',
  );
};

const parseArguments = (values) => {
  const [pdfArgument, ...options] = values;
  const expectedTerms = [];
  let minimumPages = 1;
  let requireLinks = false;

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    if (option === '--expect') {
      const expected = options[index + 1]?.trim();
      if (!expected) throw new Error('Cada --expect requiere un texto no vacío.');
      expectedTerms.push(expected);
      index += 1;
    } else if (option === '--min-pages') {
      const parsed = Number.parseInt(options[index + 1], 10);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
        throw new Error('--min-pages debe estar entre 1 y 20.');
      }
      minimumPages = parsed;
      index += 1;
    } else if (option === '--require-links') {
      requireLinks = true;
    } else {
      throw new Error(`Opción desconocida: ${option}`);
    }
  }

  return { pdfArgument, expectedTerms, minimumPages, requireLinks };
};

const locateCommand = (command) => {
  const locator = process.platform === 'win32' ? 'where.exe' : 'which';
  const result = spawnSync(locator, [command], {
    encoding: 'utf8',
    timeout: 5_000,
    windowsHide: true,
  });
  return result.status === 0 ? result.stdout.split(/\r?\n/).find(Boolean)?.trim() : null;
};

const run = (command, args) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    timeout: COMMAND_TIMEOUT_MS,
    maxBuffer: MAX_OUTPUT_BYTES,
    windowsHide: true,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} terminó con código ${result.status}.`);
  }

  return result.stdout ?? '';
};

const normalized = (value) => value.normalize('NFC').toLocaleLowerCase('es-AR');

let workDirectory;

try {
  const { pdfArgument, expectedTerms, minimumPages, requireLinks } = parseArguments(
    process.argv.slice(2),
  );
  if (!pdfArgument) {
    usage();
    process.exitCode = 1;
  } else {
    const pdfPath = resolve(pdfArgument);
    if (!existsSync(pdfPath) || extname(pdfPath).toLowerCase() !== '.pdf') {
      throw new Error('El archivo indicado no existe o no tiene extensión .pdf.');
    }

    const fileStats = statSync(pdfPath);
    if (fileStats.size === 0 || fileStats.size > MAX_PDF_BYTES) {
      throw new Error('El PDF debe ocupar entre 1 byte y 25 MB.');
    }

    const signature = readFileSync(pdfPath, { encoding: null }).subarray(0, 5).toString('ascii');
    if (signature !== '%PDF-') throw new Error('La firma del archivo no corresponde a un PDF.');

    const tools = ['pdftotext', 'pdfinfo', 'pdffonts'];
    const resolvedTools = Object.fromEntries(tools.map((tool) => [tool, locateCommand(tool)]));
    const missingTools = tools.filter((tool) => !resolvedTools[tool]);
    if (missingTools.length > 0) {
      console.log(JSON.stringify({
        status: 'BLOCKED',
        reason: 'POPLER_NOT_AVAILABLE',
        missingTools,
      }, null, 2));
      process.exitCode = 2;
    } else {
      workDirectory = resolve(tmpdir(), `oneitb-ats-${randomUUID()}`);
      mkdirSync(workDirectory, { recursive: true });
      const extractedTextPath = resolve(workDirectory, 'extracted.txt');

      run(resolvedTools.pdftotext, ['-layout', '-enc', 'UTF-8', pdfPath, extractedTextPath]);
      const extractedText = readFileSync(extractedTextPath, 'utf8').normalize('NFC');
      const comparableText = normalized(extractedText);
      const info = run(resolvedTools.pdfinfo, [pdfPath]);
      const fonts = run(resolvedTools.pdffonts, [pdfPath]);

      const pageMatch = info.match(/^Pages:\s+(\d+)/mi);
      const pageCount = pageMatch ? Number.parseInt(pageMatch[1], 10) : 0;
      const termsPresent = expectedTerms.every((term) => comparableText.includes(normalized(term)));
      const termIndexes = expectedTerms.map((term) => comparableText.indexOf(normalized(term)));
      const termsOrdered = termIndexes.every((index, position) =>
        index >= 0 && (position === 0 || index > termIndexes[position - 1]),
      );
      const hasReplacementCharacter = extractedText.includes('\uFFFD');
      const isA4 = /^Page size:.*\bA4\b/mi.test(info)
        || /^Page size:\s+59[45]\.?\d*\s+x\s+84[12]\.?\d*/mi.test(info);
      const isNotEncrypted = /^Encrypted:\s+no\b/mi.test(info);
      const fontLines = fonts.split(/\r?\n/).filter((line) => line.trim());
      const hasUsableFonts = fontLines.length >= 3 && !/no fonts/i.test(fonts);

      let linksStatus = 'NOT_REQUIRED';
      if (requireLinks) {
        try {
          const links = run(resolvedTools.pdfinfo, ['-url', pdfPath]);
          linksStatus = /(?:https?:\/\/|mailto:|tel:)/i.test(links) ? 'PASS' : 'FAIL';
        } catch {
          linksStatus = 'BLOCKED';
        }
      }

      const checks = {
        extractableText: extractedText.trim().length > 0,
        expectedTermsPresent: termsPresent,
        expectedTermsOrdered: termsOrdered,
        unicodeWithoutReplacement: !hasReplacementCharacter,
        minimumPages: pageCount >= minimumPages,
        a4PageSize: isA4,
        notEncrypted: isNotEncrypted,
        usableFonts: hasUsableFonts,
        links: linksStatus,
      };
      const failedChecks = Object.entries(checks)
        .filter(([, result]) => result === false || result === 'FAIL')
        .map(([name]) => name);
      const blockedChecks = Object.entries(checks)
        .filter(([, result]) => result === 'BLOCKED')
        .map(([name]) => name);

      console.log(JSON.stringify({
        status: failedChecks.length > 0 ? 'FAIL' : blockedChecks.length > 0 ? 'BLOCKED' : 'PASS',
        fileSizeBytes: fileStats.size,
        pageCount,
        expectedTermCount: expectedTerms.length,
        checks,
        failedChecks,
        blockedChecks,
      }, null, 2));

      process.exitCode = failedChecks.length > 0 ? 1 : blockedChecks.length > 0 ? 2 : 0;
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falló el análisis ATS del PDF.');
  process.exitCode = 1;
} finally {
  if (workDirectory) rmSync(workDirectory, { recursive: true, force: true });
}
