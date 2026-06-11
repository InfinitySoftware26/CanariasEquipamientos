# Canarias System — Business Rules — Sociedades

# Objetivo

Definir las reglas de negocio relacionadas a la operación multi-sociedad del sistema.

---

# Descripción General

El sistema operará bajo una arquitectura multi-sociedad, donde distintas unidades comerciales compartirán la misma plataforma, pero mantendrán segmentación operativa y financiera.

---

# Sociedades Iniciales

| Sociedad        | Descripción                |
| --------------- | -------------------------- |
| Canarias 1      | Operación Rosario          |
| Canarias 2      | Operación pueblos cercanos |
| Canarias Motos  | Financiación de motos      |
| Canarias S.R.L. | Comercio físico con stock  |

---

# Reglas Generales

---

## BR-SOCIETY-001

Toda entidad operativa debe pertenecer a una sociedad.

---

## BR-SOCIETY-002

Toda venta debe asociarse a una sociedad.

---

## BR-SOCIETY-003

Toda cobranza debe asociarse a una sociedad.

---

## BR-SOCIETY-004

Toda caja pertenece a una sociedad específica.

---

## BR-SOCIETY-005

Los reportes deben filtrarse por sociedad.

---

## BR-SOCIETY-006

Un usuario puede pertenecer a múltiples sociedades.

---

## BR-SOCIETY-007

Los permisos deben respetar segmentación por sociedad.

---

# Segmentación de Información

El sistema deberá segmentar:

* clientes
* ventas
* cobranzas
* hojas de ruta
* productos
* movimientos financieros
* reportes

---

# Acceso Multi-Sociedad

## Administrador

Puede operar múltiples sociedades.

---

## Vendedor

Opera únicamente dentro de sociedades asignadas.

---

## Cobrador

Puede recibir hojas de ruta de distintas sociedades.

---

## Gerente

Puede visualizar estadísticas globales.

---

# Reglas Operativas

---

## BR-SOCIETY-008

Cada sociedad tendrá:

* caja independiente
* configuración independiente
* reportes independientes

---

## BR-SOCIETY-009

Las hojas de ruta deben generarse por sociedad.

---

## BR-SOCIETY-010

La información financiera nunca debe mezclarse entre sociedades.

---

# Consideraciones Técnicas

* Toda tabla operativa debe incluir:

```text id="0oh2j5"
society_id
```

* Los filtros deben aplicarse desde backend.
* El frontend no debe confiar en permisos visuales.
* Los reportes deberán soportar consolidado general futuro.

---

# Riesgos Operativos

* Mezcla de datos financieros
* Acceso indebido
* Asignaciones incorrectas
* Reportes inconsistentes

---

# Auditoría

Registrar:

* cambios de sociedad
* accesos multi-sociedad
* modificaciones críticas
* transferencias operativas
