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
