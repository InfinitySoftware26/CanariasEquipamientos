# Canarias System — Business Rules — Financiación

# Objetivo

Definir las reglas de negocio vinculadas a financiación, cuotas, intereses y condiciones comerciales.

---

# Descripción General

El sistema permitirá gestionar ventas financiadas mediante planes de cuotas configurables.

La financiación constituye uno de los módulos críticos del negocio.

---

# Componentes de Financiación

* monto financiado
* interés
* cantidad cuotas
* frecuencia cuotas
* mora
* deuda restante
* pagos parciales

---

# Frecuencia de Cuotas

| Tipo   | Descripción      |
| ------ | ---------------- |
| DAILY  | Cuotas diarias   |
| WEEKLY | Cuotas semanales |

---

# Reglas Generales

---

## BR-FINANCE-001

Toda venta financiada debe generar cuotas automáticamente.

---

## BR-FINANCE-002

Las cuotas deben calcularse según el plan configurado.

---

## BR-FINANCE-003

La financiación puede variar según producto.

---

## BR-FINANCE-004

El administrador puede modificar condiciones financieras.

---

## BR-FINANCE-005

El sistema debe calcular automáticamente:

* saldo pendiente
* deuda restante
* interés acumulado
* cuotas pagadas

---

# Mora

---

## BR-FINANCE-006

Las cuotas vencidas generan mora automáticamente.

---

## BR-FINANCE-007

La mora puede generar restricciones operativas.

---

## BR-FINANCE-008

Clientes con mora crítica podrán bloquear nuevas ventas.

---

# Refinanciación

---

## BR-FINANCE-009

Las refinanciaciones deberán generar nuevo cronograma.

---

## BR-FINANCE-010

Toda refinanciación debe quedar auditada.

---

# Pagos Parciales

---

## BR-FINANCE-011

El sistema debe permitir pagos parciales.

---

## BR-FINANCE-012

Los pagos parciales impactan saldo pendiente.

---

# Modelo Implementado — Configuración / Plan / Promoción

El módulo de financiación (`financing`) reemplaza el esquema previo de 3 tasas fijas
(3/6/9 cuotas) por 3 entidades independientes y componibles.

## Entidades

| Entidad                  | Responsabilidad                                                      |
| ------------------------ | --------------------------------------------------------------------- |
| `FinancingConfiguration` | Tasa base de financiación (`financingRate`), global o por producto   |
| `FinancingPlan`          | Esquema de cuotas: cantidad + frecuencia de pago, vinculado a una config |
| `Promotion`              | Ajuste opcional sobre la tasa (descuento o recargo), vinculado o no a un plan |

---

## BR-FINANCE-013

Toda `FinancingConfiguration` pertenece a una única sociedad (`societyId`) y define
una tasa base (`financingRate`) que puede aplicarse:

* de forma global (`isGlobal = true`) a todos los productos de la sociedad, o
* a un subconjunto de productos específicos (`isGlobal = false` + relación M2M).

---

## BR-FINANCE-014

Todo `FinancingPlan` debe estar vinculado a una `FinancingConfiguration` existente
de la misma sociedad. Define la cantidad de cuotas (`installmentsCount`) y la
frecuencia de pago (`daily`, `weekly`, `biweekly`, `monthly`).

---

## BR-FINANCE-015

Una `Promotion` puede:

* estar vinculada a un `FinancingPlan` puntual, o
* ser independiente (aplicando `isGlobal`/`productIds` propios cuando no depende de un plan).

---

## BR-FINANCE-016 — Descuento vs. recargo

El campo `discountPercentage` de `Promotion` es un ajuste **con signo** sobre la
tasa base de la configuración:

* valor **positivo** → descuento real para el cliente (la tasa final baja).
* valor **negativo** → recargo (la tasa final sube).

Rango permitido: `-1 <= discountPercentage <= 1` (equivalente a -100% / +100%).

---

## BR-FINANCE-017 — Aislamiento multi-sociedad

Toda operación de lectura, escritura o borrado sobre `FinancingConfiguration`,
`FinancingPlan` o `Promotion` debe validar `societyId` extraído del JWT del usuario
autenticado. Ninguna consulta puede omitir este filtro. Un intento de acceder a un
recurso de otra sociedad responde `404 Not Found` (nunca expone su existencia).

---

## BR-FINANCE-018 — Integridad referencial en bajas

No se puede eliminar:

* una `FinancingConfiguration` si tiene `FinancingPlan` vinculados,
* un `FinancingPlan` si tiene `Promotion` o ventas (`Sale`) vinculadas,
* una `Promotion` si tiene ventas vinculadas.

El backend traduce la violación de clave foránea (Postgres `23503`) en un error de
negocio `400 Bad Request` con mensaje explicativo, nunca en un `500`.

---

## BR-FINANCE-019 — Roles habilitados

Crear, actualizar y eliminar configuraciones, planes y promociones requiere rol
`ADMIN`, `MANAGER` o `SUPER_ADMIN`. La lectura está disponible para cualquier
usuario autenticado de la sociedad.

---

# Restricciones

* No se permiten cuotas negativas.
* No se permiten intereses negativos.
* No se permiten ventas sin financiación válida.

---

# Consideraciones Técnicas

* Los cálculos financieros deben ejecutarse en backend.
* Los montos deben almacenarse con precisión decimal.
* Las reglas financieras deben centralizarse en services específicos.
* El módulo `financing` expone un único `FinancingService`/`FinancingController` para
  las 3 entidades, con repositorios separados por entidad (ver `Architecture/BackendArchitecture.md`).

---

# Estado de Integración con Ventas

* Las entidades `FinancingConfiguration`, `FinancingPlan` y `Promotion` están
  completas y operativas (CRUD + seguridad multi-sociedad).
* `Sale` ya posee las columnas `financing_plan_id` y `promotion_id` (FK `RESTRICT`)
  para dejar registrado qué plan/promoción se usó en cada venta.
* **Pendiente (Fase 2)**: `SalesService.createSale()` todavía calcula las cuotas con
  una tasa fija temporal (12%) en lugar de resolver `FinancingPlan` + `Promotion`.
  Ver comentario `TODO` en `sales.service.ts`.

---

# Riesgos Operativos

* Cálculos incorrectos
* Inconsistencias financieras
* Refinanciaciones erróneas
* Duplicación de cuotas

---

# Auditoría

Registrar:

* cambios de financiación
* refinanciaciones
* modificaciones administrativas
* ajustes manuales
