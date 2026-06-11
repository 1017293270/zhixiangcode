# ZXCode Product Fork Design

Date: 2026-06-11
Repository: `1017293270/zhixiangcode`
Base project: OpenCode (`anomalyco/opencode`)

## Goal

Create a product-level fork of OpenCode named ZXCode. The first version should feel like a real
ZXCode CLI while keeping OpenCode's agent architecture intact so the fork stays easy to verify and
possible to sync with upstream later.

The fork will use:

- Product name: `ZXCode`
- CLI command: `zxcode`
- Repository: `1017293270/zhixiangcode`
- Default user config directory: `~/.zxcode`
- Compatibility read path for existing OpenCode config where practical

## Scope

This is a level-2 product fork, not a deep rewrite.

In scope:

- Import OpenCode source as the starting codebase.
- Preserve the MIT license and OpenCode attribution.
- Rename user-facing product references from OpenCode to ZXCode where they define the product
  identity.
- Change the CLI binary from `opencode` to `zxcode`.
- Update package metadata, repository links, install docs, CLI help, startup banner, and release
  instructions that affect the user-facing product.
- Prefer `~/.zxcode` for new config and state.
- Keep compatibility with `.opencode` or OpenCode config files when low risk.
- Run focused build, typecheck, and CLI smoke checks after changes.

Out of scope for v1:

- Rewriting the agent loop, session core, model adapter, tool registry, or permission engine.
- Adding a new plugin system.
- Changing provider behavior or pricing logic.
- Building a desktop or web rebrand beyond references required for build consistency.
- Removing required upstream license notices.

## Architecture Approach

ZXCode will keep OpenCode's existing package layout and runtime architecture. The fork should only
change branding, command identity, config identity, documentation, and distribution metadata in v1.

Expected change areas:

- Root metadata: `package.json`, repository URLs, scripts that mention OpenCode.
- CLI package metadata and binary mapping under `packages/opencode`.
- User-facing strings in CLI help, splash/banner, installer output, and documentation.
- Config path constants and project marker references where they create files for users.
- README and install instructions.
- Attribution or notices file if needed to make the fork relationship explicit.

The implementation should avoid broad mechanical replacement until each occurrence is classified:

- Product identity references should become ZXCode.
- Package imports that still point to internal workspaces may need a staged rename or temporary
  compatibility alias.
- Historical attribution and license references should stay as OpenCode.
- Compatibility references to `.opencode` should stay where they intentionally support migration.

## Data And Config Flow

New ZXCode runs should create or prefer `~/.zxcode` for user-level state. Project-level config should
prefer ZXCode naming where the existing code supports it without risky storage changes.

Compatibility behavior:

1. Check ZXCode config paths first.
2. If no ZXCode config exists, read compatible OpenCode config paths where the schema is unchanged.
3. Do not silently delete or rewrite existing OpenCode config.
4. If both ZXCode and OpenCode config exist, ZXCode config wins.

This lets existing OpenCode users test ZXCode without losing state and lets new ZXCode users avoid
OpenCode-branded files.

## Compliance And Attribution

OpenCode is MIT licensed. ZXCode must preserve the original MIT license notice in copies or
substantial portions of the software.

The fork should include a clear attribution statement in the README or a notice file:

`ZXCode is a product-level fork derived from OpenCode. It is not affiliated with or endorsed by the
OpenCode maintainers.`

Do not remove OpenCode copyright or license text.

## Error Handling And Safety

The v1 rebrand should not weaken existing safety behavior:

- Keep command execution permission prompts intact.
- Keep tool confirmation and session permission boundaries intact.
- Keep existing error normalization and logging behavior intact.
- Do not add high-risk migration code that modifies user files automatically.

Migration-related failures should be non-destructive. If a config read fails in a compatibility path,
ZXCode should fall back to normal first-run behavior rather than rewriting the source file.

## Testing And Verification

Minimum verification for v1:

- Inspect all `opencode`, `OpenCode`, `.opencode`, `@opencode-ai`, and `opencode.ai` occurrences and
  classify them before changing.
- Run package-level typecheck for the CLI package according to repository rules.
- Run package-level tests where available for touched packages.
- Run CLI smoke checks:
  - `zxcode --help`
  - `zxcode --version`
  - first-run command path does not crash before model credentials are required
- Confirm `opencode` is not accidentally exposed as the primary installed binary unless deliberately
  kept as a temporary compatibility alias.
- Confirm README and installer instructions use `zxcode`.

If local provider credentials are unavailable, model-call behavior can be verified only up to the
credential boundary and documented in the final result.

## Rollout Plan

1. Import OpenCode into `1017293270/zhixiangcode`.
2. Create a short branch such as `zxcode-brand`.
3. Apply metadata and documentation rebrand.
4. Apply CLI binary and config-directory changes.
5. Run focused checks.
6. Push the branch and prepare a concise PR or merge note.

The first merge should stay narrow. Deeper ZXCode-specific workflows can follow after the renamed CLI
is installable and verified.

## Acceptance Criteria

- The repository builds from the imported OpenCode baseline.
- The user-facing CLI identity is ZXCode.
- The installable command is `zxcode`.
- New user-level config prefers `~/.zxcode`.
- OpenCode attribution and MIT license obligations are preserved.
- Existing OpenCode config is not destroyed or silently rewritten.
- Verification results are documented with exact commands and outcomes.
