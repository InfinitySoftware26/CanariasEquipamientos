# Canarias System — Permissions Architecture

# Objetivo

Documentar la arquitectura de autorización del sistema.

Este documento define el modelo de roles, permisos y restricciones utilizado por Backend y Frontend.

---

# Modelo de Seguridad

El sistema utiliza un modelo basado en:

RBAC

(Role Based Access Control)

Los accesos se determinan mediante el rol asignado al usuario.

Cada usuario pertenece a un staff y posee permisos según sus responsabilidades dentro de la empresa.

---

# Componentes

La seguridad del sistema está compuesta por:

## Authentication

Responsable de verificar la identidad del usuario.

Ejemplos:

- login
- contraseña
- generación de token
- sesión activa

---

## Authorization

Responsable de determinar qué acciones puede realizar el usuario.

Ejemplos:

- crear venta
- aprobar venta
- registrar entrega
- consultar información

---

# Roles del Sistema

# SUPER_ADMIN

Representa al administrador principal del sistema.

Responsabilidad:

Gestionar la configuración global de la plataforma y administrar el acceso completo a todas las sociedades.

---

## Alcance

Tiene acceso total a todas las sociedades registradas en el sistema.

El usuario podrá seleccionar la sociedad activa mediante un filtro de contexto para operar sobre una sociedad específica.

---

## Puede

- acceder a todas las sociedades
- cambiar sociedad activa desde el sistema
- consultar información global
- crear nuevas sociedades
- gestionar usuarios
- crear usuarios SUPER_ADMIN
- crear usuarios MANAGER
- asignar roles
- gestionar permisos
- administrar configuraciones generales
- supervisar operaciones comerciales
- acceder a todos los reportes
- administrar parámetros generales del sistema

---

## No puede

- modificar información histórica sin auditoría
- eliminar información crítica del sistema
- alterar registros sin trazabilidad

---

# MANAGER

Representa supervisión.

Responsabilidad:

Monitorear la operación.

### Puede

- consultar información global
- acceder a reportes
- supervisar usuarios
- revisar operaciones

---

# ADMIN

Representa al personal administrativo.

Responsabilidad:

Controlar y validar operaciones.

### Puede

- consultar ventas
- validar información
- aprobar solicitudes
- rechazar solicitudes
- coordinar visitas ambientales
- coordinar entregas
- cerrar ventas
- validar documentación

### No puede

- modificar acciones históricas sin auditoría

---

## SELLER

Representa al vendedor comercial.

Responsabilidad:

Registrar nuevas operaciones comerciales.

### Puede

- iniciar solicitudes de venta
- cargar datos del cliente
- seleccionar productos
- registrar observaciones
- consultar ventas propias

### No puede

- aprobar ventas
- rechazar ventas
- cerrar operaciones
- modificar validaciones administrativas

---


# COLLECTOR

Representa al cobrador / personal operativo.

Responsabilidad:

Ejecutar tareas en campo.

### Puede

- consultar visitas asignadas
- registrar visita ambiental
- cargar observaciones
- confirmar entregas

### No puede

- aprobar ventas
- rechazar administrativamente
- cerrar ventas

---

# Matriz de Permisos

| Acción | SUPER_ADMIN | SELLER | ADMIN | COLLECTOR | MANAGER |
|---|---|---|---|---|---|
| Crear venta | ✓ | ✓ | ✓ | ✗ | ✓ |
| Crear cliente | ✓ | ✓ | ✓ | ✗ | ✓ |
| Consultar ventas propias | ✓ | ✓ | ✓ | ✓ | ✓ |
| Consultar todas las ventas | ✓ | ✗ | ✓ | ✗ | ✓ |
| Aprobar venta | ✓ | ✗ | ✓ | ✗ | ✓ |
| Rechazar venta | ✓ | ✗ | ✓ | ✗ | ✓ |
| Registrar visita ambiental | ✓ | ✗ | ✗ | ✓ | ✓ |
| Confirmar entrega | ✓ | ✗ | ✗ | ✓ | ✓ |
| Cerrar venta | ✓ | ✗ | ✓ | ✗ | ✓ |
| Crear usuarios | ✓ | ✗ | ✗ | ✗ | ✓ |
| Crear SUPER_ADMIN | ✓ | ✗ | ✗ | ✗ | ✗ |
| Crear MANAGER | ✓ | ✗ | ✗ | ✗ | ✗ |
---

# Reglas de Autorización

## Regla 1

Todo usuario debe estar autenticado antes de acceder al sistema.

---

## Regla 2

La autorización debe validarse en Backend.

Frontend solamente controla visualización.

---

## Regla 3

Un usuario no debe ejecutar acciones fuera de su rol.

Ejemplo:

Un SELLER no puede llamar una operación administrativa aunque conozca el endpoint.

---

# Backend Authorization

El Backend debe validar:

- usuario autenticado
- rol del usuario
- permiso requerido
- estado actual del recurso

---

# Ejemplo de Protección

Endpoint:

```text
POST /sales


Endpoint:

POST /sales

Permitido:

SELLER
ADMIN

---

Endpoint:

PATCH /sales/:id/close

Permitido:

ADMIN
```
---

# Frontend Authorization

Frontend debe utilizar la información del usuario para:

- mostrar acciones disponibles
- proteger rutas
- ocultar botones no permitidos

Ejemplo:

Un SELLER no debería visualizar:

- botón aprobar
- botón rechazar
- botón cerrar venta

---

# Reglas de Implementación

La seguridad nunca debe depender únicamente del Frontend.

El Backend debe ser la autoridad final de autorización.

Aunque un usuario pueda modificar una petición manualmente, el servidor debe rechazar acciones no permitidas.


---

# Flujo de Autorización

Proceso:

1. Usuario inicia sesión

2. Backend valida credenciales

3. Backend genera token

4. Frontend almacena sesión

5. Usuario realiza una acción

6. Backend valida:

- identidad
- rol
- permiso
- estado del recurso

7. Backend permite o rechaza operación


---

# Evolución Futura

La arquitectura debe permitir agregar:

- permisos dinámicos
- roles configurables
- permisos por sociedad
- permisos por zona
- auditoría de acciones


---

# Estado

Documento vigente para arquitectura inicial.