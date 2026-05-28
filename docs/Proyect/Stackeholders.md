
# Stakeholders del Negocio

## Administración

### Descripción

Rol operativo y administrativo principal del sistema.

Es el responsable de validar, coordinar y supervisar gran parte de la operatoria diaria.

---

### Responsabilidades

* Aprobar ventas
* Validar clientes
* Realizar visitas ambientales
* Gestionar productos
* Gestionar proveedores
* Gestionar financiación
* Administrar cajas
* Asignar hojas de ruta
* Supervisar cobradores
* Validar cierres diarios

---

### Accesos Principales

* Dashboard administrativo
* Gestión de clientes
* Gestión de ventas
* Gestión de cobranzas
* Gestión de stock
* Gestión de productos
* Gestión de hojas de rutas
* Configuración
* Reportes
* Caja
* Usuarios y permisos

---

### Nivel de Permiso

ALTO

---

# Vendedores

### Descripción

Usuarios encargados de captar clientes y registrar ventas financiadas.

---

### Responsabilidades

* Registrar clientes
* Registrar ventas
* Asociar productos
* Consultar estado de ventas
* Consultar comisiones
* Consultar objetivos mensuales

---

### Accesos Principales

* Dashboard vendedor
* Fromulario clientes
* Formulario de ventas
* Clientes propios
* Historial de ventas
* Métricas personales

---

### Nivel de Permiso

MEDIO

---

# Cobradores

### Descripción

Usuarios responsables de la cobranza diaria y entrega de productos.

---

### Responsabilidades

* Ejecutar hoja de ruta
* Registrar cobros
* Confirmar entregas
* Registrar visitas frustradas
* Realizar cierre diario
* Reportar incidencias

---

### Accesos Principales

* Dashboard cobrador
* Hoja de ruta
* Clientes
* Cobros
* Entregas
* Cierre diario

---

### Nivel de Permiso

OPERATIVO

---

# Gerencia

### Descripción

Usuarios enfocados en supervisión financiera y análisis general del negocio.

---

### Responsabilidades

* Supervisión general
* Seguimiento financiero
* Evaluación de KPIs
* Análisis de rentabilidad
* Control operativo

---

### Accesos Principales

* Dashboard ejecutivo
* Reportes financieros
* KPIs
* Estadísticas generales
* Estado de cajas

---

### Nivel de Permiso

ESTRATÉGICO

---

# Stakeholders Técnicos

## Tech Lead

### Responsabilidades

* Arquitectura
* Definiciones técnicas
* Revisión de código
* QA funcional
* Coordinación técnica
* Roadmap técnico
* Documentación

---

## Backend Developer

### Responsabilidades

* APIs
* Base de datos
* Reglas de negocio
* Seguridad
* Integraciones
* Performance

---

## Frontend Developer

### Responsabilidades

* Interfaces
* Formularios
* Dashboards
* UX/UI
* Integración APIs
* Responsive design

---

## QA / Testing

### Responsabilidades

* Validación funcional
* Testing de flujos
* Reporte de bugs
* Validación de aceptación

---

# Stakeholders Externos

## Cliente — Canarias S.R.L.

### Participación

* Validación funcional
* Revisión de demos
* Definición de reglas de negocio
* Priorización de funcionalidades

---

# Relación Operativa Entre Roles

```text
Vendedor
   ↓
Administración
   ↓
Cobrador
   ↓
Administración
   ↓
Gerencia
```

---

# Principios de Acceso

El sistema implementará:

* Roles
* Permisos
* Segmentación por sociedad
* Restricción de accesos
* Auditoría operativa
* Trazabilidad de acciones

---

# Observaciones

La operatoria del sistema depende fuertemente de:

* Roles diferenciados
* Flujo jerárquico
* Validaciones administrativas
* Segmentación operativa por sociedad

Por este motivo, la arquitectura deberá contemplar permisos y restricciones desde la fase inicial del proyecto.
