# ZXCode Agent Guide

This repository is a product-level fork of OpenCode named ZXCode. Keep the OpenCode runtime architecture intact while moving user-facing identity, documentation, and distribution surfaces toward ZXCode.

## Project Facts

- Default branch upstream is `dev`.
- Current product branch is usually `zxcode-brand`.
- Development entrypoint from the repo root:

```powershell
bun run dev
```

- Root `test` intentionally exits. Run package-level tests from package directories, for example:

```powershell
cd packages\opencode
bun test
```

- Typecheck from package roots when possible:

```powershell
cd packages\opencode
bun run typecheck
```

## Branding Rules

- User-facing product name should be `ZXCode`.
- User-facing command examples should prefer `zxcode`.
- Chinese TUI tips and startup prompt should remain Chinese unless the user asks otherwise.
- Do not mechanically replace every `opencode` string. Classify first:
  - Change product UI, CLI examples, README text, terminal titles, install docs, and visible prompts.
  - Keep upstream attribution, MIT license references, historical notes, and compatibility wording.
  - Keep internal `@opencode-ai/*` package imports unless the task explicitly covers deep package renaming.
  - Keep provider IDs such as `opencode` when they are protocol or provider identifiers.

## Config And Secrets

- Never commit real API keys, tokens, cookies, private endpoints, or user credentials.
- Local user config may exist at `$HOME\.config\opencode\opencode.jsonc`; treat it as local state, not repo content.
- Future product work should prefer `.zxcode` and `~/.zxcode` for new ZXCode config while keeping read-only compatibility with `.opencode` where low risk.
- If showing config examples, use placeholders such as `YOUR_API_KEY`, `not-needed`, and `http://your-ollama-host:11434/v1`.

## Git Safety

- The working tree may contain unrelated user files such as `bun.lock`, spreadsheets, reports, or generated local folders. Do not stage them unless the user explicitly says they belong in the commit.
- Prefer explicit `git add <path>` over `git add -A` in mixed worktrees.
- Do not reset, checkout, or delete user changes unless explicitly requested.
- Conventional commit format is preferred:

```text
type(scope): summary
```

Examples:

```text
docs: document zxcode startup flow
feat(tui): localize home tips
fix(config): preserve legacy opencode reads
```

## Code Style

- Prefer existing project patterns over new abstractions.
- Keep changes scoped to the requested surface.
- Use Bun and existing workspace scripts.
- Keep TypeScript readable and avoid `any`.
- Do not add broad package renames or deep runtime rewrites as part of narrow branding/documentation tasks.

## Verification

For UI/branding documentation work:

- Run `git diff --check` for touched files.
- Search touched surfaces for stale visible strings such as `OpenCode`, `opencode run`, `.opencode`, and old English tips.
- Restart `bun run dev` when visual confirmation is needed.

For provider/config work:

- Validate JSON/JSONC syntax.
- Redact secrets in all terminal output and final messages.
- Prefer endpoint checks that list models without printing credentials.

## Attribution

ZXCode is derived from OpenCode and must preserve MIT license obligations and clear non-affiliation wording. Do not remove upstream license text.
