param(
  [int]$Port = 3006,
  [string]$Locale = 'en',
  [string]$Slug = 'javascript-101'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Move to project root
Set-Location "$PSScriptRoot\.."

# Start server (assumes latest build)
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start -- -p $Port" -WorkingDirectory (Get-Location) -PassThru -NoNewWindow
Start-Sleep -Seconds 2

# Verify JSON-LD presence
$uri = "http://localhost:$Port/$Locale/courses/$Slug"
try {
  $resp = Invoke-WebRequest -Uri $uri -UseBasicParsing
  if ($resp.Content -match 'application/ld\+json') {
    Write-Host "JSONLD_PRESENT at $uri"
  } else {
    Write-Host "JSONLD_MISSING at $uri"
  }
} catch {
  Write-Host ("REQUEST_FAILED at {0}: {1}" -f $uri, $_.Exception.Message)
}

# Cleanup
try { Stop-Process -Id $proc.Id -Force } catch {}
