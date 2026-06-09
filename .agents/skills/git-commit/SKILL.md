---
name: git-commit
description: 'Execute git commit with conventional commit message analysis, intelligent staging, and message generation. Use when user asks to commit changes, create a git commit, or mentions "/commit". Supports: (1) Auto-detecting type and scope from changes, (2) Creating a feature branch when on main/master before committing, (3) Generating conventional commit messages from diff, (4) Interactive commit with optional type/scope/description overrides, (5) Intelligent file staging for logical grouping'
license: MIT
allowed-tools: Bash
---

# Git Commit with Conventional Commits

## Overview

Create standardized, semantic git commits using the Conventional Commits specification. Analyze the actual diff to determine appropriate type, scope, and message.

## Conventional Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type       | Purpose                        |
| ---------- | ------------------------------ |
| `feat`     | New feature                    |
| `fix`      | Bug fix                        |
| `docs`     | Documentation only             |
| `style`    | Formatting/style (no logic)    |
| `refactor` | Code refactor (no feature/fix) |
| `perf`     | Performance improvement        |
| `test`     | Add/update tests               |
| `build`    | Build system/dependencies      |
| `ci`       | CI/config changes              |
| `chore`    | Maintenance/misc               |
| `revert`   | Revert commit                  |

## Breaking Changes

```
# Exclamation mark after type/scope
feat!: remove deprecated endpoint

# BREAKING CHANGE footer
feat: allow config to extend other configs

BREAKING CHANGE: `extends` key behavior changed
```

## Workflow

### 1. Analyze Diff

```bash
# If files are staged, use staged diff
git diff --staged

# If nothing staged, use working tree diff
git diff

# Also check status
git status --porcelain
```

From the diff, determine the commit **type** and a short **description** (needed for branch naming in step 2).

### 2. Ensure Feature Branch

If the current branch is `main` or `master`, create a feature branch **before** staging or committing.

```bash
git branch --show-current
```

**Branch naming** (see `AGENTS.md`, `CONTRIBUTING.md`):

```
<type>/<kebab-case-description>
```

| Commit type | Branch prefix | Example |
| ----------- | ------------- | ------- |
| `feat`      | `feat/`       | `feat/custom-shortcuts` |
| `fix`       | `fix/`        | `fix/upload-timeout` |
| `docs`      | `docs/`       | `docs/contributing-guide` |
| other types | `<type>/`     | `chore/add-create-pr-skill` |

Rules for `<kebab-case-description>`:

- Lowercase, words separated by hyphens
- Derived from the commit description (drop scope, articles, punctuation)
- Keep it short (2–5 words), e.g. `add create pr skill` → `add-create-pr-skill`

```bash
# Example: chore commit about adding create-pr skill
git checkout -b chore/add-create-pr-skill
```

Do **not** commit directly on `main` or `master`. If the user explicitly asks to commit on the default branch, confirm before proceeding.

### 3. Stage Files (if needed)

If nothing is staged or you want to group changes differently:

```bash
# Stage specific files
git add path/to/file1 path/to/file2

# Stage by pattern
git add *.test.*
git add src/components/*

# Interactive staging
git add -p
```

**Never commit secrets** (.env, credentials.json, private keys).

### 4. Generate Commit Message

Analyze the diff to determine:

- **Type**: What kind of change is this?
- **Scope**: What area/module is affected?
- **Description**: One-line summary of what changed (present tense, imperative mood, <72 chars)

### 5. Execute Commit

```bash
# Single line
git commit -m "<type>[scope]: <description>"

# Multi-line with body/footer
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>

<optional footer>
EOF
)"
```

## Best Practices

- One logical change per commit
- Present tense: "add" not "added"
- Imperative mood: "fix bug" not "fixes bug"
- Reference issues: `Closes #123`, `Refs #456`
- Keep description under 72 characters

## Git Safety Protocol

- NEVER update git config
- NEVER run destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless user asks
- NEVER force push to main/master
- If commit fails due to hooks, fix and create NEW commit (don't amend)

## Project Notes (doocs/md)

- Commit messages must be in **English** (see `AGENTS.md`)
- Branch naming: `feat/`, `fix/`, `docs/` (plus `<type>/` for other commit types); never commit on `main`/`master` — create a branch first (step 2)
- Pre-commit runs `eslint --fix` via lint-staged; if the hook modifies files, fix and create a new commit instead of amending
