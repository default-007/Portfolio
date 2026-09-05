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

if (failures.length > 0) {
  console.error('Bundle check failed:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`Bundle check passed: three is lazy-only (${preloaded.length} modulepreload(s): ${preloaded.join(', ')})`);
