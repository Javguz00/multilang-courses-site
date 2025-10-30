param(
  [string]$OutFile = "../multilang-courses-site.zip"
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..").Path

# Build a list of relative file paths to preserve directory structure inside the zip
Push-Location $root
try {
  $relItems = Get-ChildItem -Path . -Recurse -File -Force | Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\\\.next\\" -and
    $_.FullName -notmatch "\\.git\\" -and
    $_.Name -notmatch "^\\.env(\\..*)?$" -and
    $_.Name -notmatch "^\\.DS_Store$" -and
    $_.Extension -ne ".zip"
  } | ForEach-Object { $_.FullName.Substring($root.Length + 1) }

  Write-Host "Creating archive $OutFile from $root ..." -ForegroundColor Cyan
  if (Test-Path $OutFile) { Remove-Item -Force $OutFile }
  if ($relItems.Count -eq 0) {
    Write-Warning "No files matched for packaging."
  } else {
    Compress-Archive -Path $relItems -DestinationPath $OutFile -CompressionLevel Optimal -Force
    Write-Host "Archive created at $OutFile" -ForegroundColor Green
  }
}
finally {
  Pop-Location
}
