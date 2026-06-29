# Sprint 02 — Validation

Fecha: 24/06/2026

Estado: VALIDADO PARCIALMENTE

---

# Objetivo del Sprint

Comenzar la construcción del dominio comercial del sistema y validar la representación inicial del flujo operativo de Canarias dentro de una plataforma segmentada por sociedades y perfiles.

El objetivo principal fue demostrar la viabilidad funcional del circuito comercial y comenzar a consolidar el modelo operativo.

---

# Alcance Comprometido

## Autenticación

* Selección de sociedad al ingresar.
* Persistencia del contexto operativo.

## Comercial

* Inicio del flujo de ventas.
* Validación administrativa.
* Representación del circuito comercial.

## Operación

* Evolución de dashboards por perfil.

## Infraestructura

* Consolidación de backend para futuras integraciones.

---

# Alcance Presentado

Durante la reunión se presentó:

## Identidad visual

* Actualización visual del acceso incorporando identidad Canarias.

Estado:
✅ Validado

---

## Gestión Multi-Sociedad

Demostración:

* selector de sociedad;
* ingreso por contexto operativo;
* separación por sociedad.

Estado:
✅ Validado

---

## Flujo Comercial

Demostración realizada utilizando datos precargados mediante seeds.

Flujo mostrado:

Venta
↓
Validación administrativa
↓
Visita ambiental
↓
Aprobación / rechazo

Capacidades demostradas:

* transición de estados;
* actualización por dashboard;
* visualización por rol.

Estado:
✅ Validado

Observación:
No se presentó circuito completo mediante formularios.

---

## Preventa

Formulario presentado:

Cliente
↓
Selección producto
↓
Generación preventa

Restricciones actuales:

* únicamente disponible para vendedor.

Estado:
✅ Validado

---

# Funcionalidades NO Presentadas

Las siguientes capacidades quedaron fuera del alcance del Sprint:

* carga de ventas por administración;
* ABM sociedades;
* ABM zonas;
* asignación staff-zona;
* formularios administrativos;
* flujo completo de venta;
* entrega;
* cierre administrativo;
* cobranzas;
* liquidaciones.

Estado:
⏳ Pendiente

---

# Definiciones Funcionales Confirmadas

## Comercial

✅ Administración también podrá registrar ventas.

✅ Ventas rechazadas conservarán historial.

✅ Ajustar visualización de ventas rechazadas.

✅ Mostrar comisión vendedor (10%).

✅ Remover IDs visibles.

---

# Solicitudes Registradas

## Seguridad operativa

Mostrar nombre completo del cliente seleccionado durante carga de venta.

Objetivo:
reducir errores de carga.

Estado:
Pendiente.

---

## Experiencia visual

Evaluar incorporación futura:

* modo claro;
* modo oscuro.

Estado:
Fuera de alcance.

---

# Riesgos Detectados

* Backend adelantado respecto al frontend.
* Alta dependencia de seeds para demostraciones.
* Formularios pendientes para validar operación real.
* Flujo comercial todavía incompleto.

---

# Resultado del Sprint

Estado general:
🟡 Validación parcial satisfactoria.

Conclusiones:

* modelo multi-sociedad aprobado;
* dashboards aprobados;
* flujo comercial inicial aprobado;
* preventa aprobada.

Pendientes:

* completar operación comercial;
* construir formularios;
* habilitar circuito completo.

---

# Próximos pasos (Sprint 03)

* hojas de ruta;
* cobranzas;
* financiación;
* continuidad del flujo de ventas;
* entrega;
* liquidaciones;
* cierre administrativo.
