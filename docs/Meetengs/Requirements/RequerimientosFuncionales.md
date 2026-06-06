# Segunda Reunión de Requerimientos

## Información General

| Campo         | Valor                 |
| ------------- | --------------------- |
| Fecha         | 21/05/2026            |
| Hora          | 15:00 hs              |
| Modalidad     | Google Meet           |
| Cliente       | Canarias S.R.L.       |
| Participantes | Martín, Lucho, Nahuel |

---

# Objetivo

Completar el relevamiento funcional del sistema y validar procesos operativos específicos para los módulos comerciales.

---

# Definiciones Funcionales

## Portal de Vendedores

Cada vendedor deberá contar con acceso independiente al sistema.

### Funcionalidades

* Registro de ventas.
* Selección de cliente.
* Selección de producto.
* Cantidad de cuotas.
* Zona asignada.

### Indicadores

* Visualización de porcentaje de comisión.
* Acumulado mensual de ganancias.

---

# Flujo Comercial Validado

```text
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
```

## Administración

Debe poder:

* Aprobar o rechazar ventas.
* Registrar observaciones.
* Validar información obtenida durante la visita ambiental.

## Cobradores

Deben poder:

* Recibir ventas aprobadas.
* Confirmar entrega.
* Registrar cobro de primera cuota.
* Activar el plan de cuotas del cliente.

---

# Gestión de Visitas

## Visitas Frustradas

Se requiere registrar:

* Cliente ausente.
* Intentos de visita.
* Historial de visitas.

### Notificaciones

* Aviso automático a administración.
* Posibilidad futura de automatización de comunicaciones.

---

# Gestión de Productos

## Clasificación

Los productos podrán identificarse como:

* Stock normal.
* Producto recuperado / devolución.

## Costos

Cada producto deberá almacenar:

* Precio de venta.
* Precio de costo.

---

# Financiación

## Requisito Principal

La financiación debe poder configurarse:

* Globalmente.
* Individualmente por producto.

### Consideración

La configuración específica del producto deberá prevalecer sobre la configuración general.

---

# Gestión de Ganancias

Se definió inicialmente:

* Comisión estándar del vendedor: 10%.

La misma deberá ser configurable desde el sistema.

---

# Proveedores

## Reglas

* Un proveedor podrá abastecer múltiples sociedades.
* No existirá relación exclusiva proveedor-sociedad.

---

# Productos Recuperados

Cuando un producto sea retirado por incumplimiento:

* Volverá al stock normal.
* Se deberá conservar el historial financiero.
* La ganancia deberá calcularse considerando lo ya cobrado.

---

# Hojas de Ruta

## Organización

Las hojas de ruta se generarán:

* Por zona.
* Por sociedad.

## Asignación

Administración definirá el cobrador responsable antes de emitir la hoja de ruta.

### Motivo

Los cobradores pueden colaborar entre sí e intercambiar clientes durante una misma jornada.

---

# Notificaciones

## WhatsApp

Se manifestó interés por incorporar:

* Notificaciones automáticas.
* Recordatorios de pago.
* Comunicaciones operativas.

### Definición

La integración de WhatsApp se considerará un módulo adicional debido a sus costos de implementación y servicio.

## Alternativa Inicial

* Correo electrónico.

---

# Requerimientos Confirmados

* Portal independiente para vendedores.
* Validación administrativa de ventas.
* Gestión de visitas frustradas.
* Configuración flexible de financiación.
* Gestión de costos de productos.
* Gestión flexible de rutas y cobradores.
* Configuración de comisiones.

---

# Decisiones Tomadas

* WhatsApp será un módulo adicional.
* Los productos recuperados volverán al stock normal.
* Los proveedores podrán asociarse a múltiples sociedades.
* La asignación final de cobradores será responsabilidad de administración.

---

# Próximos Pasos

* Diseñar módulo de notificaciones.
* Incorporar precio de costo al modelo de datos.
* Diseñar flujo de validación de ventas.
* Documentar asignación de rutas y zonas.

---

# Observaciones

* Se enfatizó la importancia de transparentar costos de servicios externos.
* Se acordó realizar demostraciones funcionales cada 15 días.
