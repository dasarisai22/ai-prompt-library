# AI Prompt Library

A full-stack web application to manage AI Image Generation Prompts, built as part of the Emplay Front-end Developer Intern assignment.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 14+ |
| Backend | Python / Django |
| Database | PostgreSQL |
| Cache | Redis (view counter) |
| Auth | Django Session-based |
| Container | Docker + Docker Compose |

## ✨ Features

### Core
- 📋 **List Prompts** — Browse all AI image prompts
- ➕ **Add Prompt** — Create new prompts with title, content, complexity
- 🔍 **Detail View** — Full prompt view with Redis-powered live view counter
- ✏️ **Edit Prompt** — Update your own prompts
- 🗑️ **Delete Prompt** — Remove your own prompts with inline confirmation

### Bonus A — Authentication
- 🔐 Session-based login/logout using Django's built-in auth
- 📝 Signup with validation (min length, password match, strength meter)
- 🛡️ Route protection — all pages require login
- 👤 Author-based ownership (edit/delete only your own prompts)

### Bonus B — Tagging System
- 🏷️ Many-to-Many Tag model
- Filter API: `GET /prompts/?tag=sci-fi`
- Tag pills displayed on cards and detail page
- Clickable filter buttons on Browse page

## 🐳 Run Locally with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Start the app
```bash
git clone <your-repo-url>
cd ai-prompt-library
docker-compose up --build
```

Then open **http://localhost:4200** in your browser.

That's it! Docker handles PostgreSQL, Redis, Django, and Angular automatically.

## 📁 Project Structure

```
ai-prompt-library/
├── backend/                  # Django backend
│   ├── prompts/              # Main app
│   │   ├── models.py         # Prompt, Tag models
│   │   ├── views.py          # API views (auth + CRUD)
│   │   └── urls.py           # URL routing
│   ├── ai_prompt_library/    # Django settings
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Angular frontend
│   ├── src/app/
│   │   ├── components/       # UI components
│   │   ├── services/         # HTTP + Auth services
│   │   └── models/           # TypeScript interfaces
│   ├── proxy.conf.json       # Dev proxy config
│   └── Dockerfile
└── docker-compose.yml        # Orchestration
```

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/prompts/` | ✅ | List all prompts (supports `?tag=name`) |
| POST | `/prompts/` | ✅ | Create a prompt |
| GET | `/prompts/:id/` | ✅ | Get prompt + increment Redis view count |
| PUT | `/prompts/:id/` | ✅ (author) | Update a prompt |
| DELETE | `/prompts/:id/` | ✅ (author) | Delete a prompt |
| POST | `/auth/signup/` | ❌ | Register a new user |
| POST | `/auth/login/` | ❌ | Login |
| POST | `/auth/logout/` | ✅ | Logout |
| GET | `/auth/status/` | ❌ | Check session status |
