# Canarias System — Environments

# Objetivo

Definir los ambientes operativos del sistema.

---

# Ambientes Definidos

| Ambiente       | Objetivo       |
| -------------- | -------------- |
| local          | desarrollo     |
| staging futuro | validación     |
| production     | operación real |

---

# Local Environment

## Objetivo

Desarrollo diario equipo.

---

# Características

* docker compose
* hot reload
* datos testing
* debugging habilitado

---

# Variables

```text id="env101"
NODE_ENV=development
```

---

# Staging Environment

## Objetivo

Validación previa producción.

---

# Características

* réplica parcial producción
* testing acceptance
* validación deploys

---

# Variables

```text id="env102"
NODE_ENV=staging
```

---

# Production Environment

## Objetivo

Operación real Canarias.

---

# Características

* optimizado
* seguro
* monitoreado
* backups activos

---

# Variables

```text id="env103"
NODE_ENV=production
```

---

# Variables Críticas

| Variable         | Descripción |
| ---------------- | ----------- |
| DATABASE_URL     | conexión DB |
| JWT_SECRET       | auth        |
| REDIS_URL futuro | cache       |
| FRONTEND_URL     | CORS        |

---

# Reglas Ambientes

---

# Nunca compartir

* secrets
* passwords
* production keys

---

# Nunca usar

* datos producción local
* credenciales hardcodeadas

---

# Configuración

Cada ambiente deberá poseer:

```text id="env104"
.env
.env.local
.env.production
```

---

# Seguridad

Producción deberá incluir:

* HTTPS
* CORS restringido
* rate limiting
* secure cookies futuro

---

# Escalabilidad Futura

Preparado para:

* cloud providers
* kubernetes
* multi-region
* horizontal scaling

---

# Estado Actual

Environments definidos para Fase 1.
