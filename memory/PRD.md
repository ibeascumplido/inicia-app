# Dashboard Web - Presupuestos y Calendario

## Descripción del Proyecto
Dashboard web con dos módulos principales: gestión de presupuestos tipo Excel y calendario de vacaciones para operarios.

## Arquitectura
- **Backend**: FastAPI + Motor (MongoDB async)
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Base de datos**: MongoDB
- **Autenticación**: JWT con soporte para Google OAuth

## Sistema de Autenticación (NUEVO - 27/03/2026)

### Roles
- **Admin**: Acceso total (presupuestos, calendarios de todos, gestión de usuarios)
- **Usuario**: Solo acceso a su propio calendario

### Flujo de registro
1. Usuario se registra (email/contraseña o Google OAuth)
2. Estado inicial: "Pendiente"
3. Admin aprueba/rechaza desde panel de usuarios
4. Una vez aprobado, usuario puede gestionar su calendario

### Credenciales de prueba
- **Admin**: admin@inicia.com / admin123

## Módulos Implementados

### 1. Módulo de Autenticación ✅ (NUEVO)
- Login con email/contraseña
- Login con Google OAuth (Emergent Auth)
- Registro de usuarios (requiere aprobación)
- Gestión de sesiones (localStorage + JWT)
- Roles: admin y usuario

### 2. Módulo de Presupuestos ✅ (Solo Admin)
- Plantilla tipo Excel para crear presupuestos
- Cálculos automáticos: precios, márgenes, IVA
- Logo INICIA en esquina superior izquierda
- Colores corporativos rojos en encabezados
- Vista previa e impresión de PDF

### 3. Mi Calendario ✅ (Todos los usuarios)
- Vista mensual y **vista anual** (NUEVA)
- Gestionar vacaciones personales (32 días por defecto)
- Gestionar días libres personales (6 días por defecto)
- Resumen de días disponibles/disfrutados/restantes
- Selector de modo (Vacaciones/Día Libre)
- Cada usuario solo ve su propio calendario

### 4. Panel de Administración ✅ (Solo Admin)
- Gestión de usuarios (aprobar, rechazar, editar, eliminar)
- Ver todos los calendarios
- Configurar días de vacaciones/libres por usuario
- Asignar colores y abreviaturas

### 5. Dashboard Principal ✅
- Vista diferenciada para admin y usuarios
- Estadísticas de presupuestos (admin)
- Resumen de vacaciones personal
- Alertas de usuarios pendientes (admin)

## Archivos Clave
- `/app/backend/server.py` - API completa con autenticación
- `/app/frontend/src/contexts/AuthContext.jsx` - Contexto de autenticación
- `/app/frontend/src/pages/MyCalendarPage.jsx` - Calendario personal
- `/app/frontend/src/pages/AdminUsersPage.jsx` - Gestión de usuarios
- `/app/frontend/src/components/auth/` - Componentes de login

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Login email/contraseña
- `POST /api/auth/register` - Registro
- `POST /api/auth/session` - Intercambio Google OAuth
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Admin
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/users/pending` - Usuarios pendientes
- `PUT /api/admin/users/{id}` - Actualizar usuario
- `DELETE /api/admin/users/{id}` - Eliminar usuario

### Calendario personal
- `GET /api/my-vacaciones` - Mis vacaciones
- `POST /api/my-vacaciones` - Crear/toggle vacación
- `GET /api/my-vacaciones/resumen` - Mi resumen

## Estado Actual
✅ MVP Completo con autenticación
✅ Roles admin/usuario implementados
✅ Vista anual del calendario
✅ Google OAuth integrado

## Backlog / Mejoras Futuras
- P2: Refactorizar BudgetTemplatePage.jsx (>1100 líneas)
- P2: Añadir notificaciones por email al aprobar usuarios
- P3: Exportar calendario a PDF/iCal
