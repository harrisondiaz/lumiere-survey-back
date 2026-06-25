#!/bin/sh
set -e

if echo "$DATABASE_URL" | grep -q "postgresql"; then
  echo "PostgreSQL detected — applying schema..."
  cp prisma/schema.postgresql.prisma prisma/schema.prisma
  pnpm prisma generate
  pnpm prisma db push --skip-generate
else
  echo "SQLite detected — running migrations..."
  DB_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')
  if [ -n "$DB_PATH" ]; then
    mkdir -p "$(dirname "$DB_PATH")"
  fi
  pnpm prisma migrate deploy
fi

echo "Starting server..."
exec node dist/index.js
