#!/bin/sh
# entrypoint.sh - Runs before the Django server starts inside Docker.
# Waits for PostgreSQL to be ready before running migrations.

set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
while ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  sleep 0.5
done
echo "✅ PostgreSQL is up!"

echo "🔄 Running database migrations..."
python manage.py migrate --noinput

echo "🚀 Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000
