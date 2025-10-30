param(
  [int]$Port = 3005,
  [string]$MatomoUrl = "https://matomo.example.com/",
  [string]$MatomoSiteId = "1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Move to project root
Set-Location "$PSScriptRoot\.."

# Set build-time public envs
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:$Port"
$env:NEXT_PUBLIC_ANALYTICS = "matomo"
$env:NEXT_PUBLIC_MATOMO_URL = $MatomoUrl
$env:NEXT_PUBLIC_MATOMO_SITE_ID = $MatomoSiteId

# Build
npm run build | Write-Host

# Start server
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start -- -p $Port" -WorkingDirectory (Get-Location) -PassThru -NoNewWindow
Start-Sleep -Seconds 2

# Verify
$response = Invoke-WebRequest -Uri "http://localhost:$Port/en" -UseBasicParsing
$hasMatomo = ($response.Content -match 'matomo' -or $response.Content -match 'matomo.js' -or $response.Content -match 'matomo.php')
$hasGA = ($response.Content -match 'googletagmanager')
if ($hasMatomo -and -not $hasGA) {
  Write-Host "MATOMO_PRESENT on port $Port"
} elseif ($hasGA) {
  Write-Host "GA_PRESENT (unexpected) on port $Port"
} else {
  Write-Host "NO_ANALYTICS (unexpected) on port $Port"
}

# Cleanup
try { Stop-Process -Id $proc.Id -Force } catch {}
