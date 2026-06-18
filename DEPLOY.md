# Publicar INICIA en la web (15 minutos)

El código ya está preparado. Solo faltan **3 pasos en el navegador**.

---

## Paso 1 — Subir el código (GitHub Desktop)

El commit ya está hecho en tu PC. Falta subirlo:

1. Abre **GitHub Desktop**
2. Repositorio: `menu-facturacion-inicia`
3. Verás **1 commit** pendiente de subir: *"Configurar despliegue monorepo en Vercel..."*
4. Pulsa **Push origin**

Repo: https://github.com/ibeascumplido/menu-facturacion-inicia

---

## Paso 2 — Copiar MongoDB desde Emergent

1. Entra en https://app.emergent.sh
2. Abre tu proyecto **menu-facturacion-inicia**
3. Ve a **Settings** / **Environment Variables** / **Secrets**
4. Copia estos valores:
   - `MONGO_URL` (o `MONGODB_URI`)
   - `DB_NAME` (si existe; si no, usa `menu_facturacion_inicia`)

Guárdalos en un bloc de notas. Los necesitas en el paso 3.

---

## Paso 3 — Desplegar en Vercel

1. Abre: **https://vercel.com/new/import?s=https://github.com/ibeascumplido/menu-facturacion-inicia**
2. Inicia sesión con GitHub si te lo pide
3. Importa el repositorio
4. **Configuración importante:**

| Campo | Valor |
|-------|--------|
| Root Directory | `.` (raíz, **no** `frontend`) |
| Framework | Other (Vercel usará `vercel.json`) |

5. **Environment Variables** — añade:

```
MONGO_URL = (pega la URI de Emergent)
DB_NAME = menu_facturacion_inicia
```

**No añadas** `REACT_APP_BACKEND_URL`.

6. Pulsa **Deploy** y espera 3–5 minutos

---

## Paso 4 — Probar la app

Sustituye `TU-URL` por la que te dé Vercel:

| Prueba | URL |
|--------|-----|
| API | `https://TU-URL.vercel.app/api/` |
| Login | `https://TU-URL.vercel.app/login` |

La API debe responder: `{"message":"Dashboard API"}`

---

## Paso 5 — Usuario administrador

Si ya tenías usuarios en Emergent (misma base MongoDB), entra con los mismos datos.

Si la base está vacía, en tu PC (con Python):

```powershell
cd "c:\Users\ibeas\Documents\GitHub\menu-facturacion-inicia"
# Crea .env en la raíz con MONGO_URL y DB_NAME
python scripts\seed_admin.py
```

Credenciales por defecto:
- Email: `admin@inicia.com`
- Contraseña: `admin123`

**Cámbiala** después del primer acceso.

---

## Paso 6 — Google OAuth (opcional)

En Emergent Auth, registra:

```
https://TU-URL.vercel.app/auth/callback
```

El login con email/contraseña funciona sin esto.

---

## Alternativa rápida: Emergent

Si solo quieres usar Emergent sin Vercel:

1. https://app.emergent.sh → tu proyecto
2. **Restart** / reactivar la app
3. URL: https://menu-facturacion-inicia.preview.emergentagent.com

(Esa URL se apaga sola tras inactividad.)

---

## Si algo falla

| Síntoma | Solución |
|---------|----------|
| `/api/` da error 500 | Revisa `MONGO_URL` en Vercel → Settings → Environment Variables → Redeploy |
| Login no funciona | Ejecuta `scripts/seed_admin.py` o aprueba usuario en MongoDB |
| Página en blanco | Comprueba que Root Directory sea la raíz del repo |
| Build falla en npm | En Vercel → Settings → General → Node.js Version → 20.x |

Cuando tengas la URL de Vercel, pégala aquí y revisamos que todo funcione.
