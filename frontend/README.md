# RENA (Retrieval-Enhanced Network for Analytics) — Frontend

Routes: `/` landing page, `/dashboard` BI dashboard + AI Assistant.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Geist.

## Menjalankan

```bash
# 1. PostgreSQL (Docker, host port 5433) — jalankan seperti biasa
# 2. Backend (port 8000), dari folder backend dengan venv aktif
uvicorn main:app --host 127.0.0.1 --port 8000
# 3. Frontend (port 3001; port 3000 dipakai Grafana)
npm install
npm run dev          # http://localhost:3001
```

`npm run dev` dan `npm run start` sudah memakai `-p 3001`.

## Konfigurasi

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Default (jika variabel kosong) juga `http://127.0.0.1:8000`.
Backend harus mengizinkan CORS untuk `http://localhost:3001`.

## Struktur

- `app/lib/api.ts` — klien API (`/health`, `/ask`), klasifikasi error
- `app/lib/types.ts`, `format.ts`, `use-health.ts`
- `app/components/` — sidebar, topbar, chat, response (insight, report, tabel, SQL), Data Overview, Query History

Riwayat percakapan dan Query History hanya disimpan di state browser selama sesi berjalan (tidak ada persistence).
