#!/bin/bash

# Git Worktrees Setup Script
# Usage: ./scripts/setup-worktrees.sh feature-name bugfix-name

set -e  # Exit on error

if [ $# -ne 2 ]; then
    echo "Usage: ./scripts/setup-worktrees.sh <feature-name> <bugfix-name>"
    echo ""
    echo "Example:"
    echo "  ./scripts/setup-worktrees.sh dark-mode-navbar auth-accessibility"
    exit 1
fi

FEATURE_NAME="$1"
BUGFIX_NAME="$2"
PROJECT_DIR=$(pwd)
PARENT_DIR=$(dirname "$PROJECT_DIR")
PROJECT_NAME=$(basename "$PROJECT_DIR")

echo "🚀 Setting up git worktrees..."
echo ""
echo "Project: $PROJECT_NAME"
echo "Feature: $FEATURE_NAME"
echo "Bugfix: $BUGFIX_NAME"
echo ""

# Create branches
echo "📝 Creating branches..."
git branch "feature/$FEATURE_NAME" 2>/dev/null || echo "  ℹ️  Branch feature/$FEATURE_NAME already exists"
git branch "bugfix/$BUGFIX_NAME" 2>/dev/null || echo "  ℹ️  Branch bugfix/$BUGFIX_NAME already exists"
echo "✅ Branches ready"
echo ""

# Create worktrees
echo "🔗 Creating worktrees..."
FEATURE_WORKTREE="$PARENT_DIR/$PROJECT_NAME-feature"
BUGFIX_WORKTREE="$PARENT_DIR/$PROJECT_NAME-bugfix"

if [ -d "$FEATURE_WORKTREE" ]; then
    echo "  ⚠️  $FEATURE_WORKTREE already exists, skipping..."
else
    git worktree add "$FEATURE_WORKTREE" "feature/$FEATURE_NAME"
    echo "  ✅ Created: $FEATURE_WORKTREE"
fi

if [ -d "$BUGFIX_WORKTREE" ]; then
    echo "  ⚠️  $BUGFIX_WORKTREE already exists, skipping..."
else
    git worktree add "$BUGFIX_WORKTREE" "bugfix/$BUGFIX_NAME"
    echo "  ✅ Created: $BUGFIX_WORKTREE"
fi

echo ""
echo "✨ Worktrees setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1️⃣  Terminal 1 - Feature work:"
echo "   cd $FEATURE_WORKTREE"
echo "   claude"
echo ""
echo "2️⃣  Terminal 2 - Bugfix work (in parallel):"
echo "   cd $BUGFIX_WORKTREE"
echo "   claude"
echo ""
echo "3️⃣  When done, merge to main:"
echo "   cd $PROJECT_DIR"
echo "   git merge feature/$FEATURE_NAME"
echo "   git merge bugfix/$BUGFIX_NAME"
echo ""
echo "4️⃣  Clean up:"
echo "   ./scripts/cleanup-worktrees.sh $FEATURE_NAME $BUGFIX_NAME"
echo ""
echo "📖 For more info, see: docs/git-worktrees-guide.md"