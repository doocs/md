---
name: create-pr
description: Create a GitHub pull request following project conventions. Use when the user asks to create a PR, submit changes for review, or open a pull request. Handles commit analysis, branch management, PR template usage, and PR creation using the gh CLI tool.
---

# Create PR

This skill guides you through creating a well-structured GitHub pull request that follows project conventions and best practices.

## Prerequisites Check

Before proceeding, verify the following:

### 1. Check if `gh` CLI is installed

```bash
gh --version
```

If not installed, inform the user:
> The GitHub CLI (`gh`) is required but not installed. Please install it:
> - macOS: `brew install gh`
> - Other: https://cli.github.com/

### 2. Check if authenticated with GitHub

```bash
gh auth status
```

If not authenticated, guide the user to run `gh auth login`.

### 3. Verify clean working directory

```bash
git status
```

If there are uncommitted changes, ask the user whether to:
- Commit them as part of this PR
- Stash them temporarily
- Discard them (with caution)

## Gather Context

### 1. Identify the current branch

```bash
git branch --show-current
```

Ensure you're not on `main` or `master`. If so, ask the user to create or switch to a feature branch.

### 2. Find the base branch

Determine the default branch once and reuse it as `BASE_BRANCH` in all later commands:

```bash
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')

# Fallback when origin/HEAD is not configured
if [ -z "$BASE_BRANCH" ]; then
  BASE_BRANCH=$(git remote show origin | sed -n '/HEAD branch/s/.*: //p')
fi
```

This is typically `main` or `master`, but may differ per repo.

### 3. Analyze recent commits relevant to this PR

```bash
git log "origin/${BASE_BRANCH}..HEAD" --oneline --no-decorate
```

Review these commits to understand:
- What changes are being introduced
- The scope of the PR (single feature/fix or multiple changes)
- Whether commits should be squashed or reorganized

### 4. Review the diff

```bash
git diff "origin/${BASE_BRANCH}..HEAD" --stat
```

This shows which files changed and helps identify the type of change.

## Information Gathering

Before creating the PR, you need the following information. Check if it can be inferred from:
- Commit messages
- Branch name (e.g., `fix/upload-timeout`, `feat/custom-shortcuts`)
- Changed files and their content

If any critical information is missing, ask the user directly:

### Required Information

1. **Related Issue Number** (optional): Look for patterns like `#123`, `fixes #123`, or `closes #123` in commit messages. If none is found, **omit the Related Issue section** from the PR body — do not use placeholders like `#XXXX`.
2. **Description**: What problem does this solve? Why were these changes made?
3. **Type of Change**: Bug fix, new feature, breaking change, refactor, cosmetic, documentation, or workflow
4. **Test Procedure**: How was this tested? What could break?

Only ask about a related issue when the change clearly looks like it should close one (e.g. branch name `fix/issue-123`). For small or self-contained changes, skip the question and leave the section out.

## Git Best Practices

Before creating the PR, consider these best practices:

### Commit Hygiene

1. **Atomic commits**: Each commit should represent a single logical change
2. **Clear commit messages**: Follow conventional commit format when possible
3. **No merge commits**: Prefer rebasing over merging to keep history clean

### Branch Management

1. **Rebase on latest base branch** (if needed):
   ```bash
   git fetch origin
   git rebase "origin/${BASE_BRANCH}"
   ```

2. **Squash if appropriate**: If there are many small "WIP" commits, consider interactive rebase:
   ```bash
   git rebase -i "origin/${BASE_BRANCH}"
   ```
   Only suggest this if commits appear messy and the user is comfortable with rebasing.

### Push Changes

Ensure all commits are pushed:
```bash
git push origin HEAD
```

If the branch was rebased, you may need:
```bash
git push origin HEAD --force-with-lease
```

## Create the Pull Request

Use `CONTRIBUTING.md` (Pull Request 流程) as the source of truth for PR content. If `.github/pull_request_template.md` exists, follow that template exactly. Otherwise, use this structure:

- **Summary** — what changed and why
- **Related Issue** — only when a real issue is linked (e.g. `Closes #123`); omit entirely if none
- **Type of Change** — check applicable boxes
- **Test Procedure** — how you verified the change
- **Pre-flight Checklist** — mark items that apply

When filling out the PR body:
- Include **Related Issue** only when a real issue number is known (e.g. `Closes #123`). **Do not** add a Related Issue section or `#XXXX` placeholder when there is no linked issue.
- Fill in all other sections with relevant information gathered from commits and context
- Mark the appropriate "Type of Change" checkbox(es)
- Complete the "Pre-flight Checklist" items that apply

### Create PR with gh CLI

**Use a temporary file for the PR body** to avoid shell escaping issues, newline problems, and other command-line flakiness:

1. Write the PR body to a temporary file (e.g. `$env:TEMP/pr-body.md` on Windows, `/tmp/pr-body.md` on macOS/Linux).

2. Create the PR using the file:
   ```bash
   gh pr create --title "PR_TITLE" --body-file /tmp/pr-body.md --base "$BASE_BRANCH"
   ```

3. Clean up the temporary file after the PR is created.

For draft PRs:
```bash
gh pr create --title "PR_TITLE" --body-file /tmp/pr-body.md --base "$BASE_BRANCH" --draft
```

**Why use a file?** Passing complex markdown with newlines, special characters, and checkboxes directly via `--body` is error-prone. The `--body-file` flag handles all content reliably.

## Post-Creation

After creating the PR:

1. **Display the PR URL** so the user can review it
2. **Remind about CI checks**: Tests and linting will run automatically
3. **Suggest next steps**:
   - Add reviewers if needed: `gh pr edit --add-reviewer USERNAME`
   - Add labels if needed: `gh pr edit --add-label "bug"`

## Error Handling

### Common Issues

1. **No commits ahead of base branch**: The branch has no changes to submit
   - Ask if the user meant to work on a different branch

2. **Branch not pushed**: Remote doesn't have the branch
   - Push the branch first: `git push -u origin HEAD`

3. **PR already exists**: A PR for this branch already exists
   - Show the existing PR: `gh pr view`
   - Ask if they want to update it instead

4. **Merge conflicts**: Branch conflicts with base
   - Guide user through resolving conflicts or rebasing

## Summary Checklist

Before finalizing, ensure:
- [ ] `gh` CLI is installed and authenticated
- [ ] Working directory is clean
- [ ] All commits are pushed
- [ ] Branch is up-to-date with base branch
- [ ] Related Issue section included only when a real issue is linked (no `#XXXX` placeholder)
- [ ] PR description follows the template or project conventions
- [ ] Appropriate type of change is selected
- [ ] Pre-flight checklist items are addressed
