# Dashboard Web - Presupuestos y Calendario

## Descripción del Proyecto
Dashboard web con dos módulos principales: gestión de presupuestos tipo Excel y calendario de vacaciones con sistema de aprobación.

## Arquitectura
- **Backend**: FastAPI + Motor (MongoDB async)
- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Base de datos**: MongoDB
- **Autenticación**: JWT con soporte para Google OAuth

## Sistema de Autenticación

### Roles
- **Admin**: Acceso total (presupuestos, calendarios de todos, gestión de usuarios, aprobación de solicitudes)
- **Usuario**: Solo acceso a su propio calendario

### Flujo de registro
1. Usuario se registra (email/contraseña o Google OAuth)
2. Estado inicial: "Pendiente"
3. Admin aprueba/rechaza desde panel de usuarios
4. Una vez aprobado, usuario puede solicitar vacaciones

### Credenciales de prueba
- **Admin**: admin@inicia.com / admin123

## Sistema de Solicitudes de Vacaciones (NUEVO 27/03/2026)

### Flujo
1. **Usuario solicita** → Estado: "Pendiente" (amarillo)
2. **Admin revisa** → Aprueba o Rechaza con comentario opcional
3. **Resultado**:
   - Aprobado → Día en color del usuario (verde/azul)
   - Rechazado → Día en rojo con comentario visible

### Estados de solicitud
- 🟡 **Pendiente**: Esperando aprobación (parpadea en calendario admin)
- 🟢 **Aprobado**: Vacaciones confirmadas
- 🔴 **Rechazado**: Con comentario opcional del admin

## Módulos Implementados

### 1. Módulo de Autenticación ✅
- Login con email/contraseña
- Login con Google OAuth (Emergent Auth)
- Registro de usuarios (requiere aprobación)
- Gestión de sesiones (localStorage + JWT)

### 2. Módulo de Presupuestos ✅ (Solo Admin)
- Plantilla tipo Excel para crear presupuestos
- Logo INICIA y colores corporativos rojos
- Vista previa e impresión de PDF

### 3. Mi Calendario ✅ (Todos los usuarios)
- Vista mensual y vista anual
- Solicitar vacaciones (pendiente de aprobación)
- Solicitar días libres (pendiente de aprobación)
- Ver estado de solicitudes (pendiente/aprobado/rechazado)
- Resumen: Aprobados, Pendientes, Restantes

### 4. Calendario Admin ✅ (Solo Admin)
- Ver todas las solicitudes de todos los usuarios
- Filtrar por usuario
- Solicitudes pendientes PARPADEAN en amarillo
- Click en solicitud → Modal para Aprobar/Rechazar
- Comentario opcional al rechazar
- Tabla resumen con todos los empleados

### 5. Panel de Usuarios ✅ (Solo Admin)
- Aprobar/rechazar usuarios
- Configurar días de vacaciones/libres (32/6 por defecto)
- Asignar colores

## Archivos Clave
- `/app/backend/server.py` - API completa con autenticación y aprobaciones
- `/app/frontend/src/pages/MyCalendarPage.jsx` - Calendario personal con solicitudes
- `/app/frontend/src/pages/AdminCalendarPage.jsx` - Calendario admin con aprobaciones
- `/app/frontend/src/pages/AdminUsersPage.jsx` - Gestión de usuarios

## API Endpoints

### Solicitudes de vacaciones
- `POST /api/my-vacaciones` - Crear solicitud (estado: pending)
- `GET /api/my-vacaciones/resumen` - Resumen con aprobados/pendientes
- `POST /api/admin/vacaciones/{id}/approve` - Aprobar solicitud
- `POST /api/admin/vacaciones/{id}/reject` - Rechazar con comentario

## Estado Actual
✅ Sistema completo de solicitudes con aprobación
✅ Solicitudes pendientes parpadean en calendario admin
✅ Comentario opcional al rechazar

## Backlog
- P2: Refactorizar BudgetTemplatePage.jsx
- P2: Notificaciones por email al aprobar/rechazar
- P3: Exportar calendario a PDF/iCal
