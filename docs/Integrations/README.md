# Integrations

# Objetivo

Esta carpeta documenta los contratos de integración entre Backend y Frontend del sistema Canarias.

Su propósito es centralizar toda la información necesaria para que ambos equipos trabajen de forma coordinada utilizando los mismos endpoints, estructuras de datos y reglas de negocio.

---

# Alcance

Los documentos de esta carpeta describen:

* endpoints disponibles
* permisos requeridos
* request bodies
* responses esperadas
* reglas de negocio asociadas
* consideraciones de integración frontend/backend

---

# Diferencia con otras carpetas

## Business-Rules

Define las reglas funcionales del negocio.

Ejemplos:

* Sales
* Products
* Zones
* Installments

Responde:

> ¿Cómo debe funcionar el sistema?

---

## Api

Define estándares generales de la API.

Ejemplos:

* estructura de respuestas
* manejo de errores
* convenciones REST
* autenticación
* paginación

Responde:

> ¿Cómo diseñamos nuestros endpoints?

---

## Integrations

Documenta implementaciones concretas entre Frontend y Backend.

Responde:

> ¿Cómo consume el Frontend los módulos actualmente disponibles?

---

# Convenciones

Cada documento de integración debe representar un módulo backend.

Formato recomendado:

```text
Back-Front-NombreModulo.md
```

Ejemplos:

```text
Back-Front-Auth.md
Back-Front-Clients.md
Back-Front-Sales.md
Back-Front-Products.md
Back-Front-Zones.md
Back-Front-Staff-Zones.md
Back-Front-Staff-Societies.md
```

---

# Documentos Disponibles

## Auth

* Back-Front-Auth.md

Documenta:

* login
* refresh token
* logout
* perfil de usuario
* creación de staff
* manejo de sociedades

---

## Zones

* Back-Front-Zones.md

Documenta:

* gestión de zonas
* alta
* edición
* desactivación

---

## Staff Zones

* Back-Front-Staff-Zones.md

Documenta:

* asignación de personal a zonas
* consulta de asignaciones
* desasignación

---

## Staff Societies

* Back-Front-Staff-Societies.md

Documenta:

* asignación de personal a sociedades
* operación multi-sociedad

---

# Flujo de Actualización

Cuando Backend publique nuevos módulos:

1. Actualizar la documentación correspondiente.
2. Informar al equipo Frontend.
3. Registrar cambios relevantes de integración.
4. Mantener consistencia con Business Rules y API Standards.

---

# Estado

Documentación vigente del proyecto Canarias.
