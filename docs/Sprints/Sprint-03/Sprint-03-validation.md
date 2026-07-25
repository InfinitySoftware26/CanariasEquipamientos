# Sprint 03 Validation

## Información General

| Campo | Valor |
|-------------------------------|------------------------------|
| Proyecto | Canarias System |
| Sprint | Sprint 03 |
| Fecha | 24/07/2026 |
| Modalidad | Reunión de Validación y Demo |
| Participantes Cliente | Luciano, Gustavo, Ignacio, Ariel y equipo Administrativo |
| Participantes Infinity Software | Nahuel, Orlando |

---

# Objetivo de la Reunión

Presentar los avances desarrollados durante el Sprint 03, validar los nuevos módulos administrativos incorporados, revisar el flujo comercial implementado y relevar nuevas definiciones funcionales para la continuidad del proyecto.

---

# Funcionalidades Presentadas

Durante la reunión se realizó una demostración funcional del sistema utilizando los distintos perfiles disponibles.

## Gestión de Empleados

Se presentó el módulo completo de administración de empleados.

Incluyendo:

* Alta.
* Edición.
* Activación y desactivación.
* Gestión por roles.
* Listado mediante tarjetas.
* Filtros.

---

## Gestión de Zonas

Se presentó el módulo de administración de zonas.

Incluyendo:

* Alta.
* Edición.
* Administración de zonas.
* Preparación para futuras asignaciones operativas.

---

## Flujo Comercial

Se realizó una demostración completa del proceso comercial alternando entre los distintos perfiles del sistema.

Durante la presentación se validó correctamente el comportamiento de:

* Registro de ventas.
* Validación administrativa.
* Actualización automática de estados.
* Visualización por perfil.

Durante la demostración se detectó que la validación final de la visita ambiental y el cierre administrativo continúan pendientes de implementación.

Se acordó completar dichas etapas durante el Sprint 04.

---

## Validaciones de Formularios

Se presentó el estándar visual definido para todos los formularios del sistema.

Incluyendo:

* Validaciones de campos obligatorios.
* Mensajes de error.
* Restricciones de formato.
* Retroalimentación visual al usuario.

La propuesta fue aprobada por el equipo de Canarias.

---

## Confirmación de Acciones

Se presentó el mecanismo de confirmación para acciones consideradas críticas dentro del sistema.

La propuesta fue validada para ser utilizada como comportamiento estándar en toda la plataforma.

---

## Jerarquía de Usuarios

Se presentó el esquema de creación de empleados según la jerarquía organizacional.

Quedó aprobada la siguiente estructura:

### Super Administrador

Puede crear:

* Gerentes.
* Administradores.
* Vendedores.
* Cobradores.

### Gerente

Puede crear:

* Administradores.
* Vendedores.
* Cobradores.

### Administrador

Puede crear:

* Vendedores.
* Cobradores.

Se confirmó que ningún usuario podrá crear perfiles con permisos superiores a los propios.

---

# Definiciones Funcionales Confirmadas

Durante la reunión quedaron registradas las siguientes definiciones.

## Flujo Comercial

Se confirmó que:

* La visita ambiental será realizada por el cobrador.
* La entrega del producto incluye la firma de la documentación correspondiente.
* La primera cuota será abonada durante la entrega del producto.
* Finalizada la entrega, la venta regresará al área administrativa para su validación final.
* El cierre definitivo de la venta será responsabilidad exclusiva del área administrativa.
* La comisión correspondiente al vendedor será acreditada únicamente cuando la venta haya sido cerrada administrativamente.

---

## Información de la Venta

Se solicitó incorporar dentro del detalle de venta:

* Dirección del cliente.
* Referencia telefónica.

---

## Modalidades de Pago

Cada venta deberá permitir configurar la frecuencia de pago.

Modalidades solicitadas:

* Diaria.
* Semanal.
* Quincenal.
* Mensual.

---

## Gestión de Clientes

Se acordó incorporar un resumen comercial dentro de la pantalla principal del cliente.

La vista deberá mostrar información relevante como:

* Estado de pago.
* Cantidad de cuotas pendientes.
* Cantidad de ventas activas.
* Cuota actual.
* Estado general del cliente.

Los detalles completos permanecerán disponibles dentro de la ficha individual.

---

## Búsquedas

Se solicitó incorporar búsqueda de clientes por domicilio.

---

## Historial Comercial

Se propuso incorporar un historial de comportamiento del cliente.

El mismo permitirá evaluar aspectos como:

* Cumplimiento de pagos.
* Cuotas atrasadas.
* Comportamiento histórico.
* Estado general del cliente.

Esta información servirá como apoyo para futuras decisiones comerciales.

---

## Reportes Gerenciales

Se solicitó incorporar un reporte mensual para gerencia que permita visualizar indicadores generales del negocio.

Entre ellos:

* Total cobrado.
* Pendiente de cobro.
* Productos vendidos.
* Estadísticas de cobranza.
* Indicadores comerciales.

Esta funcionalidad será considerada para futuras etapas del proyecto.

---

# Feedback del Cliente

El cliente manifestó conformidad con los avances presentados.

Se destacó especialmente:

* Organización del módulo de empleados.
* Gestión de zonas.
* Navegación entre perfiles.
* Validaciones visuales.
* Confirmaciones de acciones.
* Evolución general del sistema.

---

# Estado de Validación

## Aprobado

* Gestión de Empleados.
* Gestión de Zonas.
* Validaciones de formularios.
* Confirmaciones de acciones.
* Jerarquía de usuarios.
* Flujo comercial parcial.

---

## Pendiente

* Validación definitiva de visita ambiental.
* Cierre administrativo de ventas.
* Inicio del dominio de cobranzas.

---

# Próximos Pasos

## Equipo de Desarrollo

* Completar flujo comercial.
* Finalizar visita ambiental.
* Implementar cierre administrativo.
* Incorporar modalidades de pago.
* Desarrollar historial comercial del cliente.
* Iniciar el módulo de cobranzas.

---

## Cliente

* Continuar validando reglas operativas.
* Revisar futuras necesidades de reportes.
* Acompañar la validación de nuevas funcionalidades durante el Sprint 04.

---

**Resultado Final:** Sprint 03 validado por el cliente. Se aprobaron los módulos de Empleados y Zonas, las reglas generales de experiencia de usuario y las principales definiciones operativas del flujo comercial. Las etapas pendientes del circuito de ventas fueron replanificadas para el Sprint 04 junto con el inicio del dominio de cobranzas.