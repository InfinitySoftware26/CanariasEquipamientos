# Plan de cierre funcional y experiencia de usuario — Canarias System

## 1. Objetivo

Cerrar el proyecto en una ventana realista de 7 días dejando una versión funcional, segura, consistente y usable para negocio, priorizando los flujos críticos del dominio y evitando dispersión de trabajo en módulos no esenciales.

Este documento complementa la planificación de sprints y corrige la realidad operativa detectada en los ciclos anteriores:

- el backend ya tiene una base modular y funcional importante
- el frontend está integrado parcialmente
- existen inconsistencias entre el dominio planificado y lo realmente entregado
- el riesgo real está en la integración y en la experiencia de uso, no en la arquitectura base

---

## 2. Principio rector

No vamos a cerrar “todo el roadmap”.
Vamos a cerrar “el negocio que realmente mueve el sistema”:

1. Venta comercial
2. Validación administrativa
3. Visita ambiental / entrega
4. Cobranza y cuotas
5. Hoja de ruta
6. Cierre operativo
7. Reportes funcionales mínimos
8. Seguridad, permisos y UX consistente

Todo lo demás queda post-release o segunda fase.

---

## 3. Alcance mínimo viable para entrega

### 3.1 Módulos críticos

- Auth / multi-sociedad
- Clients
- Sales
- Installments
- Payments
- Route Sheets
- Failed Visits
- Cashbox / Cash Movements
- Reports básicos
- Permissions y roles

### 3.2 Módulos no críticos para esta entrega

- Notificaciones avanzadas
- User configurations complejas
- Personalización visual extensa
- Reportes gerenciales avanzados
- Mejoras de UX no funcionales
- Funcionalidades de “pulido” que no impactan el negocio

---

## 4. Flujo comercial principal

### 4.1 Flujo de venta

#### Actor: vendedor

1. Login en sistema
2. Selección de sociedad activa
3. Acceso al dashboard y listado de clientes
4. Registrar cliente o reutilizar uno existente
5. Seleccionar producto
6. Completar datos operativos de la venta
7. Definir cantidad de cuotas y frecuencia de pago
8. Confirmar preventa / venta
9. Queda en estado pendiente de validación administrativa

#### Validación

- Administración revisa la venta
- Aprueba o rechaza
- Puede dejar observaciones
- El vendedor puede ver la actualización del estado

#### Estado objetivo

- PENDING_ADMIN_VALIDATION
- PENDING_ENVIRONMENTAL_VISIT
- PENDING_DELIVERY
- DELIVERED
- CLOSED

### 4.2 Reglas de negocio clave

- Toda venta requiere cliente válido
- La venta debe pertenecer a una sociedad activa
- La cantidad de cuotas no puede exceder la configuración financiera
- La comisión del vendedor solo se acredita cuando la venta queda cerrada administrativamente
- La venta rechazada mantiene historial de validaciones
- La cuota inicial y la primera fecha de vencimiento deben quedar claramente visibles al usuario

### 4.3 UX requerida

- Mostrar nombre completo del cliente durante la carga
- Mostrar resumen de venta antes de confirmar
- Mostrar errores claros para cuotas inválidas o productos sin stock
- No permitir acciones de administración si la venta no está en el estado correcto
- Mantener trazabilidad visual de cada paso del flujo

---

## 5. Flujo de cobranza y cuotas

### 5.1 Flujo de cuotas

1. La venta aprobada genera cuotas automáticas
2. Cada cuota tiene:
   - monto
   - vencimiento
   - estado
   - saldo pendiente
   - cliente y sociedad
3. El cobrador y la administración pueden consultar el detalle
4. El cobro parcial mantiene un historial válido y evita inconsistencias

### 5.2 Registro de cobro

#### Actor: cobrador

1. Selecciona cuota a cobrar
2. Ingresa monto
3. Selecciona método de pago
4. Valida si el cobro supera el saldo pendiente
5. Guarda el pago
6. El sistema actualiza la cuota y su saldo

### 5.3 Reglas críticas

