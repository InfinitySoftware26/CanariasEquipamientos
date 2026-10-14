# Canarias System — Business Rules — Usuarios y Permisos

# Objetivo

Definir las reglas de negocio relacionadas con usuarios internos, autenticación, roles, permisos y operación multi-sociedad.

Estas reglas establecen las restricciones funcionales que deben respetarse independientemente de la implementación utilizada por frontend o backend.

---

# Roles del Sistema

| Rol         | Descripción                                                            |
| ----------- | ---------------------------------------------------------------------- |
| SUPER_ADMIN | Administración global del sistema y acceso a las sociedades permitidas |
| MANAGER     | Supervisión y gestión de la operación según los permisos definidos     |
| ADMIN       | Operación y administración general                                     |
| SELLER      | Gestión de clientes y ventas                                           |
| COLLECTOR   | Gestión de cobranzas y entregas                                        |

---

# Reglas de Autenticación

## BR-AUTH-001 — Autenticación obligatoria

Todo usuario que acceda a funcionalidades protegidas del sistema debe estar autenticado.

---

## BR-AUTH-002 — Autenticación mediante JWT

Los endpoints protegidos deben validar un access token JWT válido antes de permitir la operación.

---

## BR-AUTH-003 — Validación de credenciales

La autenticación debe validar las credenciales del usuario antes de emitir los tokens de acceso.

Las credenciales inválidas deben impedir el acceso al sistema.

---

## BR-AUTH-004 — Usuarios no habilitados

Los usuarios que no puedan ser autenticados por las condiciones de acceso definidas por el sistema no podrán iniciar sesión.

---

## BR-AUTH-005 — Protección de credenciales

Las contraseñas no deben almacenarse en texto plano.

El sistema utiliza almacenamiento seguro mediante hash de contraseña.

---

# Reglas de Sesión

## BR-AUTH-006 — Access Token

Toda sesión autenticada debe utilizar un access token para acceder a los endpoints protegidos.

---

## BR-AUTH-007 — Refresh Token

El sistema utiliza un refresh token para renovar el access token sin requerir nuevamente las credenciales del usuario.

El refresh token debe mantenerse fuera del body de las respuestas de autenticación y utilizar el mecanismo de cookie definido por la API.

---

## BR-AUTH-008 — Renovación de sesión

La renovación del access token debe realizarse mediante el refresh token vigente.

Un refresh token inválido o expirado no debe permitir obtener un nuevo access token.

---

## BR-AUTH-009 — Cierre de sesión

El cierre de sesión debe eliminar el refresh token almacenado en la sesión del usuario.

La invalidación persistente de tokens podrá ampliarse en futuras implementaciones.

---

# Roles y Autorización

## BR-AUTH-010 — Autorización en Backend

Los permisos reales de una operación deben validarse en el backend.

El frontend puede utilizar los roles para controlar la visualización de funcionalidades, pero no constituye un mecanismo de seguridad.

---

## BR-AUTH-011 — Roles

Cada usuario opera con un rol definido dentro del sistema.

Los roles actualmente contemplados son:

* SUPER_ADMIN
* MANAGER
* ADMIN
* SELLER
* COLLECTOR

---

## BR-AUTH-012 — Restricción por Rol

Una operación que requiera autorización específica solo podrá ser ejecutada por los roles habilitados para dicha operación.

La definición de permisos concretos debe mantenerse alineada con cada módulo funcional.

---

# Multi-Sociedad

## BR-AUTH-013 — Asociación a Sociedades

Un usuario puede estar asociado a una o más sociedades.

La relación entre usuario y sociedad determina sobre qué sociedades puede operar.

---

## BR-AUTH-014 — Sociedad Actual

Cuando un usuario tiene acceso a múltiples sociedades, debe poder seleccionar la sociedad sobre la cual desea operar.

---

## BR-AUTH-015 — Validación de Sociedad

Un usuario únicamente puede seleccionar una sociedad a la que se encuentre asociado.

El backend debe validar esta relación antes de generar el nuevo contexto de autenticación.

---

## BR-AUTH-016 — Contexto de Sociedad

