# Canarias System — Dashboards

# Objetivo

Documentar la estructura de dashboards del sistema.

Los dashboards serán responsables de:

* métricas operativas
* accesos rápidos
* visualización KPIs
* flujos diarios
* navegación operacional

---

# Principios UX

El sistema deberá priorizar:

* rapidez operativa
* mínima cantidad clicks
* información crítica visible
* experiencia responsive
* simplicidad visual

---

# Arquitectura Dashboards

Cada rol tendrá:

* dashboard independiente
* widgets específicos
* métricas personalizadas
* accesos rápidos

---

# Dashboard ADMIN

## Objetivo

Control operativo total del sistema.

---

# Widgets Principales

| Widget              | Descripción            |
| ------------------- | ---------------------- |
| Ventas del día      | Total ventas           |
| Cobranza del día    | Total recaudado        |
| Entregas pendientes | Productos sin entregar |
| Cuotas vencidas     | Clientes morosos       |
| Cierres pendientes  | Pendientes aprobación  |
| Dinero en calle     | Deuda activa           |
| Stock bajo          | Alertas stock          |

---

# Accesos Rápidos

* crear producto
* aprobar ventas
* generar hoja ruta
* registrar movimiento caja

---

# Dashboard MANAGER

## Objetivo

Visualización financiera y estratégica.

---

# Widgets

| Widget             | Descripción          |
| ------------------ | -------------------- |
| Balance mensual    | Resultado financiero |
| Dinero en calle    | Riesgo financiero    |
| Ranking cobradores | Rendimiento          |
| Ranking vendedores | Productividad        |
| Mora total         | Deuda vencida        |
| Ventas mensuales   | Evolución ventas     |

---

# Dashboard SELLER

## Objetivo

Seguimiento comercial.

---

# Widgets

| Widget              | Descripción             |
| ------------------- | ----------------------- |
| Ventas día          | Cantidad ventas         |
| Comisión diaria     | Ganancia vendedor       |
| Comisión mensual    | Total mensual           |
| Clientes pendientes | Validación pendiente    |
| Ventas aprobadas    | Operaciones confirmadas |

---

# Accesos Rápidos

* crear cliente
* crear venta
* consultar clientes

---

# Dashboard COLLECTOR

## Objetivo

Gestión operativa cobranzas y entregas.

---

# Widgets

| Widget              | Descripción                    |
| --------------------| -------------------------------|
| Clientes            | Ver cobranza diaria y atrasados|
| Cobranza día        | Recaudación actual             |
| Ruta asignada       | Hoja actual                    |
| Entregas pendientes | Productos entregar             |
| Visitas fallidas    | Gestión pendiente              |
| Cierre diario       | Estado cierre                  |

---

# Accesos Rápidos

* registrar pago
* registrar entrega
* cerrar jornada

---

# Diseño Visual

---

# Cards

Todos los widgets deberán utilizar:

* cards reutilizables
* métricas destacadas
* loading states
* skeleton loaders

---

# Responsive Design

El sistema deberá soportar:

* desktop
* tablet
* mobile 

---

# Performance

Los dashboards deberán:

* usar React Query
* cachear requests
* lazy load widgets
* evitar rerenders innecesarios

---

# Actualización Datos

Los widgets críticos podrán implementar:

```text id="5ewjlwm"
polling
```

o actualización tiempo real futura.

---

# Estados UI

Todos los widgets deberán contemplar:

* loading
* empty
* error
* success

---

# Escalabilidad Futura

Preparado para:

* dashboards configurables
* widgets dinámicos
* realtime sockets
* analytics avanzados
* gráficos BI

---

# Estado Actual

Arquitectura dashboards aprobada para Fase 1.
