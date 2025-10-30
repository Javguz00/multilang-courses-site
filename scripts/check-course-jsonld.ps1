param(
  [int]$Port = 3004,
  [string]$Locale = 'en',
  [string]$Slug = 'javascript-101'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$uri = "http://localhost:$Port/$Locale/courses/$Slug"
try {
  $resp = Invoke-WebRequest -Uri $uri -UseBasicParsing
  $content = $resp.Content
  if ($content -match 'application/ld\+json') {
    Write-Host "JSONLD_PRESENT at $uri"
  } else {
    Write-Host "JSONLD_MISSING at $uri (status: $($resp.StatusCode))"
  }
} catch {
  Write-Host ("REQUEST_FAILED at {0}: {1}" -f $uri, $_.Exception.Message)
}
