# CHANGELOG

## [1.0.0] - Sprint 1 — 05/06/2026

### Resumen
Entrega inicial del proyecto Canarias System con la fundación técnica completa para el desarrollo del sistema. Esta primera etapa cierra la base del monorepo, la infraestructura de autenticación, el diseño de roles, la configuración de la base de datos y los primeros dashboards de frontend.

### Añadido
- Backend modular construido con **NestJS**.
- Frontend inicial en **Next.js** + **React** + **TypeScript**.
- Configuración de **PostgreSQL** con acceso mediante **TypeORM**.
- Autenticación basada en **JWT** con `access token` y `refresh token`.
- Implementación de roles: `ADMIN`, `SELLER`, `COLLECTOR`, `MANAGER`.
- Diseño y soporte para **multi-sociedad** con segmentación `society_id`.
- Login funcional y rutas protegidas en frontend.
- Dashboard base por rol con placeholders y navegación inicial.
- Estructura de módulos backend: `auth`, `staff`, `clients`, `sales`, `collections`, `routes`, `products`, `stock`, `reports`, `cash`.
- Documentación de sprint, arquitectura y entornos en `docs/`.
- Configuración de `pnpm` en monorepo y uso de `Docker Compose` para entornos locales.

### Documentación actualizada
- `README.md` actualizado con descripción del sistema, tecnologías, instrucciones de arranque, variables de entorno y estructura general.
- `docs/Architecture/SystemOverview.md` actualizado con descripción de frontend, backend, base de datos, JWT, roles y multi-sociedad.
- `docs/Architecture/FrontendArchitecture.md` extendido con autenticación, roles, multi-sociedad y consumo de APIs.
- `docs/Architecture/DateBaseArchitecture.md` reforzado con multi-sociedad y segmentación de datos.
- `docs/Sprints/Sprint-01/` contiene la reunión, capturas y backlog de cierre.

### Mejoras de plataforma
- Base de la arquitectura preparada para futuros servicios y microservicios.
- Plantillas iniciales de validación, guards y seguridad en backend.
- Estructura de carpetas clara y escalable para frontend y backend.
- Estado global del frontend con `Zustand` y protección de sesiones.

### Próximos pasos recomendados
- Completar los endpoints de ventas, cobranzas y stock.
- Implementar reportes operativos y financieros.
- Desarrollar el manejo de sociedad activa en la UI.
- Añadir pruebas automatizadas de backend y frontend.
- Continuar con la documentación de Sprint 2 y los casos de uso.

### Notas
- El archivo `CHANGELOG.md` se ubica en la raíz del proyecto como registro central del avance técnico.
- Las decisiones arquitectónicas de esta etapa están diseñadas para facilitar la migración futura hacia microservicios.

## [1.1.0] - Sprint 2 — 24/06/2026

### Resumen

Sprint orientado a comenzar la construcción del dominio comercial del sistema y validar la representación del flujo operativo de Canarias dentro de una plataforma segmentada por roles y sociedades.

Durante esta etapa el foco estuvo puesto en:

* consolidar el ingreso multi-sociedad;
* evolucionar dashboards por perfil;
* construir el primer formulario operativo;
* comenzar a representar el flujo comercial.

La validación realizada durante la reunión fue ejecutada utilizando datos precargados mediante seeds y no representa todavía el circuito operativo completo funcionando mediante formularios.

---

### Añadido

#### Acceso y contexto operativo

* Incorporación del selector de sociedad al iniciar sesión (alcance pendiente del Sprint 01).
* Persistencia de sociedad activa durante sesión.
* Protección de navegación según contexto operativo.

---

#### Dashboards Operativos

Se evolucionaron dashboards para representar estados operativos por perfil.

Perfiles disponibles:

* Vendedor
* Cobrador
* Administración
* Superadmin

Capacidades:

* visualización contextual;
* actualización inicial por estado comercial;
* navegación por rol.

---

#### Preventa

Se desarrolló el primer formulario operativo del sistema.

Flujo implementado:

Cliente
↓
Selección de producto disponible
↓
Generación de preventa

Capacidades:

* selección de cliente;
* selección desde catálogo disponible;
* generación inicial de operación.

Restricción actual:

* únicamente el perfil **Vendedor** puede registrar ventas.

Estado:
Operativo.

---

### Flujo comercial

Durante Sprint 02 se definió y comenzó a representar el ciclo de vida comercial de una venta.

#### Ciclo de vida definido

PENDING_ADMIN_VALIDATION
↓
PENDING_ENVIRONMENTAL_VISIT
↓
PENDING_DELIVERY
↓
DELIVERED
↓
CLOSED

Interpretación operativa:

**PENDING_ADMIN_VALIDATION**

* El vendedor registra la venta.
* Administración realiza validación comercial.

↓

**PENDING_ENVIRONMENTAL_VISIT**

* El cobrador realiza visita ambiental.

↓

**PENDING_DELIVERY**

* Administración coordina entrega.

↓

**DELIVERED**

* Entrega operativa y recepción documental.

↓

**CLOSED**

* Confirmación administrativa del cierre.

---

### Alcance implementado y validado en Sprint 02

Se realizó demostración utilizando información precargada mediante seeds.

Circuito demostrado:

Venta
↓
Validación administrativa
↓
Visita ambiental
↓
Aprobación / rechazo

Capacidades validadas:

* transición visual de estados;
* actualización entre dashboards;
* visibilidad segmentada por rol.

Estado alcanzado:
Hasta `PENDING_ENVIRONMENTAL_VISIT`.

---

### Backend preparado

Se dejaron disponibles estructuras y APIs para:

* sociedades;
* staff;
* clientes;
* productos;
* ventas;
* cuotas;
* financiación;
* zonas.

Estado:
Implementación frontend pendiente.

---

### Definiciones funcionales registradas

* Administración deberá poder registrar ventas en futuras iteraciones.
* Las ventas rechazadas conservarán historial.
* Ajustar representación visual de ventas rechazadas.
* Mostrar comisión del vendedor (10%) en lugar del valor total.
* Remover identificadores técnicos visibles.

---

### Solicitudes registradas

* Incorporar validación visual mostrando nombre del cliente durante carga de venta.
* Evaluar incorporación futura de modo claro / oscuro.

Estado:
Fuera del alcance del Sprint 02.

---

### No incluido en Sprint 02

Frontend pendiente para:

* gestión de sociedades;
* gestión de zonas;
* asignación staff-zona;
* formularios administrativos;
* ventas por administración;
* cuotas completas;
* configuración financiera;
* flujo comercial completo.

---

### Diferido para Sprint 03

* coordinación de entrega;
* primera cuota;
* hojas de ruta;
* cobranzas;
* liquidaciones;
* continuidad del circuito comercial.

---

### Documentación actualizada

* Integración Backend → Frontend Sprint 02.
* Actualización funcional del dominio comercial.
* Documentación de sprint.

---

### Resultado

Sprint 02 finaliza con autenticación multi-sociedad operativa, dashboards funcionales por perfil, preventa inicial implementada y validación del flujo comercial hasta visita ambiental.
