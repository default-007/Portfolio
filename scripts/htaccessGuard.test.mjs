import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { findUnguardedHeaderLines } from './htaccessGuard.mjs';

const guarded = (body) => `<IfModule mod_headers.c>\n${body}\n</IfModule>\n`;

describe('findUnguardedHeaderLines', () => {
  it('passes the .htaccess the repo actually ships', () => {
    expect(findUnguardedHeaderLines(readFileSync('public/.htaccess', 'utf8'))).toEqual([]);
  });

  it('reports a top-level Header directive', () => {
    expect(findUnguardedHeaderLines('Header set X-Foo "1"\n')).toEqual([1]);
  });

  it('accepts a Header inside <IfModule mod_headers.c>', () => {
    expect(findUnguardedHeaderLines(guarded('  Header set X-Foo "1"'))).toEqual([]);
  });

  it('accepts a Header nested deeper inside the guard', () => {
    expect(
      findUnguardedHeaderLines(
        guarded('  <FilesMatch "\\.(html)$">\n\tHeader set Cache-Control "no-cache"\n  </FilesMatch>'),
      ),
    ).toEqual([]);
  });

  it('reports a Header once the guard has closed', () => {
    expect(
      findUnguardedHeaderLines(guarded('  Header set X-Foo "1"') + 'Header set X-Bar "2"\n'),
    ).toEqual([4]);
  });

  it('reports a Header guarded by some other module', () => {
    expect(
      findUnguardedHeaderLines('<IfModule mod_deflate.c>\n  Header set X-Foo "1"\n</IfModule>\n'),
    ).toEqual([2]);
  });

  // Apache directive and section names are case-insensitive, so a
  // case-sensitive check waves through a file that 500s a host lacking
  // mod_headers — and rejects a file that is in fact correctly guarded.
  describe('Apache case-insensitivity', () => {
    it('reports a lowercase top-level `header` directive', () => {
      expect(findUnguardedHeaderLines('header set X-Foo "1"\n')).toEqual([1]);
    });

    it('reports a mixed-case top-level `HEADER` directive', () => {
      expect(findUnguardedHeaderLines('HEADER set X-Foo "1"\n')).toEqual([1]);
    });

    it('accepts a lowercase `<ifmodule mod_headers.c>` guard', () => {
      expect(
        findUnguardedHeaderLines('<ifmodule mod_headers.c>\n  Header set X-Foo "1"\n</ifmodule>\n'),
      ).toEqual([]);
    });

    it('accepts the `<IfModule headers_module>` spelling as a guard', () => {
      expect(
        findUnguardedHeaderLines(
          '<IfModule headers_module>\n  Header set X-Foo "1"\n</IfModule>\n',
        ),
      ).toEqual([]);
    });

    it('still reports a Header inside a negated <IfModule !mod_headers.c>', () => {
      expect(
        findUnguardedHeaderLines('<IfModule !mod_headers.c>\n  Header set X-Foo "1"\n</IfModule>\n'),
      ).toEqual([2]);
    });
  });
});
