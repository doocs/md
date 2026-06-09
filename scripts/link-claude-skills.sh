#!/usr/bin/env bash
# Links .claude/skills -> .agents/skills for Claude Code discovery.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LINK="$ROOT/.claude/skills"
TARGET="$ROOT/.agents/skills"

if [[ ! -d "$TARGET" ]]; then
  echo "Missing target directory: $TARGET" >&2
  exit 1
fi

if [[ -L "$LINK" ]]; then
  echo "Already linked: $LINK -> $(readlink "$LINK")"
  exit 0
fi

if [[ -e "$LINK" ]]; then
  rm -rf "$LINK"
fi

ln -s ../.agents/skills "$LINK"
echo "Linked $LINK -> $TARGET"
