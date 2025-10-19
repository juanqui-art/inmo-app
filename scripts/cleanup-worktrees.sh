#!/bin/bash

# Git Worktrees Cleanup Script
# Usage: ./scripts/cleanup-worktrees.sh feature-name bugfix-name

set -e  # Exit on error

if [ $# -ne 2 ]; then
    echo "Usage: ./scripts/cleanup-worktrees.sh <feature-name> <bugfix-name>"
    echo ""
    echo "Example:"
    echo "  ./scripts/cleanup-worktrees.sh dark-mode-navbar auth-accessibility"
    exit 1
fi

FEATURE_NAME="$1"
BUGFIX_NAME="$2"
PROJECT_DIR=$(pwd)
PARENT_DIR=$(dirname "$PROJECT_DIR")
PROJECT_NAME=$(basename "$PROJECT_DIR")

echo "🧹 Cleaning up git worktrees..."
echo ""
echo "Project: $PROJECT_NAME"
echo "Feature: $FEATURE_NAME"
echo "Bugfix: $BUGFIX_NAME"
echo ""

# Remove worktrees
echo "🔗 Removing worktrees..."
FEATURE_WORKTREE="$PARENT_DIR/$PROJECT_NAME-feature"
BUGFIX_WORKTREE="$PARENT_DIR/$PROJECT_NAME-bugfix"

if [ -d "$FEATURE_WORKTREE" ]; then
    git worktree remove "$FEATURE_WORKTREE"
    echo "  ✅ Removed: $FEATURE_WORKTREE"
else
    echo "  ℹ️  $FEATURE_WORKTREE not found"
fi

if [ -d "$BUGFIX_WORKTREE" ]; then
    git worktree remove "$BUGFIX_WORKTREE"
    echo "  ✅ Removed: $BUGFIX_WORKTREE"
else
    echo "  ℹ️  $BUGFIX_WORKTREE not found"
fi

echo ""

# Delete branches (optional)
read -p "Delete branches too? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Deleting branches..."
    git branch -d "feature/$FEATURE_NAME" 2>/dev/null && echo "  ✅ Deleted: feature/$FEATURE_NAME" || echo "  ⚠️  Could not delete feature/$FEATURE_NAME (may not be merged)"
    git branch -d "bugfix/$BUGFIX_NAME" 2>/dev/null && echo "  ✅ Deleted: bugfix/$BUGFIX_NAME" || echo "  ⚠️  Could not delete bugfix/$BUGFIX_NAME (may not be merged)"
else
    echo "  ℹ️  Skipping branch deletion"
fi

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📊 Current state:"
git worktree list
echo ""
git branch -a
