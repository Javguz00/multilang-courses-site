param(
  [int]$HostPort = 5433,
  [string]$ContainerName = "courses-pg",
  [string]$DbUser = "postgres",
  [string]$DbPass = "postgres",
  [string]$DbName = "postgres"
)

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."  # project root

function Wait-ForPort {
  param([int]$Port, [int]$TimeoutSec = 60)
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try {
      $ok = (Test-NetConnection -ComputerName '127.0.0.1' -Port $Port -InformationLevel Quiet)
      if ($ok) { return $true }
    } catch {}
    Start-Sleep -Seconds 1
  }
  return $false
}

Write-Host "Ensuring Docker network 'appnet' exists..." -ForegroundColor Cyan
try { docker network create appnet | Out-Null } catch {}

Write-Host "Starting Postgres container '$ContainerName' on port $HostPort..." -ForegroundColor Cyan
try { docker rm -f $ContainerName | Out-Null } catch {}
docker run -d --name $ContainerName --network appnet -p $HostPort`:5432 `
  -e POSTGRES_USER=$DbUser -e POSTGRES_PASSWORD=$DbPass -e POSTGRES_DB=$DbName postgres:16

if (-not (Wait-ForPort -Port $HostPort -TimeoutSec 90)) {
  throw "Postgres did not become ready on port $HostPort in time."
}

$env:DATABASE_URL = "postgresql://$DbUser`:$DbPass@127.0.0.1:$HostPort/$DbName?schema=public&sslmode=disable"
Write-Host "DATABASE_URL set to $($env:DATABASE_URL)" -ForegroundColor DarkGray

Write-Host "Installing deps (if needed) and running Prisma migrate + generate ..." -ForegroundColor Cyan
npm run prisma:generate | Out-Null
npx prisma migrate dev --name init

Write-Host "Seeding database ..." -ForegroundColor Cyan
npm run db:seed

Write-Host "Database is up and seeded." -ForegroundColor Green
