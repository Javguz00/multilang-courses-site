param(
  [string]$DatabaseUrl = "postgresql://postgres@courses-pg:5432/postgres?schema=public&sslmode=disable"
)
$ErrorActionPreference = "Stop"

# Ensure network and attach DB container
try { docker network create appnet | Out-Null } catch {}
try { docker network connect appnet courses-pg | Out-Null } catch {}

# Mount current project into a Node container and run Prisma migrate + generate
$pwdPath = (Get-Location).Path
$volume = '"' + $pwdPath + '"' + ':/app'
$cmd = "npm ci --omit=optional --ignore-scripts && npx prisma migrate dev --name init && npx prisma generate"
docker run --rm --network appnet -e DATABASE_URL="$DatabaseUrl" -v $volume -w /app node:20-bullseye bash -lc $cmd
