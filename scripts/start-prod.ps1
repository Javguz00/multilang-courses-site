param(
  [int]$Port = 3000,
  [string]$SiteUrl
)

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."  # project root

# Optionally set NEXT_PUBLIC_SITE_URL to match the chosen port
if ($SiteUrl) {
  $env:NEXT_PUBLIC_SITE_URL = $SiteUrl
} elseif (-not [string]::IsNullOrEmpty($env:NEXT_PUBLIC_SITE_URL)) {
  # keep existing
} else {
  $env:NEXT_PUBLIC_SITE_URL = "http://localhost:$Port"
}

Write-Host "Starting Next.js production server on port $Port ..." -ForegroundColor Cyan

# Use cmd to ensure npm forwards flags correctly on Windows
cmd /c "npm run start -- -p $Port"
