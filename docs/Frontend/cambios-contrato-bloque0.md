# Cambios de contrato del backend — Bloques 0, 0b y 0c

Para el equipo de frontend. Rama backend: `feat/bloque-0c`.
"Cruzado" = recurso de otra sociedad distinta de la del token.

## Rutas y métodos

| Antes | Ahora |
|---|---|
| `DELETE /staff/:id` (nunca existió; el front lo llama en `deactivateStaff`) | `PATCH /staff/:id/deactivate` |

## Códigos de respuesta

| Endpoint | Cambio |
|---|---|
| Todo endpoint por ID (sales, clients, products, suppliers, cashbox, receipts, reports PDF, notifications, staff, route-sheets, route-sheet-items, settlements, zones, installments, payments) | Recurso de otra sociedad → **404** (antes 200 o 403). SUPER_ADMIN ve todas las sociedades |
| `GET /clients/:id` | Inexistente → **404** (antes 200 vacío). ID no UUID → **400** |
| `PATCH /sales/:id/collector-documents` | Venta de otra sociedad → **404** (antes 403) |
| `PATCH /notification-deliveries/:id` | Notificación de otro usuario → **404** (antes 403) |
| `GET /route-sheets/:id` y demás rutas de hoja | Otra sociedad → **404** (antes 403) |
| `POST /cash-movements` | Caja cerrada → **400**. Caja de otra sociedad → 404 |
| `GET /cash-movements?cashboxId=` | `cashboxId` no UUID → **400**; caja de otra sociedad → 404 |
| Cualquier alta que viole unicidad (dos cajas abiertas, dos cierres del día, número de recibo, etc.) | **409** con `message: "La operación entra en conflicto con un registro existente"` (antes 500) |
| `POST /closures` | Si el cierre del día fue **rechazado**, ahora se puede cargar otro (antes 409) |

## Staff (`PATCH /staff/:id`, `PATCH /staff/:id/deactivate`)

- `role` ya no acepta `super_admin` → **400** (el SUPER_ADMIN solo se crea
  por `POST /staff/super-admin`).
- **Sobre uno mismo:** solo se pueden cambiar `name`, `phone` y `address`.
  Cambiar el propio `role`, `isActive` o `email` → **403**. Reenviar `role` o
  `email` con el **mismo** valor está permitido (el formulario actual los
  envía siempre).
- **Sobre otro:** solo se puede editar o desactivar a alguien de rol
  **estrictamente inferior** (SUPER_ADMIN exento) → si no, **403**. El rol
  nuevo debe ser uno que el actor puede crear (MANAGER: administrativo,
  vendedor, cobrador; ADMIN: vendedor, cobrador) → si no, **403**.
- Desactivarse a uno mismo → **403**.
- Ojo: el formulario envía `role` también al editar a otro. Para un ADMIN
  que edita a un vendedor está bien; el selector de roles debería mostrar
  solo los que el usuario puede asignar.
- `address` está en el DTO pero **la columna no existe** en STAFF: enviarlo
  hoy produce un error 500 (pendiente en backend).

## Sociedades

- `PATCH /societies/:id` (solo SUPER_ADMIN) ahora acepta `taxId` con formato
  `XX-XXXXXXXX-X` (400 si no); CUIT de otra sociedad → **409**.

## Ventas

- `PATCH /sales/:id/assign-collector`: cobrador inexistente o de otra
  sociedad → **404**; sin rol cobrador o inactivo → **400**.

## Payments

- `POST /payments/:id/applications` y `POST /payments` con `installmentId`:
  cuota de otra sociedad que el pago → **404**.

## Datos de respuesta

- **`costPrice`** ya no llega a **vendedor** ni **cobrador** en
  `GET /products`, `GET /products/:id`, `GET /sales/my` y `GET /sales/:id`
  (dentro de `products[].product`). La propiedad se omite, no viene `null`.
  Sigue llegando por `GET /sales/collector` (pendiente en backend).
