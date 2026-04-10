# Claude Code Buddy Pet - Installer (Windows PowerShell)
Write-Host "🐾 Installing Claude Code Buddy Pet..." -ForegroundColor Cyan

$BUDDY_DIR = "$env:USERPROFILE\.claude\buddy-src"

# Clone or update
if (Test-Path $BUDDY_DIR) {
    Write-Host "  Updating existing installation..."
    Set-Location $BUDDY_DIR
    git pull
} else {
    Write-Host "  Downloading..."
    git clone https://github.com/HUNSETO1413/buddy.git $BUDDY_DIR
    Set-Location $BUDDY_DIR
}

# Install dependencies (including devDependencies for build)
Write-Host "  Installing dependencies..."
npm install

# Build TypeScript
Write-Host "  Building..."
npx tsc

# Register hooks
Write-Host "  Registering hooks..."
node dist/scripts/setup.js

Write-Host ""
Write-Host "✅ Buddy Pet installed! Launch Claude Code and type /buddy to hatch your pet!" -ForegroundColor Green
