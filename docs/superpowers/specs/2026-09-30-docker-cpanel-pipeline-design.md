# Docker build environment and cPanel deploy pipeline — Design Spec

Date: 2026-09-30
Status: approved for planning

## 1. Purpose

Replace the manual cPanel upload in `DEPLOY.md` with a pipeline: a push to
`master` builds the site in a pinned container, runs the full suite and the
three build guards, and — only if all of that is green — puts the result on the
live subdomain without a human touching File Manager.

Two things motivate it. The manual procedure has four documented traps (the
file-only uploader, the hidden-dotfile `.htaccess`, the nested-`dist` zip, the
cached `index.html`), every one of which is a step a person can get wrong at
11pm. And the build output is the deliverable, guarded by three assertions
about bundle *shape* — the three.js import edge, `resume.html`'s contents, the
`mod_headers` guard — which can drift with a Node or npm version change.
`package.json` pins no Node version today, and the machine that builds is
whichever laptop is open.

The pipeline addresses both: one pinned toolchain used identically in CI and
locally, and a deploy that cannot skip a step.

## 2. Constraints

| Constraint | Consequence |
| --- | --- |
| cPanel shared hosting cannot run containers — static files, PHP, MySQL only | Docker is the *build environment*, never the runtime. Nothing containerised is deployed. The host receives built files. |
| The host has no Node | The host never builds. CI builds and ships built output; the host only copies files into place. |
| Site lives in a subdomain document root, not `public_html` root | The deploy target is one configured absolute path. No assumption that the target is the account root. |
| Deploy is continuous — every push to `master` goes live | The gate must be the build itself: type-check, 186 tests, three output guards. A red build cannot reach the host. |
| Build output is a hiring artifact | A half-landed deploy is worse than no deploy. Ordering and post-deploy verification are load-bearing, not nice-to-have. |
| Free-tier SSH is inconsistent between hosts | The transport's prerequisites are probed before the pipeline is written, not assumed. A fallback transport is named. |

## 3. Decisions

Each of these was chosen against an alternative; the alternative is recorded
because the reasoning is the part that does not survive in a config file.

**Docker is the build environment, used by CI and locally.** `node:26-slim`,
pinned by digest, matching the Node 26 already in use. Not Alpine: Tailwind v4
and Lightning CSS ship native binaries, and musl/glibc resolution is a standard
source of "builds on my machine, fails in the image". Not `setup-node` in CI
with Docker only for local use — that reintroduces the two-environment drift
the container exists to remove.

**The artifact leaves the image through a `FROM scratch` export stage.**
`docker buildx build --target export --output type=local,dest=dist .` writes
`dist/` straight to the filesystem. The alternative, `compose run` with `./dist`
bind-mounted out, is more conventional to read but writes root-owned files on
Linux unless the host UID is threaded through. No bind mounts anywhere means the
local command and CI's command are the same command.

**One CI job, not two.** Build, test and deploy in a single job so the artifact
that ships is provably the one the tests ran against. Splitting verify and
deploy into separate jobs requires passing the artifact between them and opens
the gap where they disagree.

**Transport is git push to cPanel Git Version Control.** CI commits `dist/`'s
contents to a `deploy` branch and pushes it to a repository on the host; cPanel
runs the deployment tasks in `.cpanel.yml`, which mirror the tree into the
subdomain document root. Chosen over `rsync` over SSH primarily for rollback:
the cPanel Git Version Control page can deploy an earlier commit directly, with
no rebuild and no dependency on GitHub being reachable. `rsync` offers only
rebuild-and-redeploy. The cost is honest — a deploy branch, a `.cpanel.yml`, and
a host-side script — and the atomicity guarantee moves from an rsync flag into
that script, which §5 specifies.

Linear history on `deploy`, not a force-pushed orphan per deploy. Git dedupes
unchanged blobs, so an unchanged 444 kB portrait adds no objects, and the
history is what makes rollback possible.

**FTP is the fallback, not the transport.** FTPS via `lftp` is specified in §8
and built only if the §7 probes find SSH unusable. It loses on every axis that
matters here: an unencrypted channel unless FTPS works, and free tiers commonly
present certificates that push people to disable verification; no transactional
ordering; per-file round trips over Nairobi-to-host latency; server-side sync
state in a JSON file in the document root that can drift; and no rollback at
all. With SSH available, FTP is the weaker channel for no gain.

