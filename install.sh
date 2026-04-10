#!/usr/bin/env bash
# Claude Code Buddy Pet - Installer (Linux/macOS)
set -e

echo "🐾 Installing Claude Code Buddy Pet..."

# Clone or update
BUDDY_DIR="$HOME/.claude/buddy-src"
if [ -d "$BUDDY_DIR" ]; then
  echo "  Updating existing installation..."
  cd "$BUDDY_DIR" && git pull
else
  echo "  Downloading..."
  git clone https://github.com/HUNSETO1413/buddy.git "$BUDDY_DIR"
  cd "$BUDDY_DIR"
fi

# Install dependencies (including devDependencies for build)
echo "  Installing dependencies..."
npm install

# Build TypeScript
echo "  Building..."
npx tsc

# Register hooks
echo "  Registering hooks..."
node dist/scripts/setup.js

echo ""
echo "✅ Buddy Pet installed! Launch Claude Code and type /buddy to hatch your pet!"
