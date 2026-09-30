# Business Rules — Reportes

## 1. Objetivo

El módulo de reportes permite consultar y exportar información consolidada de las principales operaciones del sistema.

Los reportes deben utilizar la información registrada por los módulos operativos correspondientes y respetar la sociedad activa y los permisos del usuario.

El módulo de reportes no debe duplicar ni modificar la lógica de negocio de los módulos origen.

---

## 2. Reportes definidos

El sistema contempla los siguientes reportes:

1. Reporte de Caja.
2. Reporte de Hoja de Ruta.
3. Historial de Cliente.
4. Reporte de Venta.

Además, el sistema dispone actualmente de reportes operativos adicionales:

* Cobranzas.
* Cuotas pendientes.
* Visitas fallidas.
* Movimientos de caja.
* Pagos a proveedores.
* Cierre de caja.
* Recibos.

---

## 2.1. Reportes centrales y reportes contextuales

El sistema diferencia entre reportes centrales y reportes contextuales.

### Reportes centrales

Los reportes centrales se encuentran disponibles desde el módulo:

```text
/reports
```

Su objetivo es permitir la descarga de información consolidada sin necesidad de ingresar previamente a una operación específica.

Actualmente se contemplan:

* Cobranzas.
* Cuotas pendientes.
* Visitas fallidas.
* Movimientos de caja.
* Pagos a proveedores.

Los reportes centrales pueden utilizar filtros generales, como rango de fechas, cuando el reporte lo permita.

---

### Reportes contextuales

Los reportes contextuales se generan desde el módulo donde se encuentra la operación correspondiente.

El acceso al reporte debe estar disponible mediante un botón o acción contextual dentro del registro o detalle correspondiente.

Se contemplan accesos contextuales desde:

* Hoja de Ruta.
* Caja / Cierre de Caja.
* Recibos.
* Movimientos de Caja.

La finalidad es que el usuario pueda obtener el documento relacionado con la operación que está consultando sin tener que abandonar el contexto actual para ingresar al módulo general de reportes.

### Regla

La ubicación visual del acceso al reporte no determina necesariamente el módulo backend que genera el documento.

El módulo `reports` puede centralizar la generación de documentos, mientras que Frontend puede ofrecer el acceso desde el módulo operativo correspondiente.

---

## 3. Reporte de Caja

El reporte de caja debe permitir consultar información relacionada con:

* movimientos;
* cobros;
* cierres;
* diferencias;
* saldo de caja;
* variación correspondiente al período.

Debe respetar la sociedad activa y los permisos del usuario.

El cierre de una caja puede contar con un documento contextual en PDF desde el detalle correspondiente.

---

## 4. Reporte de Hoja de Ruta

El reporte de Hoja de Ruta debe representar las actividades asociadas a una hoja de ruta determinada.

La información debe provenir de la hoja de ruta y sus ítems registrados.

Debe contemplar como mínimo:

* cliente;
* tipo de actividad;
* cuota cuando corresponda;
* resultado;
* monto cobrado cuando corresponda;
* observaciones.

El documento puede generarse desde el detalle de la Hoja de Ruta mediante una acción contextual.

El reporte debe respetar la sociedad y los permisos asociados al usuario.

---

## 5. Historial de Cliente

El historial de cliente debe permitir consultar las operaciones relevantes asociadas a un cliente.

Entre la información contemplada se encuentran:

* ventas;
* financiación;
* cuotas;
* pagos;
* situaciones relevantes de cobranza;
* retiro cuando corresponda.

El contenido exacto del historial debe alinearse con los eventos y operaciones realmente registrados por los módulos correspondientes.

No debe generar información independiente de los registros existentes en el sistema.

---

## 6. Reporte de Venta

El reporte de venta debe permitir consultar la información relevante de una operación comercial.

Debe contemplar:

* cliente;
* producto;
* condiciones de financiación;
* cuotas;
* pagos;
* estado de la venta;
* información correspondiente al proceso comercial.

La información debe obtenerse de los registros reales de la venta y de los módulos relacionados.

---

## 7. Cobranzas

El reporte de cobranzas permite obtener información de pagos registrados dentro de un período determinado.

Debe contemplar:

* fecha de pago;
* cliente;
* venta;
* empleado responsable;
* monto;
* método de pago.

Puede utilizar un rango de fechas.

La sociedad se determina mediante el contexto autenticado del usuario.

---

## 8. Cuotas Pendientes

