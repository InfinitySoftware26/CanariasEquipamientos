# Demo Inicial – Sistema de Gestión Canarias

**Cliente:** Canarias S.R.L.
**Fecha:** 05/06/2026

---

# 1. Introducción (5 min)

## Bienvenida

Agradecemos el tiempo brindado para esta primera demostración del sistema.

Durante este Sprint 01 nos enfocamos en construir las bases técnicas de la plataforma, priorizando seguridad, autenticación, estructura general del sistema y definición inicial de roles.

## Objetivo de la reunión

Esta primera demo tiene como objetivo:

* Presentar los avances desarrollados durante el Sprint 01.
* Validar la propuesta de acceso y permisos por rol.
* Confirmar definiciones funcionales necesarias para los próximos módulos.
* Recibir feedback para continuar con el desarrollo del núcleo comercial del sistema.

---

# 2. Explicación de lo realizado (10 min)

## Alcance Sprint 01

Durante este sprint se desarrollaron los componentes fundamentales del sistema:

### Infraestructura y Arquitectura

* Configuración de backend y frontend.
* Estructura modular escalable.
* Configuración de base de datos.
* Arquitectura preparada para futuras funcionalidades.

### Seguridad

* Sistema de autenticación mediante usuario y contraseña.
* Gestión de sesiones.
* Protección de rutas y funcionalidades.
* Validaciones de acceso según permisos.

### Roles y Permisos

Se implementó la estructura inicial de roles que permitirá controlar el acceso a cada módulo según la función del usuario dentro de la empresa.

### Dashboard Inicial

* Menú lateral.
* Barra superior.
* Información de usuario autenticado.
* Estructura base para futuros indicadores y métricas.

---

# 3. Demostración Práctica (15 min)

## Inicio de Sesión

Mostrar:

* Pantalla de login.
* Validaciones de acceso.
* Mensajes de error.
* Acceso seguro mediante credenciales.

## Dashboard

Mostrar:

* Menú lateral.
* Barra superior.
* Usuario autenticado.
* Estructura general de navegación.

Aclaración:

Los indicadores comerciales, métricas y reportes serán incorporados en los próximos sprints.

## Roles y Seguridad

Presentar la propuesta inicial de roles:

### SUPER ADMIN

* Acceso a todas las sociedades.
* Acceso a todas las cajas.
* Gestión de usuarios.
* Configuración general del sistema.

### GERENTE

* Acceso a su sociedad.
* Visualización de métricas generales.
* Consulta de caja.
* Consulta de "Plata en la Calle".

### ADMINISTRACIÓN

* Gestión de clientes.
* Gestión de productos.
* Gestión de proveedores.
* Validación de ventas.
* Gestión de caja.
* Gestión de hojas de ruta.

### VENDEDOR

* Registro de ventas.
* Consulta de ventas realizadas.
* Consulta de comisiones.

Validar con el cliente que las responsabilidades asignadas a cada rol reflejan correctamente la operatoria actual.

---

# 4. Feedback del Cliente (10 min)

## Validación de Roles

Preguntas:

* ¿Algún rol necesita más permisos o restricciones?
* ¿Existen usuarios que trabajen en más de una sociedad?

## Validación de Navegación

Preguntas:

* ¿La estructura general del sistema les resulta cómoda?
* ¿Hay algo que esperaban visualizar y no encontraron?
* ¿La navegación les parece clara e intuitiva?

## Validación General

Preguntas:

* ¿Existe algún proceso importante que hasta lo mostrado les parezca que falta?
* ¿Hay alguna funcionalidad crítica para la operación diaria que debamos priorizar?

Registrar observaciones y sugerencias para incorporarlas al backlog.

---

# 5. Consultas Puntuales del Equipo (10 min)

## Flujo Comercial

Actualmente estamos modelando el siguiente flujo:

Vendedor
↓
Carga de Venta
↓
Administración
(Visita Ambiental)
↓
Aprobación
↓
Asignación de Cobrador
↓
Entrega de Producto
↓
Cobro Primera Cuota
↓
Cliente Activo

### Consultas

* ¿Este flujo representa correctamente la operatoria actual?
* ¿Quién tiene la aprobación final de una venta?
* ¿Puede modificarse una venta una vez aprobada?
* ¿Existen excepciones frecuentes que debamos contemplar?

---

## Estados de Venta

Propuesta inicial:

* Pendiente de Validación
* Aprobada
* Rechazada
* En mora
* Cancelada
* Producto retirado

### Consultas

* ¿Necesitan estados adicionales?
* ¿Existen estados intermedios utilizados actualmente?
* Vamos a colocar un checklist para dni y servicio

---

## Clientes

### Consultas

* ¿Qué datos consideran obligatorios para registrar un cliente?
* ¿Qué información consultan con mayor frecuencia?

---

## Productos y Financiación

### Consultas

* ¿Las configuraciones de financiación deben ser globales o por producto?
* ¿Necesitan ambas opciones?
* ¿Cómo suelen calcular la financiación?
* ¿Cuáles son las cantidades de cuotas más utilizadas?
* ¿Cómo desean organizar las categorías de productos?

---

## Gestión de Zonas y Cobradores

### Consultas

* ¿Existe normalmente un único cobrador por zona?
* En Rosario, donde trabajan varios cobradores, ¿cómo realizan la división?
* ¿La asignación se realiza por barrio, sector o cartera de clientes?
* ¿El cierre diario siempre se realiza por sociedad?
* ¿La rendición del dinero se entrega a la administración de la sociedad correspondiente?

---

## Transferencias Bancarias

### Consulta

Cuando un cliente selecciona transferencia bancaria como método de pago:

* ¿El seguimiento continúa realizándolo el cobrador?
* ¿O la gestión pasa directamente a la administración?

---

## Auditoría e Historial

### Consultas

* ¿Qué cambios consideran importante auditar?
* ¿Necesitan visualizar quién realizó cada modificación?
* ¿Durante cuánto tiempo desean conservar el historial?

---

# 6. Cierre (5 min)

## Resumen

Durante esta reunión validamos:

* Acceso al sistema.
* Seguridad y autenticación.
* Roles y permisos.
* Estructura inicial de navegación.
* Definiciones funcionales para el módulo comercial.

## Próximo Sprint

Durante el Sprint 02 nos enfocaremos en el núcleo comercial del sistema.

### Alcance Sprint 02

#### Clientes

* Alta y edición.
* Gestión de domicilios.
* Búsquedas.

#### Ventas

* Registro de ventas.
* Asociación cliente-producto.
* Estados de venta.

#### Financiación

* Configuración global.
* Configuración por producto.
* Cálculo automático de cuotas.

#### Cuotas

* Generación automática.
* Calendario de vencimientos.

## Objetivo de la Próxima Demo

Mostrar el flujo comercial completo:

Cliente
↓
Producto
↓
Venta
↓
Financiación
↓
Generación Automática de Cuotas

## Agradecimiento

Agradecemos su participación y colaboración.

Toda la información relevada será documentada y utilizada para la planificación de los próximos desarrollos.
