# Canarias System — Database Seeders

# Objetivo

Definir la estrategia oficial de carga inicial de datos del sistema.

Los seeders permiten:

* inicializar ambientes
* facilitar desarrollo
* automatizar testing
* acelerar onboarding
* generar demos funcionales

---

# Tecnología

Los seeders serán implementados mediante:

```text
TypeORM Seeders
```

---

# Objetivos

Los seeders deberán:

* ser idempotentes
* ejecutarse múltiples veces sin errores
* evitar duplicación
* facilitar setup rápido

---

# Datos Iniciales Obligatorios

---

# SOCIETIES

## Seed Inicial

Crear sociedades operativas iniciales:

* Canarias 1
* Canarias 2
* Canarias Motos
* Canarias S.R.L.

---

# ROLES

## Roles Iniciales

* SUPER_ADMIN
* ADMIN
* MANAGER
* COLLECTOR
* SELLER

---

# SUPER_ADMIN inicial

## Usuario super admin de prueba

En el primer sprint se carga de forma temporal un `SUPER_ADMIN` mediante un seeder para pruebas de funcionalidad global.

* Su uso es válido en ambientes de desarrollo y testing.
* En producción, este usuario debe generarse mediante un flujo seguro o migración controlada.

---

# STAFF ADMINISTRADOR

## Usuario administrador inicial

Crear:

```text
admin@canarias.local
```

con rol:

```text
ADMIN
```

---

# ZONES

## Seed Inicial

Ejemplos:

* Rosario Centro
* Rosario Norte
* Rosario Sur
* Villa Gobernador Gálvez
* Pueblo Esther

---

# FINANCING CONFIGURATIONS

## Configuración Global Inicial

Ejemplo:

| Campo                 | Valor |
| --------------------- | ----- |
| installments_count    | 20    |
| interest_rate         | 35    |
| seller_commission_pct | 10    |
| is_default            | true  |

---

# PRODUCTS

## Productos Demo

Crear productos iniciales para:

* testing
* demos
* QA

---

# SUPPLIERS

## Seed Inicial

Proveedores demo iniciales.

---

# CONFIGURACIONES SISTEMA

## User Configurations

Configuraciones default:

* theme
* language
* notifications

---

# Ambientes

## Development

Datos completos para desarrollo.

---

## Testing

Datos mínimos controlados.

---

## Production

Solo:

* configuraciones iniciales
* sociedades
* administrador inicial

Nunca insertar:

* clientes reales
* ventas reales
* cobranzas reales

---

# Estrategia Recomendada

## Separar seeders por dominio

```text
seeders/
├── core/
├── sales/
├── collections/
├── stock/
├── financial/
└── notifications/
```

---

# Naming Convention

```text
001-societies.seeder.ts
002-admin-user.seeder.ts
003-zones.seeder.ts
```

---

# Buenas Prácticas

## Passwords

Todos los passwords deberán almacenarse hasheados.

---

## Datos Sensibles

Nunca hardcodear:

* tokens
* secretos
* credenciales reales

---

## Idempotencia

Los seeders deberán validar existencia previa antes de insertar.

---

# Objetivo Arquitectónico

Permitir inicialización rápida y consistente de ambientes.

---

# Estado Actual

Estrategia inicial de seeders aprobada para desarrollo.
