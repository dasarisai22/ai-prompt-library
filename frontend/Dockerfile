# ── Frontend Dockerfile ────────────────────────────────────────────────────────
# Uses Node 18 to install Angular CLI and serve in dev mode
FROM node:18-alpine

WORKDIR /app

# Copy dependency manifests first (Docker layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm install

# Copy the rest of the Angular source
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular dev server, accessible from outside the container
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check", "--serve-path", "/"]
