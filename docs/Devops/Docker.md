# Canarias System — Docker Strategy

# Objetivo

Definir la estrategia de contenerización del sistema utilizando Docker.

El objetivo principal es garantizar:

* entornos consistentes
* facilidad despliegue
* portabilidad
* escalabilidad futura

---

# Arquitectura Docker

El sistema utilizará:

```text id="dev101"
Docker Compose
```

durante Fase 1 y Fase 2.

---

# Servicios Iniciales

| Servicio     | Descripción       |
| ------------ | ----------------- |
| frontend     | React application |
| backend      | NestJS API        |
| database     | PostgreSQL        |
| redis futuro | Cache y queues    |

---

# Estructura Recomendada

```text id="dev102"
docker/
├── backend/
├── frontend/
├── postgres/
└── nginx/
```

---

# Docker Compose

El entorno local deberá iniciarse mediante:

```bash id="dev103"
docker compose up
```

---

# Objetivos Docker

* desarrollo homogéneo
* evitar conflictos locales
* simplificar onboarding
* preparar cloud deployment

---

# Backend Container

## Stack

* Node.js
* pnpm
* NestJS
* TypeORM

---

# Frontend Container

## Stack

* React
* Next.js
* pnpm
* Nginx futuro

---

# Database Container

## Stack

* PostgreSQL

---

# Variables Entorno

Todas las configuraciones sensibles deberán utilizar:

```text id="dev104"
.env
```

---

# Variables Obligatorias

| Variable     | Uso               |
| ------------ | ----------------- |
| DATABASE_URL | conexión postgres |
| JWT_SECRET   | autenticación     |
| PORT         | backend port      |
| FRONTEND_URL | CORS              |

---

# Persistencia Datos

PostgreSQL deberá utilizar:

```text id="dev105"
docker volumes
```

para persistencia.

---

# Networking

Todos los containers deberán comunicarse mediante:

```text id="dev106"
docker internal network
```

---

# Logs

Inicialmente:

* logs consola
* logs docker

Futuro:

* centralized logging
* ELK Stack
* Grafana

---

# Ambientes

Docker deberá soportar:

* local
* staging futuro
* production futuro

---

# Optimización Futura

Preparado para:

* multistage builds
* image optimization
* kubernetes
* autoscaling

---

# Seguridad

* no exponer secrets
* evitar root containers
* limitar puertos públicos

---

# Estado Actual

Docker strategy aprobada para Fase 1.
