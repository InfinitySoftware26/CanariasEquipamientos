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

## [1.2.0] - Sprint 3 — 24/07/2026

### Resumen

Sprint orientado a consolidar la operación comercial del sistema, incorporando la administración completa de empleados y zonas, evolucionando el flujo de ventas y validando junto al cliente las reglas operativas que regirán las próximas etapas del proyecto.

Durante esta etapa el foco estuvo puesto en:

* implementar los módulos administrativos principales;
* consolidar el flujo comercial entre los distintos perfiles;
* fortalecer la seguridad mediante jerarquías de usuarios;
* validar reglas de negocio junto al equipo operativo de Canarias.

---

### Añadido

#### Gestión de Empleados

Se desarrolló el módulo completo de administración de empleados.

Capacidades:

* alta de empleados;
* edición de información;
* activación y desactivación;
* listado mediante tarjetas;
* filtrado de empleados;
* asignación de perfiles;
* generación automática de credenciales.

---

#### Gestión de Zonas

Se implementó el módulo de administración de zonas.

Capacidades:

* alta de zonas;
* edición;
* activación y desactivación;
* visualización de zonas registradas;
* asignacion y eliminacion de empleados a la zona;
* preparación para futuras asignaciones de recorridos y cobradores.

---

#### Evolución del Flujo Comercial

Se continuó la construcción del circuito operativo de ventas incorporando nuevas validaciones y transiciones entre perfiles.

Durante la Sprint Review se realizó una demostración navegando entre los distintos roles del sistema para validar el comportamiento de cada etapa del proceso comercial.

Estado alcanzado:

Venta
↓
Validación administrativa
↓
Visita ambiental
↓
Entrega
↓
Cierre administrativo *(pendiente implementación final)*

---

### Seguridad Operativa

Se incorporó un esquema jerárquico para la creacion y edicion de empleados.

Jerarquía implementada:

**SUPER_ADMIN**

* Gerentes
* Administradores
* Vendedores
* Cobradores

↓

**MANAGER**

* Administradores
* Vendedores
* Cobradores

↓

**ADMIN**

* Vendedores
* Cobradores

Con esta implementación ningún usuario puede generar perfiles con permisos superiores a los propios.

---

### Experiencia de Usuario

Se definieron criterios comunes para toda la plataforma.

Se incorporaron:

* validaciones visuales en formularios;
* mensajes de error consistentes;
* confirmaciones para acciones críticas;
* comportamiento unificado de interfaces administrativas.

Estas definiciones fueron presentadas y validadas durante la Sprint Review.

---

### Definiciones Funcionales Registradas

Durante la reunión quedaron confirmadas las siguientes reglas de negocio:

* incorporar dirección y referencia telefónica dentro del detalle de venta;
* permitir configurar frecuencia de pago:

  * diaria;
  * semanal;
  * quincenal;
  * mensual;
* incorporar un historial comercial del cliente basado en su comportamiento de pago;
* mostrar información resumida del cliente en la pantalla principal;
* permitir búsquedas de clientes por domicilio;
* confirmar que el cierre definitivo de la venta corresponde al área administrativa;
* acreditar la comisión del vendedor únicamente cuando la venta haya sido cerrada administrativamente.

---

### Solicitudes Registradas

Quedaron registradas para próximas iteraciones:

* tablero resumen de clientes con indicadores comerciales;
* historial de comportamiento de pagos;
* evaluación crediticia del cliente;
* reportes gerenciales mensuales;
* indicadores de cobranzas;
* estadísticas comerciales y financieras.

---

### Pendientes para Sprint 04

* completar validación de visita ambiental;
* finalizar cierre administrativo de ventas;
* registrar primera cuota durante la entrega;
* iniciar desarrollo del dominio completo de cobranzas;
* implementar modalidades de pago;
* comenzar historial comercial de clientes.

---

### Documentación Actualizada

* Sprint 03.
* Acta de Sprint Review.
* Reglas operativas del flujo comercial.
* Definiciones funcionales relevadas con el cliente.

---

### Resultado

Sprint 03 finaliza con los módulos de Empleados y Zonas operativos, una evolución significativa del flujo comercial y la validación conjunta de las principales reglas de negocio.
Durante la revisión funcional quedó identificado que la validación definitiva de la visita ambiental y el cierre administrativo de la venta permanecen pendientes de implementación, por lo que su finalización fue incorporada al alcance del Sprint 04.
