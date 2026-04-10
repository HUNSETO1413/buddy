# Claude Code Buddy Pet - Installer (Windows PowerShell)
Write-Host ""
Write-Host "🐾 Claude Code Buddy Pet - Installer" -ForegroundColor Cyan
Write-Host ""

$BUDDY_DIR = "$env:USERPROFILE\.claude\buddy-src"

# Clone or update
if (Test-Path $BUDDY_DIR) {
    Write-Host "  Updating existing installation..." -ForegroundColor Gray
    Set-Location $BUDDY_DIR
    git pull
} else {
    Write-Host "  Downloading from GitHub..." -ForegroundColor Gray
    git clone https://github.com/HUNSETO1413/buddy.git $BUDDY_DIR
    Set-Location $BUDDY_DIR
}

# Install dependencies and build
Write-Host "  Installing dependencies..." -ForegroundColor Gray
npm install
Write-Host "  Building..." -ForegroundColor Gray
npx tsc

# Register hooks + create slash command
Write-Host "  Registering hooks and commands..." -ForegroundColor Gray
node dist/scripts/setup.js

Write-Host ""
Write-Host "  ✅ Done!" -ForegroundColor Green
Write-Host ""
Write-Host "  Restart Claude Code, then type:" -ForegroundColor White
Write-Host "    /user:buddy        - Show your pet" -ForegroundColor Yellow
Write-Host "    /user:buddy card   - Full attribute card" -ForegroundColor Yellow
Write-Host "    /user:buddy hatch  - Hatch a new pet" -ForegroundColor Yellow
Write-Host ""