La sociedad seleccionada forma parte del contexto de autenticación utilizado por el sistema.

El contexto de sociedad se incorpora al JWT mediante `societyId`.

---

## BR-AUTH-017 — Aislamiento de Datos por Sociedad

Las operaciones sobre información perteneciente a una sociedad deben respetar el contexto de sociedad del usuario autenticado.

Los módulos que trabajen con información multi-sociedad deben validar la sociedad correspondiente antes de permitir operaciones sobre sus datos.

---

# Permisos por Rol

Los siguientes permisos representan la distribución funcional definida actualmente para el sistema.

## ADMIN

### Accesos

* Gestión de usuarios.
* Gestión de ventas.
* Gestión de cobranzas.
* Gestión de productos.
* Gestión de stock.
* Gestión de financiación.
* Gestión de cajas.
* Gestión de proveedores.
* Acceso a reportes operativos.

### Restricciones

No posee restricciones operativas generales dentro de las funcionalidades asignadas a su rol.

---

# SELLER

### Accesos

* Registrar clientes.
* Registrar ventas.
* Consultar ventas propias.
* Consultar información necesaria para la gestión comercial.

### Restricciones

* No puede aprobar ventas.
* No puede modificar configuraciones de financiación.
* No puede acceder a caja.
* No puede gestionar usuarios.

---

# COLLECTOR

### Accesos

* Gestionar hoja de ruta.
* Registrar cobros.
* Registrar entregas.
* Registrar visitas frustradas.
* Realizar operaciones correspondientes al cierre diario.

### Restricciones

* No puede crear ventas.
* No puede modificar clientes.
* No puede aprobar cierres.
* No puede acceder a configuraciones administrativas.

---

# MANAGER

### Accesos

* Dashboards.
* KPIs.
* Reportes.
* Información necesaria para supervisión y análisis de la operación.

### Restricciones

Las operaciones de modificación disponibles para MANAGER deben estar determinadas por los permisos específicos definidos en cada módulo.

---

# SUPER_ADMIN

### Accesos

* Administración global del sistema.
* Acceso a las sociedades permitidas.
* Gestión administrativa de alto nivel.
* Operaciones de configuración general del sistema.

### Restricciones

Las operaciones de SUPER_ADMIN deben utilizarse para administración global y configuración del sistema, evitando utilizar este rol como usuario operativo cotidiano cuando exista un rol específico para dicha operación.

---

# Seguridad

## BR-AUTH-018 — Protección de Endpoints

Los endpoints que requieran autenticación deben estar protegidos mediante los mecanismos de autenticación correspondientes.

---

## BR-AUTH-019 — Validación de Roles

Los endpoints que requieran restricciones por rol deben validar el rol del usuario en backend.

---

## BR-AUTH-020 — Separación entre Visualización y Seguridad

La ocultación de una funcionalidad en frontend no reemplaza la validación de permisos en backend.

---

# Auditoría

Las operaciones que requieran trazabilidad deberán registrar la información de auditoría correspondiente según las reglas generales del sistema.

Las reglas específicas de auditoría de cada operación deben definirse en el Business Rules del módulo correspondiente.

---

# Consideraciones Técnicas

Las siguientes consideraciones orientan la implementación pero no constituyen contratos de API:

* El backend es responsable de validar autenticación y autorización.
* Los guards deben utilizarse como mecanismo centralizado de protección de endpoints.
* La información del usuario autenticado debe estar disponible para los endpoints que requieran contexto de usuario.
* El contexto de sociedad debe mantenerse durante las operaciones autenticadas.
* La estructura actual permite ampliar posteriormente el modelo de permisos.

---

# Consideraciones Futuras

El sistema podrá incorporar posteriormente:

* permisos granulares;
* MFA;
* sesiones múltiples;
* políticas de seguridad adicionales;
* mecanismos avanzados de invalidación de sesiones;
* autenticación mediante proveedores externos.

Estas funcionalidades no forman parte del comportamiento actual hasta que sean implementadas y aprobadas.

---

# Estado

Documento correspondiente a las reglas de negocio vigentes del módulo de usuarios, autenticación, autorización y operación multi-sociedad.

