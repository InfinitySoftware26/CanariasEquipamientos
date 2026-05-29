# Canarias System — Reports API

# Objetivo

Documentar el módulo de reportes y dashboards del sistema.

El módulo será responsable de:

* métricas operativas
* balances financieros
* dinero en calle
* productividad vendedores
* productividad cobradores
* estadísticas generales

---

# Endpoint Base

```http id="jlwm35"
/api/v1/reports
```

---

# Roles Permitidos

| Rol     | Acceso   |
| ------- | -------- |
| ADMIN   | Completo |
| MANAGER | Completo |

---

# Endpoints

---

# Dashboard General

## Endpoint

```http id="jlwm36"
GET /reports/dashboard
```

---

# Información Incluida

* ventas día
* cobranzas día
* cuotas vencidas
* dinero calle
* entregas pendientes
* cierres pendientes

---

# Dashboard Vendedores

## Endpoint

```http id="jlwm37"
GET /reports/sellers
```

---

# Información

* ventas realizadas
* comisión generada
* ranking vendedores
* métricas mensuales

---

# Dashboard Cobradores

## Endpoint

```http id="jlwm38"
GET /reports/collectors
```

---

# Información

* cobranzas realizadas
* efectividad cobranza
* visitas fallidas
* cierres diarios

---

# Dinero en Calle

## Endpoint

```http id="jlwm39"
GET /reports/street-money
```

---

# Objetivo

Calcular deuda activa clientes.

---

# Query Params

| Parámetro | Tipo |
| --------- | ---- |
| societyId | uuid |
| zoneId    | uuid |

---

# Reporte Mora

## Endpoint

```http id="jlwm40"
GET /reports/overdue
```

---

# Información

* cuotas vencidas
* clientes morosos
* antigüedad deuda
* riesgo financiero

---

# Reporte Caja

## Endpoint

```http id="jlwm41"
GET /reports/cashflow
```

---

# Información

* ingresos
* egresos
* balances
* movimientos caja

---

# Exportaciones

## Formatos Futuros

* PDF
* Excel
* CSV

---

# Reglas Negocio

* reportes deberán respetar permisos
* filtrado por sociedad obligatorio
* información financiera auditada

---

# Seguridad

* JWT obligatorio
* acceso restringido

---

# Escalabilidad Futura

Preparado para:

* BI
* analytics
* dashboards tiempo real
* IA predictiva
* métricas avanzadas

---

# Estado Actual

Módulo aprobado para Fase 1.
