# Commercial Flow

## Objetivo

Definir el flujo operativo comercial del sistema Canarias y establecer las reglas de negocio que gobiernan el ciclo de vida completo de una venta.

Este documento describe:

* participantes involucrados;
* responsabilidades;
* estados comerciales;
* transiciones permitidas;
* restricciones operativas;
* decisiones funcionales futuras.

---

# Participantes

## Vendedor

Responsabilidades:

* registrar preventa;
* seleccionar cliente;
* seleccionar productos;
* iniciar operación comercial.

Resultado esperado:

La venta queda creada y pendiente de validación administrativa.

---

## Administración

Responsabilidades:

* validar condiciones comerciales;
* informar bases y condiciones al cliente;
* coordinar entrega;
* validar documentación;
* confirmar cierre administrativo.

Resultado esperado:

La operación avanza o se rechaza según validaciones.

---

## Cobrador

Responsabilidades:

* realizar visita ambiental;
* ejecutar entrega;
* solicitar documentación;
* formalizar recepción contractual.

Resultado esperado:

Confirmación operativa de entrega.

---

# Flujo Comercial

## Ciclo de vida de venta

PENDING_ADMIN_VALIDATION

↓

PENDING_ENVIRONMENTAL_VISIT

↓

PENDING_DELIVERY

↓

DELIVERED

↓

CLOSED

---

# Estados

## PENDING_ADMIN_VALIDATION

Descripción:

Venta registrada y pendiente de validación administrativa.

Responsable:
Administración

Acciones permitidas:

* aprobar;
* rechazar;
* registrar observaciones.

Entrada:
Venta creada.

Salida:
PENDING_ENVIRONMENTAL_VISIT

---

## PENDING_ENVIRONMENTAL_VISIT

Descripción:

Venta pendiente de visita ambiental.

Responsable:
Cobrador

Acciones permitidas:

* aprobar visita;
* rechazar visita;
* registrar observaciones.

Entrada:
Validación administrativa aprobada.

Salida:
PENDING_DELIVERY

---

## PENDING_DELIVERY

Descripción:

Venta aprobada pendiente de coordinación de entrega.

Responsable:
Administración

Acciones permitidas:

* coordinar entrega;
* registrar primera cuota;
* validar documentación previa.

Entrada:
Visita ambiental aprobada.

Salida:
DELIVERED

---

## DELIVERED

Descripción:

Producto entregado al cliente.

Responsable:
Cobrador

Acciones permitidas:

* confirmar entrega;
* solicitar documentación;
* registrar firma.

Documentación requerida:

* DNI
* Servicio

Entrada:
Entrega coordinada.

Salida:
CLOSED

---

## CLOSED

Descripción:

Venta finalizada administrativamente.

Responsable:
Administración

Acciones permitidas:

* validar documentación;
* cerrar operación.

Entrada:
Entrega confirmada.

Salida:
Fin del flujo.

---

# Reglas de Negocio

## BR-CF-001 — Inicio de venta

Solo el perfil **Vendedor** puede registrar una venta.

Estado:
Implementado.

---

## BR-CF-002 — Validación administrativa obligatoria

Toda venta deberá pasar por validación administrativa antes de continuar.

Estado:
Implementado.

---

## BR-CF-003 — Visita ambiental obligatoria

Una venta aprobada deberá pasar por visita ambiental.

Estado:
Implementado parcialmente.

---

## BR-CF-004 — Conservación histórica

Las ventas rechazadas no eliminan información.

Objetivo:
mantener trazabilidad operativa.

Estado:
Aprobado.

---

## BR-CF-005 — Entrega requiere documentación

La entrega requiere:

* DNI;
* servicio.

Estado:
Definido.

---

## BR-CF-006 — Cierre administrativo obligatorio

Solo administración puede confirmar cierre definitivo.

Estado:
Definido.

---

# Restricciones

Actualmente:

* la carga inicial solo está disponible para vendedor;
* el circuito completo aún no posee formularios operativos;
* parte del flujo se valida mediante datos precargados.

---

# Decisiones funcionales aprobadas

## DF-CF-001 — Registro de ventas por Administración

Se acordó habilitar que Administración también pueda registrar ventas.

Estado:
Aprobado funcionalmente.

Implementación:
Pendiente.

Consideraciones:

* mantener trazabilidad del creador;
* respetar permisos activos.

---

## DF-CF-002 — Confirmación visual de cliente

Se definió mostrar nombre completo del cliente durante carga de venta.

Objetivo:
reducir errores operativos.

Estado:
Pendiente.

---

# Estado actual del sistema

Implementado:

* autenticación multi-sociedad;
* dashboards por rol;
* preventa;
* validación administrativa;
* visualización de estados.

Validado:

Hasta:

PENDING_ENVIRONMENTAL_VISIT

Pendiente:

* entrega;
* documentación;
* cierre;
* cobranzas.
