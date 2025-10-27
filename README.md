# Backend ClasificaAI (Gemini)

Express + Gemini (Google AI) listo para Render.

## Variables de entorno
- `PORT` (opcional, default 3000)
- `GEMINI_API_KEY` **(obligatoria)**: clave de API de Gemini
- `ORIGIN_FRONTEND`: URL de tu frontend para CORS (ej: https://tu-frontend.onrender.com)

## Endpoints
- `GET /health` → { ok: true }
- `POST /api/chat` → body JSON: `{ messages: [{role, content}], attachments?: [] }`

## Correr local
```bash
npm install
cp .env.example .env
# editá .env con tu GEMINI_API_KEY
npm start
# http://localhost:3000/health
```

## Despliegue en Render
- Web Service → Node
- Build Command: `npm install`
- Start Command: `npm start`
- Env Vars: `GEMINI_API_KEY`, `ORIGIN_FRONTEND`
