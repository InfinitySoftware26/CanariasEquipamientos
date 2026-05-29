# Sales Module

# Objetivo

Permitir registrar ventas financiadas dentro del sistema.

El módulo deberá:

* registrar ventas
* asociar cliente
* asociar producto
* generar cuotas automáticamente
* aplicar financiación
* validar reglas comerciales
* generar estado inicial de cobranza
* generar futura entrega

---

# Contexto de Negocio

El sistema Canarias trabaja bajo un modelo de venta financiada.

Cada venta:

* pertenece a una sociedad
* es registrada por un vendedor
* debe ser aprobada por administración
* genera cuotas automáticamente
* posteriormente genera una entrega
* luego pasa al flujo de cobranza

---

# Entidades Involucradas

* sale
* customer
* product
* installment
* financing_configuration
* society
* staff
* delivery
* collection

---

# Flujo General

```text
Vendedor registra venta
        ↓
Administración valida
        ↓
Venta aprobada
        ↓
Generación cuotas
        ↓
Generación entrega
        ↓
Asignación hoja ruta
        ↓
Inicio cobranzas
```

---

# Reglas de Negocio

## Generación de Cuotas

Al registrar una venta:

* deberán generarse automáticamente las cuotas
* las cuotas dependerán de la financiación aplicada
* las fechas deberán calcularse automáticamente

---

## Financiación

El sistema deberá:

1. verificar si el producto posee financiación propia
2. si no posee:
   utilizar financiación global

---

## Productos con Financiación Personalizada

Un producto podrá:

* utilizar financiación global
* utilizar financiación individual

La relación:

```text
financing_configuration 1:N products
```

---

## Estados de Venta

Estados posibles:

| Estado             | Descripción              |
| ------------------ | ------------------------ |
| pending_validation | venta pendiente revisión |
| approved           | venta aprobada           |
| rejected           | venta rechazada          |
| delivered          | producto entregado       |
| cancelled          | venta cancelada          |

---

# Validaciones de Negocio

## Cliente

* debe existir
* debe estar activo
* no debe estar bloqueado

---

## Producto

* debe existir
* debe estar activo
* validar stock según sociedad

---

## Financiamiento

* cuotas > 0
* interés válido
* monto válido

---

# Endpoints

## POST /sales

Registrar venta.

---

### Request

```json
{
  "customerId": 1,
  "productId": 2,
  "sellerId": 5,
  "societyId": 1,
  "totalAmount": 500000,
  "downPayment": 50000
}
```

---

### Response

```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "id": 1,
    "status": "pending_validation"
  }
}
```

---

## GET /sales

Listado ventas.

---

## GET /sales/:id

Detalle venta.

---

## PATCH /sales/:id/approve

Aprobar venta.

---

## PATCH /sales/:id/reject

Rechazar venta.

---

# DTOs

## CreateSaleDto

```ts
export class CreateSaleDto {
  customerId: number;
  productId: number;
  sellerId: number;
  societyId: number;
  totalAmount: number;
  downPayment?: number;
}
```

---

## ApproveSaleDto

```ts
export class ApproveSaleDto {
  approvedBy: number;
  observations?: string;
}
```

---

# Responses

## Success Response

```json
{
  "success": true,
  "message": "Sale approved successfully"
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Customer inactive",
  "error": {
    "code": "CUSTOMER_INACTIVE"
  }
}
```

---

# Roles Permitidos

| Rol       | Acción      |
| --------- | ----------- |
| admin     | full access |
| seller    | create      |
| manager   | read only   |
| collector | no access   |

---

# Arquitectura del Módulo

```text
sales/
├── controllers/
├── services/
├── repositories/
├── dto/
├── entities/
├── interfaces/
├── validators/
├── mappers/
└── enums/
```

---

# Responsabilidades

## Controller

Responsable de:

* recibir requests
* validar DTOs
* devolver responses

NO debe contener lógica negocio.

---

## Service

Responsable de:

* reglas negocio
* validaciones negocio
* generación cuotas
* aprobación ventas

---

## Repository

Responsable de:

* persistencia
* queries
* acceso base datos

---

# Consideraciones Técnicas

## Transacciones

La creación de venta deberá utilizar transacciones TypeORM para garantizar:

* creación venta
* creación cuotas
* consistencia datos

---

## Performance

Optimizar queries:

* relaciones cliente
* relaciones producto
* cuotas asociadas

---

## Auditoría

Registrar:

* usuario creador
* fecha creación
* usuario aprobación
* fecha aprobación

---

# Eventos Futuros

Preparar módulo para futura integración con:

* notificaciones
* scoring clientes
* firma digital
* aplicación mobile

---

# Futuro Escalamiento

Este módulo deberá poder desacoplarse a microservicio futuro.

La lógica deberá mantenerse desacoplada del resto del sistema.

---

# Observaciones Técnicas

* utilizar repository pattern
* evitar lógica negocio en controllers
* evitar queries complejas en controllers
* utilizar enums para estados
* utilizar constantes para mensajes
* centralizar validaciones
* utilizar exception filters globales

---

# Dependencias

Este módulo depende de:

* customers module
* products module
* financing module
* auth module

---

# Testing Requerido

## Unit Testing

* generación cuotas
* validaciones negocio
* aprobación venta

---

## Integration Testing

* creación venta completa
* persistencia cuotas
* relaciones entidades

---

## Acceptance Testing

Escenario completo:

* vendedor crea venta
* admin aprueba
* sistema genera cuotas
* sistema genera entrega
