# Canarias System — Business Rules — Usuarios y Permisos

# Objetivo

Definir roles, permisos y restricciones operativas del sistema.

---

# Roles del Sistema

| Rol         | Descripción                                                    |
| ----------- | -------------------------------------------------------------- |
| SUPER_ADMIN | Acceso global a todas las sociedades y gestión de super admins |
| MANAGER     | Supervisión y análisis                                         |
| ADMIN       | Operación y administración general                             |
| SELLER      | Registro de clientes y ventas                                  |
| COLLECTOR   | Cobranza y entregas                                            |

---

# Jerarquía Operativa

```text
SUPER_ADMIN
   ↓
MANAGER
   ↓
ADMIN
   ↓
SELLER / COLLECTOR
```

---

# Reglas Generales

---

## BR-AUTH-001

Todo usuario debe autenticarse mediante login.

---

## BR-AUTH-002

Toda sesión debe utilizar JWT.

---

## BR-AUTH-003

Los permisos deben validarse en backend.

---

## BR-AUTH-004

Todo usuario pertenece al menos a una sociedad.

---

## BR-AUTH-005

Las acciones críticas deben auditarse.

---

# Permisos por Rol

---

# ADMIN

## Accesos

* Gestión usuarios
* Gestión ventas
* Gestión cobranzas
* Gestión productos
* Gestión stock
* Gestión financiación
* Gestión cajas
* Gestión proveedores
* Reportes operativos

---

# Restricciones

* No posee restricciones operativas generales.

---

# SELLER

## Accesos

* Registrar clientes
* Registrar ventas
* Consultar ventas propias
* Ver métricas personales

---

## Restricciones

* No puede aprobar ventas.
* No puede modificar financiación.
* No puede acceder a caja.
* No puede gestionar usuarios.

---

# COLLECTOR

## Accesos

* Hoja de ruta
* Registrar cobros
* Registrar entregas
* Registrar visitas frustradas
* Realizar cierre diario

---

## Restricciones

* No puede crear ventas.
* No puede modificar clientes.
* No puede aprobar cierres.
* No puede acceder a configuraciones.

---

# MANAGER

## Accesos

* Dashboards ejecutivos
* KPIs
* Reportes financieros
* Estadísticas globales

---

## Restricciones

* Acceso mayormente lectura.
* No participa operatoria diaria.

---

# SUPER_ADMIN

## Accesos

* Acceso global a todas las sociedades
* Gestión de roles y permisos de alto nivel
* Creación y administración de otros SUPER_ADMIN
* Supervisión de configuración y auditoría centralizada

## Restricciones

* Uso restringido a administración de sistema.
* Debe aplicarse con controles adicionales de seguridad.
* No debe utilizarse para operación diaria de sociedad específica.

---

# Multi-Sociedad

---

## BR-AUTH-006

Todo acceso debe filtrarse por sociedad.

---

## BR-AUTH-007

Los datos deben segmentarse por sociedad.

---

## BR-AUTH-008

Un usuario puede operar múltiples sociedades.

---

# Seguridad

* Passwords encriptadas
* Tokens seguros
* Expiración de sesión
* Protección endpoints
* Logs de auditoría

---

# Auditoría

Registrar:

* inicio sesión
* cierre sesión
* cambios críticos
* acciones administrativas
* modificaciones sensibles

---

# Consideraciones Técnicas

* Backend controla permisos reales.
* Frontend solo controla visualización.
* Los guards deben centralizarse.
* Los permisos deben ser escalables.

---

# Consideraciones Futuras

Futuras versiones podrán incorporar:

* permisos granulares
* MFA
* geolocalización
* bloqueo por dispositivo
* sesiones múltiples