El reporte de cuotas pendientes debe mostrar las cuotas que permanecen pendientes dentro de la sociedad activa.

Debe contemplar:

* cliente;
* venta;
* número de cuota;
* fecha de vencimiento;
* importe;
* importe pagado;
* estado.

La información debe provenir del módulo de cuotas.

---

## 9. Visitas Fallidas

El reporte de visitas fallidas debe permitir consultar las visitas de cobranza que no tuvieron un resultado exitoso.

Debe contemplar:

* cliente;
* cobrador;
* motivo;
* número de intento;
* fecha de reprogramación;
* fecha de creación.

La información debe provenir del registro de visitas fallidas.

---

## 10. Movimientos de Caja

El reporte de movimientos de caja debe permitir consultar los movimientos financieros registrados.

Debe contemplar:

* fecha;
* tipo de movimiento;
* concepto;
* importe;
* caja asociada.

Puede utilizar un rango de fechas.

Los movimientos deben respetar las reglas de auditoría y trazabilidad definidas por el módulo de Caja.

Además, desde el módulo de Movimientos de Caja debe existir un acceso contextual a las acciones de reporte disponibles para la información consultada.

---

## 11. Pagos a Proveedores

El reporte de pagos a proveedores debe permitir consultar los pagos realizados a proveedores.

Debe contemplar:

* fecha de pago;
* proveedor;
* importe;
* método de pago;
* observaciones.

Puede utilizar un rango de fechas.

---

## 12. Recibos

Los recibos corresponden a documentos vinculados a un pago determinado.

El usuario debe poder acceder al recibo desde el contexto correspondiente de la operación.

El documento debe identificar el pago al que pertenece y ser generado a partir de la información registrada por el módulo de recibos.

El acceso contextual se realiza desde el módulo correspondiente y no requiere que exista una tarjeta independiente para cada recibo dentro del centro general de reportes.

---

## 13. Formatos

Los formatos disponibles dependen de cada reporte.

Actualmente se utilizan:

* PDF.
* Excel.

No todos los reportes deben ofrecer necesariamente ambos formatos.

La disponibilidad del formato debe estar definida por el endpoint correspondiente.

---

## 14. Sociedad

Todos los reportes deben respetar la sociedad activa del usuario.

Cuando el reporte requiere `societyId`, este debe obtenerse desde el contexto autenticado del usuario.

El cliente no debe enviar manualmente un `societyId` para seleccionar otra sociedad cuando el endpoint utiliza la sociedad asociada al usuario autenticado.

---

## 15. Permisos

El acceso a los reportes debe respetar los roles definidos por el sistema.

El módulo utiliza:

* `JwtAuthGuard`
* `RolesGuard`
* `SocietyGuard`

Los permisos específicos pueden variar según el tipo de reporte.

La Hoja de Ruta permite además acceso al rol `COLLECTOR`.

---

## 16. Fuente de información

Los reportes deben utilizar como fuente los datos registrados por los módulos operativos.

El módulo de reportes no debe mantener una copia independiente de:

* ventas;
* pagos;
* cuotas;
* cajas;
* movimientos;
* hojas de ruta;
* visitas;
* recibos.

Las consultas deben realizarse sobre los servicios y registros correspondientes.

---

## 17. Consistencia

Los cálculos y valores mostrados en los reportes deben ser consistentes con los módulos de origen.

No se deben implementar cálculos paralelos que puedan generar diferencias con:

* Caja;
* Cobranzas;
* Cuotas;
* Pagos;
* Hojas de Ruta;
* Visitas Fallidas;
* Pagos a Proveedores;
* Recibos.

---

## 18. Auditoría

Los reportes financieros deben respetar la trazabilidad de las operaciones originales.

El reporte no modifica información operativa.

La generación de un reporte es una operación de consulta/exportación y no debe alterar:

* pagos;
* movimientos;
* cierres;
* cuotas;
* hojas de ruta;
* ventas;
* recibos.

---

## 19. Principios

* Respetar la sociedad activa.
* Respetar los permisos del usuario.
* Utilizar datos reales del sistema.
* Mantener consistencia con los módulos de origen.
* Mantener trazabilidad de la información financiera.
* Permitir acceso central cuando se trate de información consolidada.
* Permitir acceso contextual cuando el documento pertenece a una operación específica.
* Evitar duplicar lógica de negocio.
* No generar información que no exista en los registros del sistema.
