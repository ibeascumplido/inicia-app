# Publicar INICIA (método fácil)

## Opción recomendada: script automático

1. Abre **PowerShell** en la carpeta del proyecto
2. Ejecuta:

```powershell
cd "c:\Users\ibeas\Documents\GitHub\menu-facturacion-inicia"
.\scripts\publicar.ps1
```

3. Pega tu **MONGO_URL** de Atlas cuando te lo pida
4. Se abrirá **Vercel** en el navegador — solo añade las mismas variables y pulsa **Deploy**

---

## Si PowerShell no deja ejecutar scripts

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\scripts\publicar.ps1
```

---

## Configuración en Vercel (importante)

| Campo | Valor |
|-------|--------|
| Root Directory | **vacío** (raíz, NO `frontend`) |
| Branch | `Ultimo` |
| `MONGO_URL` | Tu URI de Atlas |
| `DB_NAME` | `menu_facturacion_inicia` |

**No** añadas `REACT_APP_BACKEND_URL`.

---

## En MongoDB Atlas (antes de desplegar)

1. **Network Access** → `0.0.0.0/0` (Allow from anywhere)
2. URI con contraseña real (sin `<password>`)

---

## Probar

- API: `https://TU-URL.vercel.app/api/`
- Login: `https://TU-URL.vercel.app/login`
- Usuario: `admin@inicia.com` / `admin123`

---

## Si el build falla en Vercel

1. Project → **Settings** → **General** → Node.js Version → **20.x**
2. **Redeploy**

Si sigue fallando, copia el mensaje de error del build y pégalo en el chat.
