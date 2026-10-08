# Integración Back ↔ Front — Cashbox

# Objetivo

Documentar el contrato de integración entre Backend y Frontend para la gestión de cajas.

El módulo permite consultar, abrir, cerrar y obtener el saldo calculado de una caja dentro del contexto de la sociedad activa.

---

# Módulo

CashboxModule

---

# Base URL

Todos los endpoints utilizan el prefijo global:

```text
/api/v1
```

Ejemplo:

```text
http://localhost:3001/api/v1
```

---

# Endpoints Disponibles

## Obtener Cajas

### GET /cashbox

Permisos:

* ADMIN
* MANAGER
* SUPER_ADMIN

Descripción:

Obtiene las cajas registradas dentro de la sociedad activa.

El `societyId` se obtiene del usuario autenticado y no debe enviarse desde el Frontend.

---

## Obtener Caja Abierta

### GET /cashbox/open

Permisos:

* ADMIN
* MANAGER
* SUPER_ADMIN

Descripción:

Obtiene la caja actualmente abierta para la sociedad activa.

Si no existe una caja abierta, Backend devuelve el resultado correspondiente.

---

## Obtener Caja

### GET /cashbox/:id

Permisos:

* Usuario autenticado con acceso al módulo.

Descripción:

Obtiene el detalle de una caja específica.

El parámetro `id` corresponde al UUID de la caja.

---

## Obtener Saldo

### GET /cashbox/:id/balance

Permisos:

* ADMIN
* MANAGER
* SUPER_ADMIN

Descripción:

Obtiene el saldo calculado por Backend para una caja.

El Frontend no debe calcular el saldo financiero por cuenta propia.

---

## Abrir Caja

### POST /cashbox

Permisos:

* ADMIN
* MANAGER
* SUPER_ADMIN

Body:

```json
{
  "openingBalance": 20000,
  "notes": "Saldo inicial"
}
```

Campos:

| Campo          | Tipo   | Obligatorio |
| -------------- | ------ | ----------- |
| openingBalance | number | Sí          |
| notes          | string | No          |

Descripción:

Permite abrir una caja para la sociedad activa.

Backend obtiene la sociedad y el usuario responsable desde el contexto autenticado.

---

## Cerrar Caja

### PATCH /cashbox/:id/close

Permisos:

* ADMIN
* MANAGER
* SUPER_ADMIN

Body:

```json
{
  "closingBalance": 85000,
  "notes": "Cierre diario"
}
```

Campos:

| Campo          | Tipo   | Obligatorio |
| -------------- | ------ | ----------- |
| closingBalance | number | Sí          |
| notes          | string | No          |

Descripción:

Cierra la caja correspondiente al período operativo.

La operación no elimina movimientos ni reinicia el saldo.

---

# Flujo Frontend

El flujo esperado para la integración es:

```text
Frontend
   ↓
GET /cashbox/open
   ↓
Caja abierta
   ↓
GET /cashbox/:id/balance
   ↓
Mostrar saldo calculado
   ↓
Operación diaria
   ↓
PATCH /cashbox/:id/close
   ↓
Caja cerrada
```

---

# Apertura de Caja

El Frontend deberá solicitar:

* saldo inicial;
* observaciones opcionales.

No deberá solicitar `societyId`.

Backend determina automáticamente la sociedad correspondiente.

---

# Cierre de Caja

El Frontend deberá permitir ingresar:

* saldo declarado;
* observaciones opcionales.

El saldo calculado deberá obtenerse desde Backend mediante:

```text
GET /cashbox/:id/balance
```

El Frontend no deberá modificar ni recalcular ese valor.

---

# Continuidad de Saldo

Cerrar una caja no significa dejar el saldo en cero.

Ejemplo:

```text
Día 1
Saldo final: $60.000

Día 2
Saldo inicial: $60.000
```

La continuidad del saldo no requiere una operación de transferencia desde Frontend.

---

# Integración con Cash Movements

La caja utiliza los movimientos registrados mediante:

```text
/cash-movements
```

Los movimientos son los que permiten calcular el saldo financiero.

El Frontend deberá consumir el saldo calculado por Backend en lugar de reproducir la lógica financiera.

---

# Integración con Rendiciones

El sistema posee un flujo de:

```text
Cierre del cobrador
        ↓
Settlement
        ↓
Validación administrativa
        ↓
Impacto financiero
```

La integración automática entre una liquidación validada y Cashbox todavía no está implementada.

Por lo tanto, el Frontend no deberá asumir actualmente que validar una liquidación modifica automáticamente el saldo de caja.

---

# Manejo de Errores

El Frontend deberá contemplar como mínimo:

| Código | Situación                                   |
| ------ | ------------------------------------------- |
| 400    | Datos inválidos                             |
| 401    | Usuario no autenticado                      |
| 403    | Usuario sin permisos                        |
| 404    | Caja inexistente                            |
| 409    | Operación incompatible con el estado actual |

---

# Estado Frontend

Actualmente no existe una integración específica de Cashbox en:

```text
canarias-frontend/src/services/
```

No se identificó un:

* `cashbox.service.ts`
* hook de Cashbox;
* tipo específico de Cashbox;
* página específica de Cashbox.

Por lo tanto, esta documentación representa el contrato que deberá utilizarse al implementar el Frontend.

---

# Estado Backend

Backend ya dispone de:

* apertura de caja;
* cierre de caja;
* listado;
* caja abierta;
* detalle;
* cálculo de saldo.

---

# Evolución Prevista

La integración deberá evolucionar para soportar el modelo de cuentas financieras definido en Business Rules.

Se deberá mantener la compatibilidad con las rutas existentes siempre que sea posible.

La evolución contempla:

* cuentas financieras configurables;
* transferencias con origen y destino;
* Fondo de Gestión;
* permisos específicos de visibilidad;
* integración automática entre Settlement y movimiento financiero.

---

# Estado

Documento actualizado Sprint 05.
