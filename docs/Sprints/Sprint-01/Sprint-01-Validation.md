# Sprint 01 Validation

## Información General

| Campo                           | Valor                        |
| ------------------------------- | ---------------------------- |
| Proyecto                        | Canarias System              |
| Sprint                          | Sprint 01                    |
| Fecha                           | 05/06/2026                   |
| Modalidad                       | Reunión de Validación y Demo |
| Participantes Cliente           | Ignacio, Lucho               |
| Participantes Canarias Software | Nahuel, Orlando              |

---

# Objetivo de la Reunión

Presentar los avances desarrollados durante el Sprint 01, validar la arquitectura inicial del sistema, la implementación de seguridad, la estructura de roles y obtener definiciones funcionales necesarias para continuar con el desarrollo del Sprint 02.

---

# Funcionalidades Presentadas

Durante la reunión se realizó una demostración de los componentes desarrollados durante el Sprint 01.

## Arquitectura Base

Se presentó la estructura general del sistema, explicando la organización modular tanto del frontend como del backend y la preparación de la plataforma para los futuros módulos de negocio.

## Seguridad

Se validaron los mecanismos de seguridad implementados:

* Autenticación mediante JWT.
* Manejo de sesiones mediante cookies seguras.
* Encriptación de credenciales.
* Protección de rutas y funcionalidades según permisos.

## Auditoría Inicial

Se informó que el sistema registra el usuario responsable de las acciones realizadas dentro de la plataforma.

Esta información permitirá incorporar en futuras etapas:

* Auditorías operativas.
* Historial de cambios.
* Métricas de uso.
* Seguimiento de actividades por usuario.

## Dashboards Iniciales

Se mostraron las primeras vistas correspondientes a cada perfil del sistema.

Las mismas representan la estructura base de navegación sobre la cual se incorporarán las funcionalidades de negocio durante los próximos sprints.

---

# Definiciones Funcionales Confirmadas

## Estructura de Roles

Quedó aprobada la siguiente estructura jerárquica.

### Super Admin

Responsabilidades:

* Acceso completo a todas las sociedades.
* Acceso a todas las cajas.
* Gestión integral del sistema.
* Creación de nuevos Super Administradores.
* Creación de Gerentes.

### Gerente

Responsabilidades:

* Acceso a las sociedades asignadas.
* Visualización de información operativa y gerencial.
* Creación de Administradores.
* Aprobación de descuentos especiales solicitados durante una venta.

### Administrador

Responsabilidades:

* Gestión completa de la operatoria de su sociedad.
* Gestión de clientes.
* Gestión de proveedores.
* Gestión de productos.
* Precarga de clientes.
* Registro de compras a proveedores.
* Control de stock.
* Gestión de movimientos de caja.
* Emisión de hojas de ruta.
* Validación de ventas.
* Administración de cobradores y vendedores pertenecientes a la sociedad.

### Cobrador

Responsabilidades:

* Recepción de hojas de ruta emitidas por administración.
* Registro de cobranzas.
* Posibilidad de cobrar clientes originalmente asignados a otras zonas.
* Rendición de dinero correspondiente a la sociedad operativa.
* Realizador de la visita ambiental.

Se confirmó que la administración podrá reasignar clientes entre zonas antes de emitir la hoja de ruta con el objetivo de optimizar los recorridos de cobranza.

### Vendedor

Responsabilidades:

* Acceso a la sociedad asignada.
* Registro de pre-ventas.
* Visualización del porcentaje de comisión mensual.

Se confirmó una comisión inicial del 10%.

---

# Definiciones Operativas

## Filtro por Sociedad

Se acordó implementar un selector de sociedad para aquellos usuarios con acceso a múltiples sociedades.

Aplicará inicialmente a:

* Super Administradores.
* Gerentes con más de una sociedad asignada.

Esta funcionalidad permitirá mantener la separación operativa y financiera entre sociedades.

---

## Aprobación de Descuentos

Se definió que cualquier descuento solicitado durante una venta deberá ser aprobado por el Gerente de la sociedad correspondiente antes de su aplicación.

---

## Dominio Corporativo

Se conversó sobre la necesidad de adquirir un dominio propio para la plataforma.

Se propuso evaluar opciones alineadas a la identidad de la empresa, por ejemplo:

* canarias-equipamientos.com.ar

Quedó pendiente relevar alternativas y costos para ser presentados en una próxima reunión.

---

# Feedback del Cliente

El cliente manifestó conformidad con la propuesta presentada.

Se destacó especialmente:

* La simplicidad de uso.
* La claridad de navegación.
* La estética general de la interfaz.
* La organización de los paneles por rol.

---

# Ajustes Solicitados

## Pantalla de Login

Se solicitaron los siguientes cambios visuales:

### Logo Corporativo

Reemplazar el identificador visual actual por el logotipo oficial de Canarias.

### Paleta de Colores

Modificar el fondo de la pantalla de acceso para utilizar una tonalidad más cercana al azul institucional de la empresa.

El cliente se comprometió a compartir el material gráfico correspondiente para su incorporación.

---

# Definiciones para Sprint 02

## Financiación

Se avanzó en la definición funcional del módulo de financiación.

### Requerimiento

La empresa trabaja con múltiples esquemas de financiación según el producto y la sociedad.

### Definición Aprobada

Se utilizará una entidad de financiación configurable desde el sistema.

Cada venta deberá asociarse a una financiación previamente configurada.

### Casos Habituales

Las financiaciones más utilizadas actualmente son:

* 24 cuotas semanales.
* 28 cuotas semanales.
* 32 cuotas semanales.

### Consideración Especial

La sociedad Canarias Motos utiliza financiaciones de mayor duración y en algunos casos esquemas mensuales.

La estructura propuesta deberá contemplar esta flexibilidad.

---

# Estado de Validación

## Aprobado

* Arquitectura base.
* Seguridad.
* Autenticación.
* Gestión de sesiones.
* Registro de auditoría inicial.
* Estructura de roles.
* Dashboards iniciales.
* Estrategia de separación por sociedades.

## Pendiente

* Definición de dominio corporativo.
* Recepción de identidad visual institucional.
* Continuación del relevamiento funcional correspondiente al Sprint 02.

---

# Próximos Pasos

## Equipo de Desarrollo

* Implementar ajustes visuales solicitados.
* Desarrollar módulo de clientes.
* Desarrollar módulo de productos.
* Desarrollar módulo de financiación.
* Desarrollar módulo de ventas.
* Implementar selector de sociedad.
* Analizar alternativas de dominio corporativo.

## Cliente

* Averiguar sobre dominio (hermano Ignacio).
* Compartir referencias de color corporativo.
* Validar alternativas de dominio propuestas.

---

**Resultado Final:** Sprint 01 validado por el cliente y aprobado para continuar con el desarrollo del Sprint 02.
