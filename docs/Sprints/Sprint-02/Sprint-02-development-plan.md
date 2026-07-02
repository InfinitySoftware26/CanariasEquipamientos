# Sprint 02 — Development Plan

# Objetivo

Construir la base operativa del dominio comercial de Canarias y comenzar a representar el flujo comercial dentro del sistema.

Objetivo funcional:

permitir iniciar una operación comercial, validar estados y preparar el circuito para futuras etapas de entrega y cobranzas.

---

# Estado del Plan

Resultado del Sprint:

🟡 Parcialmente alcanzado

Observación:

El objetivo original contemplaba avanzar hasta cierre administrativo y cuotas, pero durante la ejecución se priorizó consolidar el inicio del flujo comercial y la experiencia multi-sociedad.

---

# Alcance Planificado

Módulos incluidos:

- Auth
- Clients
- Sales
- Sale Validation
- Products
- Zones
- Staff
- Installments

---

# Flujo Funcional Planificado

SELLER

↓

Carga cliente + venta

↓

ADMIN

↓

Validación telefónica

↓

COLLECTOR

↓

Visita ambiental

↓

ADMIN

↓

Coordinación entrega

↓

COLLECTOR

↓

Entrega + firma contrato

↓

ADMIN

↓

Cierre administrativo

↓

Generación cuotas

---

# Flujo Alcanzado

Implementado y demostrado:

SELLER

↓

Preventa

↓

ADMIN

↓

Validación administrativa

↓

COLLECTOR

↓

Visita ambiental

↓

Aprobación / rechazo

Estado alcanzado:

✅ Hasta PENDING_ENVIRONMENTAL_VISIT

Observación:

Demostración realizada utilizando datos precargados mediante seeds.

---

# Entidades Involucradas

Existentes:

- clients
- sales
- staff
- societies
- clients_historial

Trabajadas durante Sprint 02:

- products
- sale_validations
- installments
- staff_societies
- zones

Estado:

🟡 Implementación parcial.

---

# Backend Tasks

## Implementado

### Auth
- soporte multi-sociedad;
- selector de contexto.

### Sales
- creación inicial de operación;
- estados iniciales.

### Sale Validation
- aprobación;
- rechazo;
- observaciones.

### Products
- catálogo inicial.

### Installments
- estructuras base.

### Societies
- soporte de segmentación.

---

## Preparado para integración

- zones;
- staff_zones;
- staff_societies;
- financiación.

---

# Frontend Tasks

## Implementado

### Auth
- login;
- JWT;
- selector sociedad.

### Dashboard
- SUPER_ADMIN
- ADMIN
- SELLER
- COLLECTOR

### Sales
- preventa;
- selección cliente;
- selección producto.

---

## Pendiente

### Clients
- ABM completo.

### Zones
- ABM.

### Installments
- interfaz.

### Sale Validation
- formularios completos.

---

# Integraciones

Integradas:

- Auth API
- Sales API
- Products API

Preparadas:

- Clients API
- Zones API
- Staff API

---

# Definition of Done

Una funcionalidad se considera finalizada cuando:

- implementación validada;
- permisos aplicados;
- documentación actualizada;
- pruebas realizadas;
- despliegue disponible.

---

# Resultado

Sprint 02 permitió:

✅ Consolidar operación multi-sociedad  
✅ Validar dashboards por rol  
✅ Construir preventa  
✅ Validar inicio del flujo comercial  

Pendiente:

- entrega;
- cuotas;
- cobranzas;
- cierre administrativo.

---

# Referencias

- Sprint-02.md
- Sprint-02-Validation.md
- CHANGELOG.md
- Commercial-Flow.md