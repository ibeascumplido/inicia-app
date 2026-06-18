# INICIA — Menú de facturación

Dashboard para gestión de presupuestos, calendario de empleados y solicitudes de vacaciones.

## Arquitectura

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Tailwind + Shadcn/UI (CRA + Craco) |
| Backend | FastAPI + Motor (MongoDB) |
| Base de datos | MongoDB Atlas |
| Auth | Email/contraseña + Google OAuth (Emergent Auth) |
| Email | Resend (opcional) |

## Despliegue 100% en Vercel (monorepo)

Frontend y backend se despliegan en **un solo proyecto Vercel**:

- `https://tu-app.vercel.app/` → React
- `https://tu-app.vercel.app/api/...` → FastAPI

### Estructura de despliegue

```
vercel.json          Build CRA + función Python
api/index.py         Entrypoint FastAPI para Vercel
requirements.txt     Dependencias Python (raíz)
frontend/            React SPA
backend/server.py    API FastAPI
```

### Paso 1 — MongoDB Atlas

1. Crea un cluster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Usuario/contraseña y acceso de red: `0.0.0.0/0`.
3. Copia la URI → variable `MONGO_URL`.
4. Define `DB_NAME` (p. ej. `menu_facturacion_inicia`).

### Paso 2 — Proyecto en Vercel

1. Importa el repo en [Vercel](https://vercel.com).
2. **Root Directory:** raíz del repo (no `frontend`).
3. Vercel detectará `vercel.json` y construirá ambos:
   - Frontend estático desde `frontend/`
   - API Python desde `api/index.py`
4. **No hace falta** `REACT_APP_BACKEND_URL` en Vercel (mismo dominio → `/api`).

### Paso 3 — Variables de entorno en Vercel

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `MONGO_URL` | Sí | URI de MongoDB Atlas |
| `DB_NAME` | Sí | Nombre de la base de datos |
| `CORS_ORIGINS` | No | Vercel auto-detecta `VERCEL_URL` si no se define |
| `RESEND_API_KEY` | No | Emails de notificación |
| `SENDER_EMAIL` | No | Remitente en Resend |
| `REACT_APP_BACKEND_URL` | No | Solo si separas frontend y API en otro dominio |

### Paso 4 — Google OAuth

Tras el primer deploy, registra esta URL de callback en Emergent Auth:

```
https://tu-dominio.vercel.app/auth/callback
```

### Verificar el deploy

- Frontend: `https://tu-app.vercel.app/login`
- API: `https://tu-app.vercel.app/api/` → `{"message":"Dashboard API"}`
- Docs (si están expuestas): `https://tu-app.vercel.app/api/docs`

## Desarrollo local

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-prod.txt
# Crea backend/.env según env.example
uvicorn server:app --reload --port 8000

# Frontend (otra terminal)
cd frontend
npm install
# Crea .env con REACT_APP_BACKEND_URL=http://localhost:8000
npm start
```

## Credenciales de prueba

Ver `memory/test_credentials.md` (solo entorno de desarrollo).

## Alternativa: backend en Render

Si el plan gratuito de Vercel da cold starts lentos en la API, puedes desplegar solo el backend en Render con `render.yaml` y poner `REACT_APP_BACKEND_URL` apuntando a esa URL.
