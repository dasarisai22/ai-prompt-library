# ── Backend Dockerfile ─────────────────────────────────────────────────────────
# Python 3.11 slim image for a small production-ready container
FROM python:3.11-slim

# Set workdir inside container
WORKDIR /app

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code
COPY . .

# Copy and make the entrypoint script executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the Django dev server port
EXPOSE 8000

# Run using the entrypoint script (handles migrations + server start)
ENTRYPOINT ["/entrypoint.sh"]
