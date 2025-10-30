param(
  [int]$Port = 3016,
  [string]$Locale = 'en',
  [string]$Path = 'courses'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Move to project root
Set-Location "$PSScriptRoot\.."

# Start server (assumes latest build)
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start -- -p $Port" -WorkingDirectory (Get-Location) -PassThru -NoNewWindow
Start-Sleep -Seconds 2

# Verify image attributes
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

# Cleanup
try { Stop-Process -Id $proc.Id -Force } catch {}
