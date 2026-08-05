// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const profileDirectory = path.join(process.cwd(), 'src', 'Components', 'profile');

describe('profile ATS print route parity', () => {
  it('uses the same canonical document and scoped print hook in both profile routes', () => {
    const profileSource = fs.readFileSync(path.join(profileDirectory, 'UserProfile.tsx'), 'utf8');
    const editorSource = fs.readFileSync(path.join(profileDirectory, 'CvEditorProfile.tsx'), 'utf8');

    for (const source of [profileSource, editorSource]) {
      expect(source).toContain('CVATSPrintTemplate');
      expect(source).toContain('useCvAtsPrint');
      expect(source).not.toContain('window.print()');
      expect(source).not.toContain('CVPrintTemplate');
      expect(source).not.toContain('ResumePreview');
    }
  });
});
