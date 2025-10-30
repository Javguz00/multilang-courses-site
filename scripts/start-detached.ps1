param(
  [int]$Port = 3000,
  [string]$SiteUrl
)

$ErrorActionPreference = 'Stop'
$proj = Split-Path -Parent $PSScriptRoot

if ($SiteUrl) {
  $env:NEXT_PUBLIC_SITE_URL = $SiteUrl
} elseif (-not [string]::IsNullOrEmpty($env:NEXT_PUBLIC_SITE_URL)) {
  # keep existing
} else {
  $env:NEXT_PUBLIC_SITE_URL = "http://localhost:$Port"
}

$log = Join-Path $proj ".next/start-$Port.log"
$cmd = "Set-Location `"$proj`"; npm run start -- -p $Port *>> `"$log`""
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile","-Command", $cmd -WindowStyle Minimized | Out-Null
Write-Host "Started Next.js in a detached PowerShell on port $Port (SiteUrl=$env:NEXT_PUBLIC_SITE_URL), logging to $log"
