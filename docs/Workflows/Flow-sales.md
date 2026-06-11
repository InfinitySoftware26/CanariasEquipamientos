# Canarias System — Flow Sales

# Objetivo

Documentar el flujo operativo completo del proceso de venta vigente para Sprint 02.

Este documento representa el proceso comercial validado con Canarias y sirve como referencia funcional para Backend y Frontend.

---

# Roles Involucrados

| Rol       | Participación                                          |
| --------- | ------------------------------------------------------ |
| SELLER    | Registra la solicitud de venta                         |
| ADMIN     | Valida información, coordina procesos y realiza cierre |
| COLLECTOR | Realiza visitas y entregas                             |
| MANAGER   | Supervisión                                            |

---

# Entidades Involucradas

* client
* sale
* product
* zone
* sale_validation
* installment

---

# Objetivo Comercial

Registrar una operación financiada que posteriormente será gestionada mediante cobranza.

---

# Paso 1 — Registro de Solicitud de Venta

## Responsable

SELLER

## Acción

El vendedor completa un único formulario registrando:

### Datos del Cliente

* datos personales
* domicilio
* referencias
* zona
* sociedad

### Datos de la Venta

* producto solicitado
* cantidad de cuotas solicitadas
* observaciones

## Resultado

Se generan:

* client
* sale

## Estado Inicial de la Venta

PENDING_ADMIN_VALIDATION

---

# Paso 2 — Validación Administrativa

## Responsable

ADMIN

## Acción

Administración contacta telefónicamente al cliente para validar la información registrada y explicar políticas de la empresa.

Puede:

* aprobar
* rechazar
* registrar observaciones

## Resultado

Se genera:

sale_validation

## Posibles Estados

APPROVED_ADMIN

REJECTED_ADMIN

---

# Paso 3 — Programación de Visita Ambiental

## Responsable

ADMIN

## Acción

Administración coordina la visita ambiental.

## Estado

PENDING_ENVIRONMENTAL_VISIT

---

# Paso 4 — Visita Ambiental

## Responsable

COLLECTOR

## Acción

El cobrador visita el domicilio y verifica las condiciones necesarias para la operación.

Puede:

* aprobar
* rechazar
* registrar observaciones

## Posibles Estados

ENVIRONMENTAL_APPROVED

ENVIRONMENTAL_REJECTED

---

# Paso 5 — Programación de Entrega

## Responsable

ADMIN

## Acción

Administración coordina la fecha de entrega del producto.

## Estado

PENDING_DELIVERY

---

# Paso 6 — Entrega de Producto

## Responsable

COLLECTOR

## Acción

El cobrador:

* entrega el producto
* obtiene firma del contrato
* solicita fotocopia de DNI
* solicita comprobante de servicio

## Estado

DELIVERED

---

# Paso 7 — Cierre Administrativo

## Responsable

ADMIN

## Acción

Administración verifica la documentación recibida.

### Verificaciones

* contrato firmado
* DNI recibido
* servicio recibido

## Regla de Negocio

Para cerrar la venta únicamente es obligatorio contar con el contrato firmado.

El DNI y el comprobante de servicio podrán incorporarse posteriormente.

## Estado

CLOSED

---

# Paso 8 — Generación de Cuotas

## Responsable

Sistema

## Acción

Al cerrar la venta el sistema genera automáticamente las cuotas correspondientes.

## Resultado

installments

## Estado Inicial

PENDING

---

# Casos Especiales

## Rechazo Administrativo

La venta finaliza en:

REJECTED_ADMIN

---

## Rechazo Visita Ambiental

La venta finaliza en:

ENVIRONMENTAL_REJECTED

---

# Auditoría

Registrar:

* vendedor creador
* administrador validador
* cobrador interviniente
* cambios de estado
* observaciones
* fecha de cierre

---

# Estado Actual

Workflow vigente para Sprint 02.
