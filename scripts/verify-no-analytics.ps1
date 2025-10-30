param(
  [int]$Port = 3004
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Move to project root
Set-Location "$PSScriptRoot\.."

# Clear analytics envs and set site URL
Remove-Item Env:NEXT_PUBLIC_ANALYTICS -ErrorAction SilentlyContinue
Remove-Item Env:NEXT_PUBLIC_GA_ID -ErrorAction SilentlyContinue
Remove-Item Env:NEXT_PUBLIC_MATOMO_URL -ErrorAction SilentlyContinue
Remove-Item Env:NEXT_PUBLIC_MATOMO_SITE_ID -ErrorAction SilentlyContinue
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:$Port"

# Build
npm run build | Write-Host

# Start server
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start -- -p $Port" -WorkingDirectory (Get-Location) -PassThru -NoNewWindow
Start-Sleep -Seconds 2

# Verify
$response = Invoke-WebRequest -Uri "http://localhost:$Port/en" -UseBasicParsing
$hasMatomo = ($response.Content -match 'matomo' -or $response.Content -match 'matomo.js' -or $response.Content -match 'matomo.php')
$hasGA = ($response.Content -match 'googletagmanager')
if (-not $hasMatomo -and -not $hasGA) {
  Write-Host "NO_ANALYTICS confirmed on port $Port"
} else {
  Write-Host "Analytics scripts found (unexpected) on port $Port"
}

# Fetch sitemap and robots
try {
  $sitemap = Invoke-WebRequest -Uri "http://localhost:$Port/sitemap.xml" -UseBasicParsing
  ($sitemap.Content.Substring(0, [Math]::Min(1000, $sitemap.Content.Length))) | Write-Host
  $robots = Invoke-WebRequest -Uri "http://localhost:$Port/robots.txt" -UseBasicParsing
  ($robots.Content) | Write-Host
} catch {
  Write-Host "Failed to fetch sitemap/robots: $($_.Exception.Message)"
}

# Cleanup
try { Stop-Process -Id $proc.Id -Force } catch {}
