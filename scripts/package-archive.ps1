param(
  [string]$OutFile = "../multilang-courses-site.zip"
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..").Path
$items = Get-ChildItem -Path $root -Recurse -File -Force | Where-Object {
  $_.FullName -notmatch "\\node_modules\\" -and
  $_.FullName -notmatch "\\.next\\" -and
  $_.FullName -notmatch "\\.git\\" -and
  $_.Name -notmatch "^\.DS_Store$" -and
  $_.Extension -ne ".zip"
} | ForEach-Object { $_.FullName }
Write-Host "Creating archive $OutFile from $root ..." -ForegroundColor Cyan
if (Test-Path $OutFile) { Remove-Item -Force $OutFile }
Compress-Archive -Path $items -DestinationPath $OutFile -CompressionLevel Optimal -Force
Write-Host "Archive created at $OutFile" -ForegroundColor Green
