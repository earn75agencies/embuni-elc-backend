# PowerShell Helper Script to safely open documentation files
# Usage: .\open-doc.ps1 NEXT_STEPS.md
# or: .\open-doc.ps1 IMPLEMENTATION_SUMMARY.md

param(
    [string]$DocFile = "NEXT_STEPS.md"
)

# Check if document exists in project root
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$docPath = Join-Path -Path $projectRoot -ChildPath $DocFile

if (-not (Test-Path $docPath)) {
    Write-Host "❌ Documentation file not found: $DocFile" -ForegroundColor Red
    Write-Host "Available files:" -ForegroundColor Yellow
    Get-ChildItem -Path $projectRoot -Name "*.md" | ForEach-Object { Write-Host "  • $_" }
    exit 1
}

Write-Host "📖 Opening $DocFile..." -ForegroundColor Green
Write-Host "Location: $docPath" -ForegroundColor Cyan

# Open with default markdown viewer (Notepad++ if available, otherwise Notepad)
if (Get-Command notepad++ -ErrorAction SilentlyContinue) {
    notepad++ $docPath
} else {
    notepad $docPath
}

Write-Host "✅ Documentation opened in editor" -ForegroundColor Green
