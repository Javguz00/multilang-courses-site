param(
  [Parameter(Mandatory=$true)][string]$Url
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try {
  $r = Invoke-WebRequest -UseBasicParsing -Uri $Url -MaximumRedirection 0 -ErrorAction Stop
  Write-Host ("STATUS: {0}" -f $r.StatusCode)
  ($r.RawContent -split "`r?`n`r?`n",2)[0] | Write-Host
  ($r.Content.Substring(0,[Math]::Min(800, $r.Content.Length))) | Write-Host
} catch {
  if ($_.Exception.Response) {
    $resp = $_.Exception.Response
    Write-Host ("STATUS: {0}" -f $resp.StatusCode)
    $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $text = $sr.ReadToEnd(); $sr.Close()
    ($text.Substring(0,[Math]::Min(800, $text.Length))) | Write-Host
  } else {
    Write-Host ("ERROR: {0}" -f $_.Exception.Message)
  }
}
