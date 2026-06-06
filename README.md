# Canarias Equipamientos

Canarias System es la plataforma de gestión comercial y financiera para Canarias Equipamientos. El objetivo del proyecto es centralizar la gestión de ventas financiadas, cobranzas, stock, clientes, cajas y reportes dentro de un sistema modular y seguro.

Este repositorio es un monorepo que incluye:

- `backend/` — API REST construida con NestJS y TypeORM.
- `canarias-frontend/` — UI con Next.js, React y Tailwind.
- `database/` — estructura y scripts de base de datos.
- `docs/` — documentación técnica, de arquitectura y de sprint.
- `devops/` — archivos de soporte para despliegue y entornos.

---

## Qué es Canarias System

Canarias System es una solución empresarial para la gestión operativa de Canarias, diseñada para soportar:

- Autenticación segura con JWT.
- Control de roles y permisos.
- Gestión de sociedades múltiples.
- Dashboards de ventas, cobranzas y operaciones.
- Una arquitectura preparada para crecer en futuras etapas.

---

## Tecnologías utilizadas

- `Node.js` + `NestJS` (backend)
- `React` + `Next.js` (frontend)
- `TypeScript`
- `PostgreSQL`
- `TypeORM`
- `JWT` para autenticación
- `TailwindCSS` para estilos
- `Zustand` para estado global
- `Axios` para consumo de API
- `Docker` + `Docker Compose` para entornos locales
- `pnpm` como gestor de paquetes

---

## Cómo levantar el frontend

1. Instalar dependencias en la raíz del repositorio:

```bash
pnpm install
```

2. Iniciar el frontend:

```bash
cd canarias-frontend
pnpm run dev
```

3. Abrir el navegador en `http://localhost:3000`.

---

## Cómo levantar el backend

1. Desde la raíz del repositorio, después de instalar dependencias:

```bash
cd backend
pnpm run start:dev
```

2. El backend se inicia por defecto en `http://localhost:3001`.

3. Los endpoints de API se exponen bajo `http://localhost:3001/api/v1`.

---

## Variables de entorno

### Backend

- `NODE_ENV` — entorno de ejecución (`development`, `production`, `test`).
- `PORT` — puerto del backend (por defecto `3001`).
- `FRONTEND_URL` — URL del frontend permitido.
- `DB_HOST` — host de PostgreSQL.
- `DB_PORT` — puerto de PostgreSQL (`5432`).
- `DB_NAME` — nombre de la base de datos.
- `DB_USER` — usuario de la base de datos.
- `DB_PASS` — contraseña de la base de datos.
- `JWT_SECRET` — secreto de firma de JWT.
- `JWT_EXPIRATION` — tiempo de vida del access token.
- `JWT_REFRESH_SECRET` — secreto de firma del refresh token.
- `JWT_REFRESH_EXPIRATION` — tiempo de vida del refresh token.
- `MAIL_HOST` — servidor SMTP.
- `MAIL_PORT` — puerto SMTP.
- `MAIL_USER` — usuario SMTP.
- `MAIL_PASS` — contraseña SMTP.

### Frontend

- `NEXT_PUBLIC_API_URL` — URL base del API backend.

> Recomendación: almacenar estos valores en un archivo `.env` local en cada carpeta, sin subirlos a control de versiones.

---

## Estructura general

```text
CanariasEquipamientos/
├── backend/             # API REST NestJS
├── canarias-frontend/   # Aplicación Next.js
├── database/            # Scripts y configuración de base de datos
├── docs/                # Documentación técnica y de sprint
├── devops/              # Soporte para despliegue y entornos
├── docker-compose.yml   # Orquestación local Docker
└── workflow/            # CI/CD y pipelines
```

---

## Documentación y cierre de Sprint 1

- `CHANGELOG.md` — registro de lo construido en esta primera etapa.
- `docs/Architecture/` — arquitectura frontend, backend y base de datos.
- `docs/Sprints/Sprint-01/` — documentación de la reunión, captura de avances y revisión del sprint.
- `docs/Devops/Environments.md` — variables de entorno y configuración local.

---

## Cómo arrancar todo con Docker Compose

```bash
docker compose up --build
```

Esto arranca el backend, frontend y base de datos en un entorno local consistente.

