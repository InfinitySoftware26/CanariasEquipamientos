# Canarias System — Sprint 02

# Fecha Sprint Review

24/06/2026

---

# Duración Sprint

08/06/2026 → 24/06/2026

---

# Objetivo General

Construir la primera representación operativa del dominio comercial del sistema y validar el flujo inicial de ventas dentro de una plataforma segmentada por roles y sociedades.

El objetivo del sprint fue:

- consolidar autenticación multi-sociedad;
- incorporar selección de sociedad al ingreso;
- iniciar el flujo comercial;
- validar transición de estados;
- evolucionar dashboards operativos;
- preparar estructuras para futuras etapas comerciales y cobranzas.

---

# Eventos Sprint

| Fecha | Evento |
|---|---|
| 08/06 | Inicio Sprint |
| 10/06 | Daily |
| 12/06 | Daily |
| 15/06 | Daily |
| 17/06 | Daily |
| 19/06 | Pre-Demo |
| 24/06 | Sprint Review + Validación |

---

# Dominio Trabajado

Durante Sprint 02 se trabajó sobre los siguientes dominios:

- autenticación;
- sociedades;
- ventas;
- validaciones comerciales;
- cuotas;
- zonas;
- dashboards;
- segmentación por rol.

---

# Alcance Implementado

## Multi-Sociedad

Implementaciones:

- selector de sociedad al ingresar;
- persistencia de sociedad activa;
- aislamiento por contexto operativo.

Estado:

✅ Implementado

---

## Dashboards Operativos

Perfiles demostrados:

- Vendedor
- Administración
- Cobrador
- Superadmin

Capacidades:

- visualización por rol;
- seguimiento inicial de estados;
- actualización entre perfiles.

Estado:

✅ Implementado

---

## Preventa

Primer formulario operativo disponible.

Flujo:

Cliente

↓

Selección de producto

↓

Generación de preventa

Capacidades:

- selección de cliente;
- selección desde catálogo;
- generación inicial de operación.

Restricción:

- únicamente vendedor puede iniciar venta.

Estado:

✅ Implementado

---

## Flujo Comercial

Modelo definido:

PENDING_ADMIN_VALIDATION

↓

PENDING_ENVIRONMENTAL_VISIT

↓

PENDING_DELIVERY

↓

DELIVERED

↓

CLOSED

Estado validado:

Hasta:

PENDING_ENVIRONMENTAL_VISIT

Observación:

La demostración se realizó utilizando datos precargados mediante seeds.

---

# Backend Preparado

Se dejaron disponibles estructuras y APIs para:

- sociedades;
- staff;
- clientes;
- productos;
- ventas;
- validaciones;
- cuotas;
- financiación;
- zonas.

Estado:

🟡 Preparado para integración frontend.

---

# Frontend Disponible

Se encuentra operativo:

- login;
- selector de sociedad;
- dashboards;
- preventa;
- visualización de estados.

Pendiente:

- gestión de sociedades;
- gestión de zonas;
- asignaciones;
- formularios administrativos;
- cuotas;
- configuración financiera.

---

# Validación Realizada

Se validó:

- identidad visual;
- separación por sociedades;
- dashboards por perfil;
- avance del flujo comercial;
- consistencia visual entre estados.

Resultado:

✅ Validación satisfactoria.

---

# QA Ejecutado

Casos validados:

- ingreso multi-sociedad;
- navegación protegida;
- generación de preventa;
- transición administrativa;
- visualización por rol;
- flujo hasta visita ambiental.

Observación:

No se realizaron pruebas operativas completas de cuotas ni entrega.

---

# Riesgos Detectados

| Riesgo | Mitigación |
|---|---|
| Backend adelantado respecto al frontend | integración incremental |
| Dependencia de seeds | construcción progresiva de formularios |
| cambios funcionales | validaciones continuas |

---

# Definiciones Confirmadas

- administración podrá registrar ventas en futuras iteraciones;
- ventas rechazadas conservarán historial;
- remover IDs visibles;
- mostrar comisión vendedor (10%);
- validar cliente seleccionado visualmente.

---

# Entregables

Entregado:

- autenticación multi-sociedad;
- selector de sociedad;
- dashboards por rol;
- preventa inicial;
- flujo comercial parcial;
- validación de estados.

No entregado:

- gestión de zonas;
- gestión de sociedades;
- cuotas operativas;
- cierre completo de venta;
- cobranzas.

---

# Próximo Sprint

Objetivos iniciales:

- hojas de ruta;
- cobranzas;
- financiación;
- entrega;
- primera cuota;
- continuidad del flujo comercial.

---

# Sprint Goal

Representar y validar el inicio del flujo comercial real de Canarias y dejar preparada la base para continuar operación comercial y cobranzas.