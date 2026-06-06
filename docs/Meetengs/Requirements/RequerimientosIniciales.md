# Reunión de Requerimientos Iniciales

## Información General

| Campo         | Valor                                                    |
| ------------- | -------------------------------------------------------- |
| Fecha         | 30/04/2026                                               |
| Hora          | 14:00 hs                                                 |
| Modalidad     | Google Meet                                              |
| Cliente       | Canarias S.R.L.                                          |
| Participantes | Ariel, Lucho, Martín, Ignacio, Nahuel, Orlando, Carolina |

---

# Objetivo

Realizar el relevamiento inicial de requerimientos para el sistema de gestión de ventas financiadas y cobranza.

---

# Contexto Operativo Relevado

## Flujo Comercial Actual

```text
Vendedor
    ↓
Administración
    ↓
Visita Ambiental
    ↓
Entrega del Producto
    ↓
Cobro Primera Cuota
```

### Detalle

* El vendedor registra la venta.
* Administración contacta al cliente.
* Se coordina visita ambiental y método de pago.
* Se valida la operación.
* Se entrega el producto.
* Se cobra la primera cuota.

---

# Reglas de Negocio Identificadas

## Política de Mora

* Si un cliente acumula 2 cuotas impagas se retira el producto.

## Restricción de Productos

* No se permite vender un segundo producto a un cliente salvo que tenga al menos el 80% del producto anterior cancelado.

## Concepto de "Plata en la Calle"

Representa:

* Productos entregados.
* Dinero pendiente de cobro.
* Ganancia proyectada.

---

# Operatoria de Stock

## Situación Actual

* No existe stock permanente.
* Las compras suelen realizarse jueves o viernes.
* Las entregas se realizan sábado o lunes.

## Productos Recuperados

* Los productos retirados por incumplimiento vuelven al inventario.
* Deben registrarse como productos usados.

---

# Gestión de Cobranza

## Zonas

### Ciudad

* Clientes atrasados aparecen nuevamente al día siguiente.

### Pueblos

* Los clientes son visitados en la siguiente recorrida disponible.

## Operatoria Diaria de Cobradores

* Ingreso aproximado: 11:00 hs.
* Entrega de dinero recaudado.
* Recepción de hoja de ruta impresa.
* Finalización aproximada: 18:00 hs.

---

# Necesidades Detectadas

* Digitalizar procesos actualmente gestionados en Excel.
* Evitar pérdida de información comercial.
* Generar reportes diarios imprimibles.
* Gestionar rutas y zonas de cobranza.
* Administrar productos recuperados.

---

# Estructura Organizacional

## Sociedades

### Canarias 1

* Rosario
* Responsable: Gustavo

### Canarias 2

* Cordón Industrial y alrededores
* Responsables: Gustavo, Lucho, Ariel

### Canarias Motos

* Responsables: Gustavo, Lucho, Ariel, Ignacio

### Canarias S.R.L.

* Responsables: Gustavo, Lucho, Ariel

### Consideraciones

* Cada sociedad posee su propia caja.
* Existen cuatro cajas independientes.

---

# Requerimientos Confirmados

* Gestión completa del flujo comercial.
* Registro de políticas de venta.
* Gestión de stock dinámico.
* Reportes diarios imprimibles.
* Gestión de zonas y cobradores.
* Soporte para múltiples sociedades y cajas.

---

# Decisiones Tomadas

* El sistema contemplará las cuatro sociedades.
* Cada sociedad tendrá caja independiente.
* Los reportes deberán ser imprimibles.
* Los productos recuperados volverán al stock como usados.

---

# Próximos Pasos

* Modelar el flujo operativo completo.
* Diseñar estructura de sociedades y cajas.
* Incorporar reglas de mora y restricciones de venta.
* Diseñar módulo de reportes diarios.

---

# Observaciones

* Existe una necesidad crítica de digitalización para evitar pérdida de información.
* La empresa ya dispone de infraestructura en la nube para alojar la solución.
