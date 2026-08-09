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
* generar plan de cuotas;
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
* obtener la firma del contrato;
* recibir la documentación requerida;
* cobrar la primera cuota;

Resultado esperado:

Confirmación operativa de entrega.

---

# Flujo Comercial

## Ciclo de vida de venta

PENDING_ADMIN_VALIDATION

↓

Validación administrativa

↓

PENDING_ENVIRONMENTAL_VISIT

↓

Visita ambiental aprobada

↓

PENDING_DELIVERY

↓

Coordinación de entrega

↓

Generación automática del plan de cuotas

↓

Entrega

↓

Cobro primera cuota

↓

DELIVERED

↓

Confirmación administrativa

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

Acciones permitidas

* coordinar entrega
* generar automáticamente el plan de cuotas
* validar documentación previa

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

* confirmar entrega
* registrar firma del contrato
* recibir documentación
* registrar cobro de la primera cuota

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

Los perfiles SELLER y ADMIN pueden registrar una venta.

Ambos seguirán exactamente el mismo flujo operativo.

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

Entrega requiere

* firma del contrato;
* DNI;
* comprobantes de servicio;
* registro del primer pago.

Estado:
Definido.

---

# Restricciones

Actualmente:

La venta podrá iniciarse por SELLER o ADMIN.

El resto del flujo respetará las mismas reglas de negocio independientemente del rol creador.

---

# Decisiones funcionales aprobadas

## DF-CF-001 — Registro de ventas por Administración

Se acordó habilitar que el perfil **Administración** también pueda iniciar una venta además del perfil **Vendedor**.

Objetivo:
permitir continuidad operativa y evitar dependencia exclusiva del área comercial para iniciar operaciones.

Estado:
Aprobado funcionalmente.

Implementación:
Planificada para Sprint 03.

Comportamiento esperado:

Roles habilitados:

- Vendedor
- Administración

Consideraciones:

- mantener trazabilidad del usuario creador;
- conservar permisos por sociedad;
- registrar rol origen de creación;
- mantener validación administrativa posterior según flujo definido.
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
