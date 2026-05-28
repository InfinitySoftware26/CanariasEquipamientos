# Canarias System — Database Migrations

# Objetivo

Definir la estrategia oficial de migraciones del sistema Canarias System.

Las migraciones permiten:

* versionar estructura base de datos
* mantener sincronización entre entornos
* garantizar trazabilidad cambios
* facilitar despliegues seguros
* evitar inconsistencias entre equipos

---

# Tecnología

Las migraciones serán administradas mediante:

```text
TypeORM Migrations
```

---

# Estrategia General

## Política Oficial

La estructura de base de datos deberá evolucionar exclusivamente mediante migraciones.

Queda prohibido:

* modificar tablas manualmente en producción
* alterar columnas directamente desde pgAdmin
* ejecutar SQL manual no versionado

---

# Objetivos

Las migraciones deben garantizar:

* reproducibilidad
* rollback seguro
* consistencia entre ambientes
* trazabilidad técnica

---

# Estructura de Carpetas

```text
src/database/migrations/
```

---

# Naming Convention

## Formato

```text
TIMESTAMP-description.ts
```

## Ejemplos

```text
1717000000000-create-staff-table.ts
1717000000001-create-sales-table.ts
1717000000002-add-financing-configurations.ts
```

---

# Reglas de Desarrollo

## Obligatorio

Cada modificación estructural deberá incluir:

* migration
* rollback
* revisión técnica

---

# Buenas Prácticas

## Separar cambios

Evitar migraciones gigantes.

Preferir:

* una migración por feature
* cambios pequeños y auditables

---

## Evitar datos hardcodeados

Las migraciones NO deberán insertar:

* usuarios
* configuraciones
* catálogos

Eso pertenece a:

```text
seeders
```

---

# Rollbacks

Todas las migraciones deberán implementar:

```ts
down()
```

para permitir reversión segura.

---

# Orden Recomendado Inicial

## Fase 1

### Core

1. societies
2. staff
3. zones
4. user_configurations

---

### Sales

5. clients
6. products
7. financing_configurations
8. sales
9. sale_products
10. sale_validations

---

### Collections

11. installments
12. payments
13. payment_installments
14. receipts

---

### Routes

15. route_sheets
16. route_sheet_items
17. failed_visits
18. daily_closures
19. settlements

---

### Financial

20. cashbox
21. cash_movements

---

### Stock

22. suppliers
23. supplier_societies
24. supplier_payments

---

### Notifications

25. notifications
26. notification_deliveries

---

# Estrategia por Ambiente

## Development

Migraciones frecuentes y evolutivas.

---

## Staging

Validación previa despliegue producción.

---

## Production

Migraciones controladas:

* backup obligatorio
* ventana mantenimiento
* validación rollback

---

# Política de Sincronización

## Producción

```text
synchronize = false
```

obligatorio.

---

# Configuración Recomendada

## Development

```ts
synchronize: false
migrationsRun: true
```

---

# Auditoría

Todas las migraciones deberán:

* revisarse en pull request
* aprobarse técnicamente
* documentarse si afectan negocio

---

# Objetivo Arquitectónico

Garantizar evolución segura del sistema sin pérdida de integridad.

---

# Estado Actual

Estrategia de migraciones aprobada para inicio desarrollo.