**The SSH port lives in exactly one place.** CI writes a single `~/.ssh/config`
block; every later command refers to the host alias. Git's short remote syntax
(`user@host:/path`) cannot carry a port — everything after the colon is the path
— and the resulting failure names neither the port nor the cause. This has
already cost this project time once. The URL form
(`ssh://user@host:PORT/path`) or a config entry are the only forms that work,
and host-key pinning has the same trap: `ssh-keyscan` without `-p PORT` silently
scans 22 and returns a key that will never match.

## 4. Components

| File | Responsibility |
| --- | --- |
| `Dockerfile` | Stages: `deps` (`npm ci`), `test`, `build` (`npm run build`), `export` (`FROM scratch`, holds `dist/` only) |
| `compose.yaml` | `test` and `shell` services against the same image; no bind mounts |
| `.dockerignore` | Excludes `node_modules`, `dist`, `.git`, `docs/`, `design/`, `.serena/`, `.superpowers/` from the build context |
| `.github/workflows/ship.yml` | The single job: verify always, deploy only on `master` |
| `deploy/cpanel.yml` | Source of the cPanel deployment tasks; invokes the host-side script |
| `deploy/mirror.sh` | Source of the host-side two-phase mirror into the document root |
| `scripts/toolchainPin.test.mjs` | Asserts the `Dockerfile` is digest-pinned and its Node major matches `engines.node` |
| `package.json` | Gains `engines.node`, `test`, `docker:build`, `docker:test` |

## 5. Flow

On push to `master`:

1. **Preflight.** Assert every required secret and variable is present. A
   misconfigured repo fails in seconds, not at the transport.
2. **Path guard.** Refuse to proceed if the target path is empty, relative, `/`,
   or the bare home directory. A mirror-with-delete pointed at `$HOME` would
   delete the account.
3. **Build the image**, with GitHub Actions layer caching.
4. **Test.** `compose run --rm test` — the full suite inside the image.
5. **Export.** `dist/` onto the runner via the `export` stage.
6. **Publish.** Commit `dist/`'s contents to the `deploy` branch and push it to
   the host repository through the SSH alias. cPanel reads `.cpanel.yml` from
   the *root* of the deployed branch, so the two files kept under `deploy/` on
   `master` are written to the branch root as `.cpanel.yml` and `mirror.sh`.
   They live in a subdirectory on `master` only to keep the working tree tidy;
   their deployed location is fixed by cPanel, not chosen.
7. **Deploy.** cPanel runs `.cpanel.yml`, which runs `mirror.sh` on the host.
8. **Verify.** Read the hashed entry chunk's filename out of the local
   `dist/index.html`; request it from the live site expecting 200, plus `/` and
   `/resume.html`. A half-landed deploy fails the run instead of sitting broken.

On pull requests and other branches: steps 3–5 only. Everything is verified,
nothing ships.

**Ordering, inside `mirror.sh`.** Two phases, and the order is the whole point.
The script uses `rsync` locally on the host if §7's probe finds it, since two
`rsync` passes express this directly; if not, the same two phases are `cp -R`
followed by a `find`-based reap of paths absent from the deployed tree. Both
forms are portable to a jailed shell, and the script must not assume a login
shell's `PATH`.
First copy the new tree into the document root *without* deleting anything, so
new hashed assets exist while the old `index.html` still refers to assets that
are still there. Then reap whatever is no longer in the tree. Reversing these,
or doing a delete-then-copy, opens a window where a visitor gets an
`index.html` whose assets 404 — or an empty document root. Dotfiles are part of
the tree, so `.htaccess` ships without anyone remembering it, which retires the
manual procedure's worst trap.

**Concurrency.** `group: deploy-production`, `cancel-in-progress: false`. Two
quick pushes queue; they never interleave two mirrors into one directory.
Cancelling a running deploy is what leaves a document root half-written.

