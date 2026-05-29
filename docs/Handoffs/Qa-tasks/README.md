# Sales UI

# Objetivo

Permitir registrar ventas desde el dashboard vendedor.

---

# Pantallas

- SalesPage
- CreateSaleModal
- SaleDetailsPage

---

# Componentes

- SalesTable
- CreateSaleForm
- InstallmentsPreview
- ProductSelector
- CustomerSelector

---

# Validaciones UI

- cliente requerido
- producto requerido
- cuotas válidas
- monto > 0

---

# Estados

## Loading

- submit loading
- table loading

---

## Errors

- cliente inexistente
- error servidor
- producto inválido

---

# Integración API

## POST /sales

Registrar venta.

---

## GET /products

Listado productos.

---

## GET /customers

Listado clientes.

---

# Zustand Store

## sales.store.ts

Estados:

- sales
- selectedSale
- loading
- filters

---

# Responsive

La pantalla deberá funcionar:

- desktop
- tablet

---

# Observaciones Técnicas

- utilizar react-hook-form
- utilizar zod
- evitar lógica negocio en componentes