- No se puede cobrar más del saldo pendiente
- El cobro debe estar asociado a la sociedad correcta
- Los pagos deben quedar vinculados a cuota, cliente y cobrador
- El estado de la cuota debe actualizarse automáticamente
- El movimiento debe quedar auditable

### 5.4 UX requerida

- Validar monto antes de enviar
- Mostrar saldo restante y monto cobrado
- Mostrar errores explícitos si el importe es inválido
- Evitar formularios ambiguos o con campos no usados
- Confirmar acción crítica antes de guardar

---

## 6. Flujo de visitas y entrega

### 6.1 Visita ambiental

#### Actor: cobrador

- Recorre el domicilio del cliente
- Registra resultado de la visita
- Puede aprobar o rechazar
- Registra observaciones relevantes
- La operación debe quedar visible para administración

### 6.2 Entrega del producto

#### Actor: cobrador

- Verifica que el cliente recibe el producto
- Registra entrega
- Requiere documentación asociada
- La venta queda en estado entregado

### 6.3 Cierre administrativo

#### Actor: administración

- Revisa documentación
- Confirma cierre final
- La venta queda cerrada y habilita la liquidación y la comisión

### 6.4 Reglas de negocio

- El cierre final no puede hacerse sin la documentación mínima requerida
- El contrato firmado es la condición principal
- El DNI y comprobante pueden completarse luego, pero la venta no debe quedar cerrada sin la documentación mínima
- Los cambios de estado deben estar protegidos por permisos

### 6.5 UX requerida

- Mostrar estados sin ambigüedad
- Botones de acción según rol y estado actual
- Evitar acciones ocultas o no autorizadas
- Usar confirmaciones visuales para decisiones críticas

---

## 7. Flujo de hojas de ruta y cobranzas

### 7.1 Objetivo operacional

Organizar la jornada del cobrador respecto a:

- cuotas pendientes
- entregas pendientes
- clientes asignados
- zona operativa
- fecha de recorrido

### 7.2 Funcionalidad mínima

- Crear hoja de ruta
- Listar hojas por sociedad/rol
- Ver detalle con clientes y cuotas
- Cambiar estado de la hoja
- Marcar resultado de cada item
- Ver historial del recorrido

### 7.3 Reglas críticas

- Un cobrador no puede tener dos hojas activas para la misma zona y fecha
- La hoja debe respetar la sociedad del usuario
- Un item debe estar asociado a un cliente/venta/cuota válidos
- El estado del item debe reflejar si fue cobrado, fallido o pendiente

### 7.4 UX requerida

- Mostrar una vista clara por “hoy / pendientes / completadas”
- Reducir la carga cognitiva del cobrador
- Mostrar monto, cliente, dirección y próximo vencimiento sin requerir demasiados clics
- Agrupar tareas por prioridad y zona

---

## 8. Flujo de reportes mínimos

### 8.1 Reportes obligatorios para entrega

- cobro por rango de fechas
- cuotas pendientes
- visitas fallidas
- movimientos de caja
- hoja de ruta por cobrador
- cierre diario

### 8.2 Reglas necesarias

- el usuario solo ve reportes de su sociedad
- los reportes deben respetar filtros por fecha y rol
- la descarga PDF/Excel debe ser clara y confiable
- las exportaciones no pueden devolver data vacía sin explicación

### 8.3 UX requerida

- filtros simples y claros
- mensajes de error si falta rango o no hay datos
- instrucciones de uso en la propia pantalla
- mostrar estados “próximamente” solo para módulos no críticos

---

## 9. Seguridad y permisos

### 9.1 Reglas mínimas

- toda ruta privada requiere autenticación
- cada rol tiene permisos estrictos
- los usuarios no pueden acceder a data de otra sociedad
- los end-points críticos deben validar permisos en backend, no solo en frontend
- los cambios sensibles deben tener confirmación visual

### 9.2 Roles requeridos

- SUPER_ADMIN
- MANAGER
- ADMIN
- SELLER
- COLLECTOR

### 9.3 UX de seguridad

- no mostrar acciones para las que no se tiene permiso
- mostrar mensajes claros y no tecnicistas
- no exponer IDs o información sensible innecesaria
- evitar que la UI permita ejecutar acciones que el backend rechaza

---