**Dry run.** `workflow_dispatch` takes a `dry_run` input that runs steps 1–6
except the push itself: it builds, tests, exports, and builds the `deploy`
commit locally, then reports what the push would change (`git push --dry-run`
against the host, and the commit's diff against the remote branch). Nothing on
the host is written and no deployment is triggered. This is how the pipeline is
exercised the first time — it proves the SSH alias, the port, the pinned host
key and the repository path before any of them can damage a live document
root.

## 6. Configuration

Secrets: `DEPLOY_SSH_KEY` (a dedicated ed25519 key, no passphrase),
`DEPLOY_KNOWN_HOSTS` (pinned, from `ssh-keyscan -p PORT`).

Variables: `DEPLOY_HOST`, `DEPLOY_USER` (`theparad`), `DEPLOY_PORT`,
`DEPLOY_REPO_PATH`, `DEPLOY_DOCROOT`, `SITE_URL`.

Where each value comes from, since gathering them is a setup step and not
discoverable from the repo:

| Value | Source |
| --- | --- |
| `DEPLOY_HOST` | cPanel sidebar → General Information, or the HostPinnacle welcome email. Often `serverN.hostpinnacle.*`, not the domain |
| `DEPLOY_PORT` | cPanel → SSH Access. Confirm it; do not assume 22 |
| `DEPLOY_DOCROOT` | cPanel → Domains, the subdomain's Document Root |
| `DEPLOY_REPO_PATH` | cPanel → Git Version Control, shown when the repository is created. Defaults to `/home/theparad/repositories/<name>` |
| `DEPLOY_SSH_KEY` | Generated at setup; the public half is pasted into cPanel → SSH Access → Manage SSH Keys **and authorized there**. cPanel requires that second click, and skipping it presents exactly like a wrong key |

## 7. Open questions, to be probed before implementation

Both are host behaviours that no amount of reading settles, and each has a
known response. Neither blocks the design; both must be answered before the
transport is final.

1. **What does the cPanel shell actually have — `git`, and `rsync`?** Some free
   tiers give a jailed shell without either. No `git` means the transport falls
   back to §8. No `rsync` is not fatal: it selects `mirror.sh`'s `cp`-plus-reap
   form, per §5.
2. **Does cPanel deploy automatically on push, or must deployment be
   triggered?** If it must be triggered, CI issues a
   `uapi VersionControlDeployment create` call over the same SSH alias after
   pushing — one extra step, no redesign.

Write neither path speculatively. Probe, then implement the answer.

## 8. Fallback transport

If §7's first probe fails: FTPS via `lftp`, installed in the same image, two
passes (mirror without delete, then mirror with delete) to preserve §5's
ordering guarantee, `.htaccess` explicitly included, credentials as secrets, and
certificate verification left on — if the host's certificate cannot be verified,
that is a finding to resolve, not to switch off. Rollback under this transport
is rebuild-and-redeploy; the §3 rollback advantage is lost, which is part of why
it is the fallback.

## 9. Verification

A workflow cannot be unit-tested. Three things keep it honest instead.

The existing guards run *inside* the image, so the pipeline inherits every
assertion the project already makes about its output — nothing new is trusted.
`scripts/toolchainPin.test.mjs` asserts the `Dockerfile`'s base image is
digest-pinned and its Node major matches `engines.node`, in the style of
`htaccessGuard.test.mjs`, so the container and the developer's machine cannot
drift apart silently. And the first live exercise is the §5 dry run, whose
output is read before the pipeline is allowed to write.

Rollback is verified once, deliberately, at setup: deploy an earlier commit
from the cPanel Git Version Control page and confirm the live site changes. An
untested rollback is not a rollback.

## 10. Documentation changes

`DEPLOY.md` is restructured: the pipeline becomes the primary path — secret
setup, dry run, rollback, what each failure means — and the current manual zip
procedure is kept intact as the fallback for when CI is unavailable. It is
hard-won detail and is not deleted.

`README.md` gains the two Docker commands in Getting started and a short
pipeline section.

## 11. Out of scope

- Any container running on the host. The tier cannot do it.
- Timestamped release directories with symlink swapping. Shared hosts are
  inconsistent about symlinked document roots, and cPanel's own commit history
  already provides rollback.
- Staging environments, preview deploys per branch, CDN or image pipelines.
- A containerised dev server. `npm run dev` on the host works; HMR through a
  bind mount is friction for no benefit here.
