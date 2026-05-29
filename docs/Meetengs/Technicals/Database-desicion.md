# Database Decisions

# ORM

TypeORM.

---

# Estrategia IDs

UUIDs futuros.
Actualmente bigint incremental.

---

# Auditoría

Todas las entidades críticas deberán contener:

- createdAt
- updatedAt
- deletedAt

---

# Soft Delete

Utilizar soft delete en entidades críticas.

---

# Índices

Priorizar índices en:

- cobranzas
- cuotas
- ventas
- relaciones frecuentes