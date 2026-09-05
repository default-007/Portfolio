// The .htaccess walk, factored out of check-bundle.mjs so it can be unit
// tested. check-bundle.mjs runs against real build output and exits the
// process; this function is pure — text in, offending 1-based line numbers
// out — so every guard case can be asserted directly.
//
// An unguarded Header directive does not degrade on a host without
// mod_headers: Apache rejects it as "Invalid command 'Header'" and returns
// 500 for every request under the directory. Verified against Apache 2.4.58.

// Apache directive and section names are case-insensitive: `header set …`,
// `HEADER SET …` and `<ifmodule mod_headers.c>` are all accepted by Apache
// exactly as their canonical spellings are. A case-sensitive check therefore
// waves through a file that takes the site dark. `headers_module` is the
// other spelling Apache accepts for the same module and is a guard too;
// without it a correctly guarded file fails the build.
const GUARD_OPEN = /^<IfModule\s+(?:mod_headers\.c|headers_module)>/i;
const HEADER_DIRECTIVE = /^Header\s/i;
const SECTION_OPEN = /^<[A-Za-z]/;
const SECTION_CLOSE = /^<\//;

/**
 * @param {string} text contents of an .htaccess file
 * @returns {number[]} 1-based line numbers of Header directives that are not
 *   inside a mod_headers guard
 */
export function findUnguardedHeaderLines(text) {
  // Walks the file tracking whether we are inside a mod_headers guard, rather
  // than pattern-matching, so a Header directive nested any depth down inside
  // the guard (as the FilesMatch one is) still reads as covered.
  const unguarded = [];
  let depth = 0;
  let guardedAt = null;
  text.split('\n').forEach((line, i) => {
    const text = line.trim();
    if (GUARD_OPEN.test(text) && guardedAt === null) guardedAt = depth;
    if (SECTION_OPEN.test(text)) depth += 1;
    else if (SECTION_CLOSE.test(text)) {
      depth -= 1;
      if (guardedAt !== null && depth === guardedAt) guardedAt = null;
    } else if (HEADER_DIRECTIVE.test(text) && guardedAt === null) {
      unguarded.push(i + 1);
    }
  });
  return unguarded;
}
