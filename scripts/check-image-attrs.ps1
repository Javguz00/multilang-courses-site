param(
  [int]$Port = 3004,
  [string]$Locale = 'en',
  [string]$Path = 'courses'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$uri = "http://localhost:$Port/$Locale/$Path"
try {
  $resp = Invoke-WebRequest -Uri $uri -UseBasicParsing
  $content = $resp.Content
  $lazy = [regex]::IsMatch($content, 'loading=\"?lazy\"?')
  $async = [regex]::IsMatch($content, 'decoding=\"?async\"?')
  if ($lazy -and $async) {
    Write-Host ("IMAGE_ATTRS_OK at {0}" -f $uri)
  } else {
    Write-Host ("IMAGE_ATTRS_MISSING at {0} (lazy={1}, async={2})" -f $uri, $lazy, $async)
  }
} catch {
  Write-Host ("REQUEST_FAILED at {0}: {1}" -f $uri, $_.Exception.Message)
}
