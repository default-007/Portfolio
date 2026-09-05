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

1. Run `npm run build` locally.
2. Log in to cPanel and open **File Manager**.
3. Navigate to `public_html` (or the target domain/subdomain's document root).
4. Delete the previous deployment's contents from that directory.
5. Upload the **contents** of `dist/` — not the `dist` folder itself. Select
   everything inside `dist/` (`index.html`, `assets/`, `resume.html`,
   `.htaccess`, and any other files Vite emitted) and upload those directly
   into `public_html`, so `index.html` ends up at `public_html/index.html`,
   not `public_html/dist/index.html`.
6. Confirm `.htaccess` made it into the upload. File Manager hides dotfiles by
   default — enable **Settings → Show Hidden Files (dotfiles)** in the File
   Manager toolbar to see it and verify it landed alongside `index.html`.
7. Hard-refresh the site in your browser (Ctrl+Shift+R / Cmd+Shift+R) to
   bypass any cached copy of the old `index.html` before checking the result.

## Notes

- `.htaccess` sets long-lived caching for hashed, immutable assets (CSS, JS,
  images) and disables caching on HTML documents, so a redeploy is always
  picked up without visitors needing to clear their cache.
- `resume.html` is a standalone, dependency-free page — it is also the target
  of the `<noscript>` fallback in `index.html` for visitors without
  JavaScript enabled.
