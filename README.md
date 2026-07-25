# Canarias Equipamientos

Canarias System es la plataforma de gestión comercial y financiera desarrollada para Canarias Equipamientos. El objetivo del proyecto es centralizar la gestión de ventas financiadas, cobranzas, clientes, empleados, sociedades, stock, cajas y reportes dentro de una solución moderna, modular y segura.

Este repositorio se encuentra organizado como un monorepo e incluye:

- `backend/` — API REST construida con NestJS y TypeORM.
- `canarias-frontend/` — Aplicación web desarrollada con Next.js, React y Tailwind CSS.
- `database/` — Scripts, modelos y documentación de base de datos.
- `docs/` — Documentación técnica, funcional, arquitectura y sprints.
- `devops/` — Configuración de despliegues y entornos.

---

# ¿Qué es Canarias System?

Canarias System es una solución empresarial diseñada para digitalizar la operatoria completa de Canarias Equipamientos, permitiendo administrar de forma integrada:

- Ventas financiadas.
- Clientes.
- Empleados.
- Sociedades.
- Zonas operativas.
- Productos.
- Cuotas.
- Cobranzas.
- Hojas de ruta.
- Reportes operativos y financieros.

La arquitectura del sistema fue diseñada para acompañar el crecimiento del negocio mediante módulos independientes, reglas de negocio documentadas y una estructura preparada para futuras ampliaciones.

---

# Tecnologías utilizadas

## Backend

- Node.js
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication

## Frontend

- React
- Next.js
- TypeScript
- TailwindCSS
- Zustand
- Axios

## Infraestructura

- Docker
- Docker Compose
- pnpm

---

# Cómo levantar el Frontend

1. Instalar las dependencias desde la raíz del proyecto:

```bash
pnpm install
```

2. Iniciar la aplicación:

```bash
cd canarias-frontend
pnpm run dev
```

3. Abrir el navegador en:

```
http://localhost:3000
```

---

# Cómo levantar el Backend

Desde la raíz del proyecto:

```bash
cd backend
pnpm run start:dev
```

El backend quedará disponible en:

```
http://localhost:3001
```

Los endpoints REST se exponen bajo:

```
http://localhost:3001/api/v1
```

---

# Variables de Entorno

## Backend

Variables principales:

- NODE_ENV
- PORT
- FRONTEND_URL
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASS
- JWT_SECRET
- JWT_EXPIRATION
- JWT_REFRESH_SECRET
- JWT_REFRESH_EXPIRATION
- MAIL_HOST
- MAIL_PORT
- MAIL_USER
- MAIL_PASS

## Frontend

Variables principales:

- NEXT_PUBLIC_API_URL

> Se recomienda almacenar todas las variables mediante archivos `.env` locales o utilizando los mecanismos de configuración del proveedor de despliegue (Render, Docker, etc.).

---

# Estructura General

```text
CanariasEquipamientos/
├── backend/               # API REST NestJS
├── canarias-frontend/     # Aplicación Next.js
├── database/              # Base de datos y scripts
├── docs/                  # Documentación técnica y funcional
├── devops/                # Configuración de despliegue
├── docker-compose.yml     # Entorno local Docker
├── CHANGELOG.md           # Historial de versiones
└── workflow/              # CI/CD y pipelines
```

---

# Estado Actual del Proyecto

Actualmente el sistema dispone de funcionalidades operativas para:

## Seguridad

- Autenticación mediante JWT.
- Refresh Tokens.
- Protección de rutas.
- Control de permisos por rol.

## Organización

- Gestión de sociedades.
- Gestión de zonas.
- Gestión de empleados.
- Jerarquía de creación de usuarios según rol.
- Separación operativa por sociedad.

## Comercial

- Gestión de clientes.
- Registro de ventas.
- Validación administrativa.
- Flujo comercial por estados.
- Gestión inicial de cuotas.

## Dashboards

- Dashboard Super Administrador.
- Dashboard Gerente.
- Dashboard Administración.
- Dashboard Vendedor.
- Dashboard Cobrador.

## Arquitectura

- Backend modular.
- Frontend basado en componentes.
- Reglas de negocio documentadas.
- Arquitectura preparada para la incorporación del dominio completo de cobranzas.

---

# Documentación del Proyecto

Toda la documentación funcional y técnica se encuentra organizada dentro del directorio `docs/`.

Incluye:

- Arquitectura del sistema.
- Reglas de negocio.
- Flujo operativo.
- Documentación DevOps.
- Documentación de cada Sprint.
- Revisiones funcionales.
- Validaciones realizadas junto al cliente.
- Diagramas técnicos y documentación de soporte.

## Documentos principales

- `CHANGELOG.md` — Historial de versiones y evolución del proyecto.
- `docs/Architecture/` — Arquitectura del sistema.
- `docs/BusinessRules/` — Reglas de negocio por módulo.
- `docs/BusinessFlow/` — Flujo operativo del sistema.
- `docs/Sprints/` — Documentación completa de cada Sprint (planificación, review y validación).
- `docs/DevOps/` — Configuración de entornos y despliegues.

---

# Ejecución con Docker

Para levantar el entorno completo:

```bash
docker compose up --build
```

Este comando inicia:

- Backend.
- Frontend.
- Base de datos.
- Servicios necesarios para el desarrollo local.

---

# Próximas Etapas

El roadmap del proyecto contempla la incorporación de:

- Flujo completo de cobranzas.
- Registro de pagos.
- Hojas de ruta.
- Liquidaciones de cobradores.
- Configuración financiera avanzada.
- Reportes operativos y gerenciales.
- Exportación de información en PDF y Excel.
- Auditoría completa del sistema.

---

# Licencia

Proyecto desarrollado por **Infinity Software** para **Canarias Equipamientos**.

Todos los derechos reservados.