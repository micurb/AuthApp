# Starter App (NestJS + Vue 3 + Tailwind + PostgreSQL)

## 🚀 Opis

Starter aplikacji fullstack:

- Backend: NestJS + Prisma
- Frontend: Vue 3 + Vite + Tailwind
- Baza danych: PostgreSQL (Docker)
- Całość uruchamiana jedną komendą

---

## 📦 Wymagania

Zainstaluj:

- Git
- Node.js (LTS)
- npm
- Docker Desktop

Sprawdzenie:

```bash
git --version
node -v
npm -v
docker -v
docker compose version
```

⚠️ Docker Desktop musi być uruchomiony.

---

## ⚡ Szybki start

```bash
git clone <REPO_URL>
cd StarterApp
docker compose up --build
```

---

## 🌐 Aplikacja

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:3000
```

Test endpoint:

```text
http://localhost:3000/users
```

---

## 🧪 Test API

### GET users

```text
http://localhost:3000/users
```

### POST user

```text
http://localhost:3000/users
```

Body:

```json
{
	"email": "test@test.com",
	"name": "Test"
}
```

---

## 🗄️ Baza danych

PostgreSQL działa w Dockerze.

Dostęp lokalny:

```text
localhost:5433
```

Dostęp w Dockerze:

```text
postgres:5432
```

Dane:

```text
user: postgres
password: postgres
database: starter_db
```

---

## 🔧 Konfiguracja .env (lokalnie)

Plik `.env` nie jest w repo (jest w `.gitignore`).

Aby pracować lokalnie (np. migracje Prisma):

1. Skopiuj plik:

```bash
cp backend/.env.example backend/.env
```

Na Windows:

```powershell
copy backend\.env.example backend\.env
```

2. Upewnij się, że zawiera:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/starter_db"
JWT_SECRET="dev_secret_change_me"
```

---

## 🔧 Prisma

Migracje (lokalnie):

```bash
cd backend
npx prisma migrate dev
```

Generowanie klienta:

```bash
npx prisma generate
```

---

## 🐳 Docker

Uruchomienie:

```bash
docker compose up --build
```

Zatrzymanie:

```bash
docker compose down
```

---

## 📁 Struktura projektu

```text
backend/    → NestJS + Prisma
frontend/   → Vue 3 + Tailwind
docker/     → dane PostgreSQL
```

---

## ⚠️ Ważne

Folder:

```text
docker/postgres/data
```

nie jest commitowany — dane bazy są lokalne.

---

## 🎯 Cel

Repozytorium jest starterem do kolejnych projektów:

- szybkie uruchomienie
- wspólna konfiguracja
- brak logiki biznesowej
