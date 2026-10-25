# md-doctor — history

Every session's log, **newest first**. Read on demand, not at startup. The current
snapshot is the Session Handoff at the bottom of `CLAUDE.md`.

**Adding an entry:** at the end of a session, move the old handoff here as a new entry
at the top, then overwrite the handoff. One entry per session, 5–10 lines:

```
## YYYY-MM-DD — <what, in a few words>
*<machine: Mac | PC> · <agent: Claude | Antigravity> · commits `abc1234`*
- **Changed:** what is different now, for the user and in the code.
- **Why:** the ask or the problem, and any decision made (with its reason).
- **Verified:** what was run and what it said; what was NOT checked.
- **Left open:** anything unfinished or waiting on the owner.
```

---

## 2026-10-24 — CLAUDE.md and HISTORY.md added

*Mac · Claude · docs only, no code touched*
- **Changed:** the repo had no `CLAUDE.md`/`AGENTS.md`; both now exist in the owner's standard
  seven sections, describing what `index.js` actually does. Added `.claudeignore`.
- **Why:** one structure across every repo.
- **Verified:** read `index.js` in full; ran it on the owner's vault and EduSystem repo.
- **Left open:** no test suite yet.

## 2026-09-07 — initial commit

*commit `d96c848`* — the link checker, `README.md`, `package.json`.
