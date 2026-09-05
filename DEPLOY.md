# Deploying to HostPinnacle (cPanel, Apache)

## Build

```bash
npm run build
```

This produces a static, relocatable bundle in `dist/`. Every asset reference in
`dist/index.html` is relative (`./...`), so the site works whether it is
served from the domain root or a subdirectory — no server-side configuration
beyond plain static file hosting is required.

## Upload

cPanel's File Manager uploader accepts **files only** — it cannot upload a
directory. Selecting the contents of `dist/` therefore uploads the four
loose files and silently skips `assets/`, which leaves the site unstyled and
scriptless with a 404 in the console. Ship a zip and extract it server-side
instead.

1. Run `npm run build` locally. It must print all three check lines (bundle,
   resume, htaccess) — if it does not, do not deploy.
2. From the project root, zip the build's *contents*, not the folder:

   ```bash
   cd dist && zip -r ../deploy.zip . -x '.DS_Store' && cd ..
   ```

   The `.` includes dotfiles, so `.htaccess` is in the archive. Confirm it
   before uploading anything:

   ```bash
   unzip -l deploy.zip | grep htaccess
   ```

3. Log in to cPanel, open **File Manager**, and navigate to `public_html`
   (or the target domain/subdomain's document root).
4. Enable **Settings → Show Hidden Files (dotfiles)** in the File Manager
   toolbar. Do this first: without it you cannot see — or delete — the old
   `.htaccess`, and a stale one survives the redeploy.
5. Delete the previous deployment's contents from that directory, including
   the old `assets/` folder and the old `.htaccess`.
6. Upload `deploy.zip` into `public_html`. Then select it in File Manager and
   choose **Extract**, extracting into `public_html` itself.
7. Delete `deploy.zip` from `public_html` once the extraction has finished —
   it is a full copy of the site and does not belong on the web root.
8. Verify, in this order, before touching the browser:
   - `public_html/index.html` exists — at the web root, **not** nested as
     `public_html/dist/index.html`. If it is nested, the zip was made from
     the project root instead of from inside `dist/`.
   - `public_html/assets/` exists and contains `.js` and `.css` files.
   - `public_html/.htaccess` exists (dotfiles shown, per step 4).
   - `public_html/resume.html` exists.
9. Hard-refresh the site in your browser (Ctrl+Shift+R / Cmd+Shift+R) to
   bypass any cached copy of the old `index.html`.

### If something is wrong

- **The page is unstyled, or the console shows 404s for `/assets/…`** —
  `assets/` did not extract. Re-check step 8 and re-extract.
- **The page is a 500 (blank server error)** — remove `.htaccess` from
  `public_html` and reload. If the site comes back, the host is missing an
  Apache module the file uses and the file needs revisiting; the build's
  htaccess check guards the known case (`Header` outside `mod_headers`), but
  a 500 that clears this way is always the `.htaccess`.

## Notes

- `.htaccess` sets long-lived caching for hashed, immutable assets (CSS, JS,
  images) and disables caching on HTML documents, so a redeploy is always
  picked up without visitors needing to clear their cache.
- `resume.html` is a standalone, dependency-free page — it is also the target
  of the `<noscript>` fallback in `index.html` for visitors without
  JavaScript enabled.
