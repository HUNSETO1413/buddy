#!/usr/bin/env bash
# Claude Code Buddy Pet - Installer (Linux/macOS)
set -e

echo ""
echo "🐾 Claude Code Buddy Pet - Installer"
echo ""

# Clone or update
BUDDY_DIR="$HOME/.claude/buddy-src"
if [ -d "$BUDDY_DIR" ]; then
  echo "  Updating existing installation..."
  cd "$BUDDY_DIR" && git pull
else
  echo "  Downloading from GitHub..."
  git clone https://github.com/HUNSETO1413/buddy.git "$BUDDY_DIR"
  cd "$BUDDY_DIR"
fi

# Install dependencies and build
echo "  Installing dependencies..."
npm install
echo "  Building..."
npx tsc

# Register hooks + create slash command
echo "  Registering hooks and commands..."
node dist/scripts/setup.js

echo ""
echo "  ✅ Done!"
echo ""
echo "  Restart Claude Code, then type:"
echo "    /user:buddy        - Show your pet"
echo "    /user:buddy card   - Full attribute card"
echo "    /user:buddy hatch  - Hatch a new pet"
echo ""