## 10. Criterios de calidad para la entrega

### 10.1 Funcionalidad

- cada flujo principal se ejecuta con éxito
- no hay estados inconsistentes
- la data se mantiene coherente entre frontend y backend
- la validación por permisos funciona en la práctica

### 10.2 Seguridad

- no hay acceso cruzado entre sociedades
- las rutas protegidas responden correctamente
- los formularios validan entradas y montos
- no hay llamadas inseguras a endpoints no autorizados

### 10.3 UX

- el usuario sabe en qué estado está cada operación
- los errores son claros y accionables
- el sistema guía al usuario sin ambigüedad
- la navegación es de baja fricción

### 10.4 Mantenibilidad

- el código sigue las convenciones del proyecto
- los nombres de variables y endpoints son consistentes
- las reglas de negocio quedan en el backend y no dependen del frontend
- el proyecto queda listo para soportar una segunda iteración

---

## 11. Riesgos reales detectados

### 11.1 Inconsistencias del dominio

- algunos módulos ya existen y otros no quedaron conectados del todo
- el flujo comercial fue validado parcialmente y quedó incompleto en pasos clave
- la conexión efectiva entre venta, cuotas y cobranza necesita validación real

### 11.2 Inconsistencias API/Frontend

- el frontend puede estar esperando un contrato distinto al del backend
- algunos componentes usan información que no existe en la respuesta real
- hay pantallas marcadas como “próximamente” aunque el negocio las necesita ya

### 11.3 Riesgo de entrega

- si se intenta cubrir todo el roadmap, el equipo se dispersa
- la única estrategia viable es cerrar el core y congelar lo no esencial

---

## 12. Plan de ejecución de 7 días

### Día 1 — Diagnóstico final y alcance

- freeze de scope
- lista de blockers por módulo
- prioridad P0/P1/P2
- revisión de flujos críticos

### Día 2 — Backend: contract consistency

- revisar DTOs, enums, permisos, salida de endpoints
- normalizar respuestas de ventas, cuotas, pagos y route-sheets
- corregir inconsistencias de sociedades y roles

### Día 3 — Core business flow: ventas + cuotas + pagos

- terminar flujo de venta
- validar cierre administrativo
- imputación de cuotas
- registro de pagos

### Día 4 — Route sheets + failed visits + delivery

- hoja de ruta
- visitas fallidas
- resultado del cobrador
- cierre operativo

### Día 5 — Frontend integration

- conectar pantallas clave al backend real
- corregir filtros, estados y validaciones de UI
- eliminar botones o rutas inválidas

### Día 6 — QA + negocio

- pruebas end-to-end por flujo
- validación por rol
- revisión de permisos y seguridad
- ajuste de UX por feedback real

### Día 7 — Release candidate

- hardening final
- demo con datos reales
- release checklist
- congelar cambios no críticos

---

## 13. Checklist final de releasable

### Backend

- [ ] ventas funcionales
- [ ] cuotas correctas
- [ ] pagos con validación de saldo
- [ ] hojas de ruta generadas y visibles
- [ ] estados correctos por rol
- [ ] permisos por sociedad
- [ ] reportes mínimos operativos

### Frontend

- [ ] flujo completo de venta
- [ ] flujo de cobranza
- [ ] flujo de hoja de ruta
- [ ] validación de errores claros
- [ ] navegación segura por rol
- [ ] UX consistente y sin acciones rotas

### Diagnóstico de negocio

- [ ] usuario entiende cada paso
- [ ] la operación no requiere soporte para usar el sistema
- [ ] los datos se entienden en todo momento
- [ ] los errores permanecen accionables

---

## 14. Conclusión

El proyecto ya tiene la esencia de un sistema funcional y escalable, pero no está listo para entregarse “tal cual”.

La diferencia entre un proyecto que se entrega bien y uno que fracasa es precisamente esta:

- cerrar primero el negocio crítico
- dejar consistentes los flujos reales
- reforzar seguridad y experiencia de usuario
- congelar todo lo no esencial

Con esta estrategia, el proyecto puede pasar de “avanzado y parcialmente inconsistente” a “entregable y profesional” en una semana de trabajo disciplinado.
