# Canarias System — Acceptance Tests

# Objetivo

Documentar los criterios de aceptación funcionales del sistema.

Los acceptance tests validarán:

* operación real negocio
* workflows completos
* reglas operativas
* experiencia usuario
* estabilidad funcional

---

# Filosofía Acceptance Testing

El acceptance testing deberá responder:

```text id="acc101"
¿El sistema permite operar correctamente Canarias?
```

---

# Objetivos Principales

* validar flujos reales
* validar reglas negocio
* detectar errores operativos
* validar UX operacional

---

# Responsables

| Rol      | Participación         |
| -------- | --------------------- |
| QA       | Validación funcional  |
| ADMIN    | Validación operativa  |
| MANAGER  | Validación financiera |
| DEV TEAM | Corrección errores    |

---

# Ambientes Testing

| Ambiente   | Uso                |
| ---------- | ------------------ |
| Staging    | Acceptance testing |
| Production | Operación real     |

---

# Reglas Acceptance Testing

---

# Todos los flujos críticos deberán validarse manualmente.

---

# Toda funcionalidad aprobada deberá:

* funcionar correctamente
* respetar permisos
* mantener integridad datos
* soportar errores esperados

---

# Workflows Críticos

---

# 1 — Flujo Venta

## Escenario

Vendedor registra cliente y venta.

---

# Resultado Esperado

* cliente creado
* venta creada
* validación pendiente
* cuotas generadas tras aprobación

---

# Validaciones

```text id="acc102"
✓ vendedor autenticado
✓ cliente válido
✓ financiación aplicada
✓ venta visible admin
```

---

# 2 — Flujo Aprobación

## Escenario

Administración aprueba venta.

---

# Resultado Esperado

* venta aprobada
* entrega generada
* cuotas habilitadas

---

# Validaciones

```text id="acc103"
✓ validación registrada
✓ estados correctos
✓ auditoría creada
```

---

# 3 — Flujo Entrega

## Escenario

Cobrador entrega producto.

---

# Resultado Esperado

* entrega completada
* hoja ruta actualizada
* stock actualizado si aplica

---

# Validaciones

```text id="acc104"
✓ entrega registrada
✓ observaciones guardadas
✓ workflow actualizado
```

---

# 4 — Flujo Cobranza

## Escenario

Cobrador registra pago cuota.

---

# Resultado Esperado

* pago registrado
* cuota actualizada
* recibo generado
* caja impactada

---

# Validaciones

```text id="acc105"
✓ cálculo correcto
✓ recibo correcto
✓ estado cuota correcto
```

---

# 5 — Flujo Cierre Diario

## Escenario

Cobrador realiza cierre jornada.

---

# Resultado Esperado

* cierre generado
* administración aprueba
* caja consolidada

---

# Validaciones

```text id="acc106"
✓ total correcto
✓ pagos coinciden
✓ cierre auditado
```

---

# 6 — Flujo Stock

## Escenario

Administración registra stock.

---

# Resultado Esperado

* stock actualizado
* alertas recalculadas
* movimientos auditados

---

# Validaciones

```text id="acc107"
✓ stock correcto
✓ movimientos registrados
✓ alertas visibles
```

---

# 7 — Flujo Recupero

## Escenario

Cliente posee cuotas vencidas.

---

# Resultado Esperado

* mora detectada
* recupero habilitado
* deuda visible

---

# Validaciones

```text id="acc108"
✓ cuotas vencidas
✓ cliente moroso
✓ reportes correctos
```

---

# Testing Roles y Permisos

---

# SELLER

Debe poder:

* crear clientes
* crear ventas
* visualizar comisiones

No debe poder:

* aprobar ventas
* modificar cajas
* aprobar cierres

---

# COLLECTOR

Debe poder:

* cobrar cuotas
* registrar entregas
* cerrar jornada

No debe poder:

* aprobar ventas
* modificar stock

---

# ADMIN

Debe poder:

* aprobar ventas
* gestionar cajas
* generar rutas
* validar cierres

---

# MANAGER

Debe poder:

* visualizar métricas
* visualizar balances
* consultar reportes

---

# Casos Error

El sistema deberá manejar correctamente:

* login inválido
* permisos insuficientes
* cuotas inexistentes
* ventas inválidas
* cierres inconsistentes

---

# Datos Acceptance Testing

Utilizar:

* clientes ficticios
* ventas ficticias
* cobranzas simuladas

Nunca utilizar:

* datos reales
* dinero real
* producción real

---

# Checklist Release

Antes de cada release validar:

```text id="acc109"
✓ login
✓ ventas
✓ entregas
✓ cobranzas
✓ cierres
✓ stock
✓ permisos
✓ dashboards
```

---

# Métricas Calidad

El acceptance testing deberá medir:

* estabilidad workflows
* errores operativos
* experiencia usuario
* tiempos respuesta

---

# Escalabilidad Futura

Preparado para:

* QA automatizado
* E2E automation
* regression suites
* performance QA

---

# Estado Actual

Acceptance testing aprobado para Fase 1.
