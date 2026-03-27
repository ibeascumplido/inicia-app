# PRD - INICIA Dashboard

## Original Problem Statement
Web dashboard for INICIA company handling budgets and employee calendar. Features include a spreadsheet-like budget creation tool with PDF exports, role-based employee calendar, user authentication (Email/Password + Google Auth), distinct calendar views (monthly/yearly), role restrictions, vacation approval workflow, and notifications.

## Core Requirements
1. **Budget Generator** - Spreadsheet-like tool with calculations, PDF export with INICIA branding
2. **Authentication** - JWT-based Email/Password + Google Auth (Emergent managed)
3. **Calendar Views** - Monthly and yearly views, personal (user) and global (admin)
4. **Role System** - Admin sees all, User sees own calendar only
5. **Vacation Approval Workflow** - Request -> Pending -> Approve/Reject by admin
6. **Notifications** - In-app bell notifications + Email via Resend (when API key provided)

## User Personas
- **Admin (admin@inicia.com)**: Manages users, approves/rejects vacation requests, views all calendars, manages budgets
- **Employee (user)**: Views personal calendar, requests vacations/leave days, receives notifications

## Tech Stack
- Backend: FastAPI + Motor (MongoDB Async) + JWT Auth
- Frontend: React + TailwindCSS + Shadcn/UI + Axios
- DB: MongoDB
- Email: Resend (DEMO MODE - requires valid API key)

## What's Implemented (as of Dec 2025)
- [x] Budget UI with INICIA logo, light red headers, PDF export
- [x] JWT authentication (Email/Password)
- [x] Google Auth button and flow (Emergent managed)
- [x] Admin and User roles with protected routes
- [x] Personal calendar (MyCalendarPage) with monthly/yearly views
- [x] Admin calendar (AdminCalendarPage) with all employees
- [x] Vacation request workflow (Pending -> Approve/Reject)
- [x] Pending requests blink yellow in admin calendar
- [x] In-app notification system (bell icon with unread count)
- [x] Notification popover with mark as read, delete, mark all as read
- [x] Email notification templates (demo mode - needs real Resend key)
- [x] User management (AdminUsersPage)
- [x] Register ObjectId serialization bug fixed

## Pending / Backlog
- [ ] P1: Refactor server.py (>1400 lines) into modular routers
- [ ] P1: Get real Resend API key for email notifications
- [ ] P1: Verify Google Auth end-to-end (needs Google Client ID)
- [ ] P2: Password reset / forgot password flow
- [ ] P2: UI/UX improvements

## Key API Endpoints
- POST /api/auth/login, /api/auth/register, /api/auth/logout
- GET /api/auth/me
- POST /api/auth/session (Google OAuth)
- GET /api/notifications, /api/notifications/count
- POST /api/notifications/{id}/read, /api/notifications/read-all
- DELETE /api/notifications/{id}
- GET /api/my-vacaciones, POST /api/my-vacaciones
- GET /api/admin/vacaciones, /api/admin/vacaciones/pending
- POST /api/admin/vacaciones/{id}/approve, /api/admin/vacaciones/{id}/reject

## DB Collections
- users, user_sessions, vacaciones, notifications, budgets, budget_templates, events, operarios
