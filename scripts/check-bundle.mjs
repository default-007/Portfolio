#!/usr/bin/env node
// Guards a defect class that no unit test can see, because it lives in build
// output rather than in behaviour.
//
// three.js is ~240 kB gzipped and is mounted only on wide screens that have
// WebGL and no reduced-motion preference. It must therefore be reachable ONLY
// through EmberField's dynamic import. It briefly was not: vite.config.ts's
// object-form manualChunks absorbed React's JSX runtime into the three chunk,
// the entry chunk then statically imported it, and index.html modulepreloaded
// the whole thing for every visitor — including the phones that never mount
// the effect. The suite stayed green throughout.
//
// A dependency bump, a stray import, or a Rollup change can reintroduce this
// silently, so the build asserts it instead of trusting it.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const assets = join(dist, 'assets');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const failures = [];

const preloaded = [...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)].map(
  (m) => m[1],
);
for (const href of preloaded) {
  if (/\/three-[^/]*\.js$/.test(href)) {
    failures.push(`index.html modulepreloads the three chunk (${href}). It must load only via EmberField's dynamic import.`);
  }
}

// The preload link is downstream of the real problem: a static import edge
// from the entry. Check the edge directly too, so a Vite change that stops
// emitting preload links cannot hide the regression.
const entry = readdirSync(assets).find((f) => /^index-.*\.js$/.test(f));
if (!entry) {
  failures.push('No entry chunk found in dist/assets — has the build layout changed?');
} else {
  const source = readFileSync(join(assets, entry), 'utf8');
  const staticImports = [...source.matchAll(/(?:^|[;}])\s*import\s*(?:[^"']*from\s*)?["']([^"']+)["']/g)].map(
    (m) => m[1],
  );
  const offending = staticImports.filter((spec) => /three-[^/]*\.js$/.test(spec));
  if (offending.length > 0) {
    failures.push(`Entry chunk ${entry} statically imports the three chunk (${offending.join(', ')}).`);
  }
}

// resume.html is a hand-written static file that Vite copies through
// untouched, so it is invisible to the unit suite: the two tests that mention
// it (data.test.ts, Console.test.tsx) only assert the string './resume.html'
// is the link target, and pass just as happily if the file is missing, empty,
// or still full of unresolved Claude Design template syntax. It is also the
// owner's hiring document. Assert its shape here, where build output is
// already being checked.
const resumePath = join(dist, 'resume.html');
let resume = '';
try {
  resume = readFileSync(resumePath, 'utf8');
} catch {
  failures.push('dist/resume.html is missing — the console\'s `resume` command and the Clearance DOCUMENT row both link to it.');
}

if (resume) {
  // Unresolved canvas-document syntax would render as literal junk on the page.
  for (const residue of ['<sc-if', '<sc-for', '{{', '<x-dc', '<doc-page']) {
    if (resume.includes(residue)) {
      failures.push(`dist/resume.html still contains unresolved template syntax: ${residue}`);
    }
  }

  // Both break paged output, which is the entire point of this page.
  if (/position\s*:\s*fixed/.test(resume)) {
    failures.push('dist/resume.html uses position:fixed, which breaks printing.');
  }
  if (/\d(vh|vw)\b/.test(resume)) {
    failures.push('dist/resume.html uses vh/vw units, which break printing.');
  }

  // A dropped sc-if block or a truncated port would silently lose an employer.
  const employers = [
    'Lloyd Cooper Consulting Group',
    'Integrated Spatial Solutions',
    'Bakpage Labs',
    'Eclectics International',
    'Cape Media',
    'Kenya Civil Aviation Authority',
  ];
  for (const employer of employers) {
    if (!resume.includes(employer)) {
      failures.push(`dist/resume.html is missing the employer "${employer}".`);
    }
  }
}

if (failures.length > 0) {
  console.error('Bundle check failed:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`Bundle check passed: three is lazy-only (${preloaded.length} modulepreload(s): ${preloaded.join(', ')})`);
console.log('Resume check passed: dist/resume.html is complete and print-safe.');
