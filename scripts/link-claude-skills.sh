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
  link_target="$(readlink "$LINK")"
  if [[ "$link_target" != /* ]]; then
    link_resolved="$(cd "$(dirname "$LINK")" && cd "$link_target" && pwd)"
  else
    link_resolved="$(cd "$link_target" && pwd)"
  fi
  target_resolved="$(cd "$TARGET" && pwd)"
  if [[ "$link_resolved" == "$target_resolved" ]]; then
    echo "Already linked: $LINK -> $TARGET"
    exit 0
  fi
  rm -rf "$LINK"
elif [[ -e "$LINK" ]]; then
  rm -rf "$LINK"
fi

ln -s ../.agents/skills "$LINK"
echo "Linked $LINK -> $TARGET"
