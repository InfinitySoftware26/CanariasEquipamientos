# Sprint 02 — Test Cases

## Objetivo

Validar el correcto funcionamiento del flujo comercial y los permisos asociados a cada rol.

---

# Módulo Auth

## AUTH-001

Login válido.

Resultado esperado:

* acceso permitido
* JWT generado

---

## AUTH-002

Login inválido.

Resultado esperado:

* acceso denegado

---

## AUTH-003

SUPER_ADMIN con múltiples sociedades.

Resultado esperado:

* visualiza selector de sociedad

---

## AUTH-004

MANAGER con múltiples sociedades.

Resultado esperado:

* visualiza selector de sociedad

---

# Módulo Clients

## CLIENT-001

Crear cliente válido.

Resultado esperado:

* cliente registrado

---

## CLIENT-002

DNI duplicado.

Resultado esperado:

* error validación

---

# Módulo Products

## PRODUCT-001

Listar productos activos.

Resultado esperado:

* productos visibles

---

## PRODUCT-002

Producto inactivo.

Resultado esperado:

* no aparece en ventas nuevas

---

# Módulo Zones

## ZONE-001

Crear zona.

Resultado esperado:

* zona registrada

---

## ZONE-002

Nombre duplicado dentro de misma sociedad.

Resultado esperado:

* rechazo

---

# Módulo Staff

## STAFF-001

Asignar usuario a zona.

Resultado esperado:

* asignación registrada

---

## STAFF-002

Asignar usuario a múltiples sociedades.

Resultado esperado:

* asignación correcta

---

# Módulo Sales

## SALE-001

SELLER crea venta.

Resultado esperado:

* venta creada
* estado PENDING_VALIDATION

---

## SALE-002

Creación venta genera cliente.

Resultado esperado:

* cliente asociado correctamente

---

## SALE-003

ADMIN aprueba venta.

Resultado esperado:

* estado APPROVED

---

## SALE-004

ADMIN rechaza venta.

Resultado esperado:

* estado REJECTED

---

## SALE-005

ADMIN realiza cierre administrativo.

Resultado esperado:

* estado CLOSED

---

# Módulo Sale Validation

## VALIDATION-001

Registrar validación.

Resultado esperado:

* validación almacenada

---

## VALIDATION-002

Registrar observación.

Resultado esperado:

* observación visible

---

# Módulo Installments

## INSTALLMENT-001

Venta cerrada.

Resultado esperado:

* cuotas generadas

---

## INSTALLMENT-002

Venta rechazada.

Resultado esperado:

* no genera cuotas

---

# Permisos

## PERMISSION-001

SELLER intenta aprobar venta.

Resultado esperado:

* acceso denegado

---

## PERMISSION-002

COLLECTOR intenta cerrar venta.

Resultado esperado:

* acceso denegado

---

## PERMISSION-003

MANAGER consulta información global.

Resultado esperado:

* acceso permitido

---

## PERMISSION-004

SUPER_ADMIN accede a cualquier sociedad.

Resultado esperado:

* acceso permitido

---

# Estado

Documento vigente Sprint 02.
