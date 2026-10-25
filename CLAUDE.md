# md-doctor — rules & map (read this first)

A zero-dependency Node.js CLI that scans Markdown files for broken local links.

**History:** [`HISTORY.md`](HISTORY.md), newest first. **Business side:** the owner's my-brain
vault, `projects/md-doctor/context.md`. **Repo:** `Mbottega16/md-doctor` (**public**, MIT) —
Mac `projects/md-doctor/app` in the vault.

## What this is
- **What:** walks a folder, finds every `.md` file, and checks that each relative Markdown link
  points to a file that exists. Skips `http…`, `mailto:` and `#anchor`-only
  links; strips `#anchors` from file links; decodes `%20`. Exits 1 when anything is broken, so it
  works as a check in scripts and CI.
- **For:** anyone keeping a big Markdown vault or docs repo — first of all the owner's
  `my-brain` vault and its project repos.
- **Platform:** one file, `index.js`, Node standard library only.
- **What "done" looks like:** a fast, trustworthy link check with a test suite behind it.

## Settled decisions (don't re-argue)
- **Zero runtime dependencies** so it runs anywhere with Node.
- **One job: broken local links.** Headings and frontmatter are not checked (not built).

## How it's built
| | |
|---|---|
| `index.js` | The whole tool: `getMarkdownFiles()` walks the tree; a regex finds Markdown links; `fs.existsSync` checks each resolved path |
| `package.json` | `bin: md-doctor` → `index.js`; no dependencies |
| `README.md` | Usage and example output |

## Commands & Verification
```bash
node index.js <folder>     # or: npx md-doctor <folder> · npm install -g . && md-doctor
```
There is no test suite yet (`npm test` just errors). Verify a change by running it on a folder
with a known broken link and a known good one.

## Never Read / Noise Zones (Do Not Scan)
- `node_modules/` (none today), `.git/`.

## Rules & Gotchas
- **It skips every folder whose name starts with `.`** (so `.claude/`, `.github/` are never
  checked), plus `node_modules` and `dist`.
- **It does not skip fenced code blocks or inline code** — an example link inside a code sample
  is checked as a real link (writing one in this file once flagged three false breaks).
- The link regex is simple: `<angle-bracket>` links and links with a `"title"` are not parsed
  correctly.
- **This repo is public:** keep private notes in the owner's vault, not here.

## Session Handoff (Last Worked On · Current State · Next Up)

*Overwrite this at the end of every session; move the previous handoff into `HISTORY.md` first.*

- **Last Worked On (2026-09-07):** initial commit (`d96c848`). This `CLAUDE.md` was added 2026-10-24.
- **Current State:** works; used on 2026-10-24 to check the vault and the EduSystem repo after the
  docs restructure (zero broken links).
- **Next Up:** a unit test suite; then, if wanted, skip fenced code blocks.
