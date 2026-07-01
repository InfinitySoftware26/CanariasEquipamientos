# Staff Scope

# Objetivo

Documentar las reglas de negocio relacionadas con el alcance operativo de los empleados dentro del sistema.

El alcance operativo está determinado por:

- sociedades asignadas;
- zonas asignadas;
- rol activo;
- contexto operativo seleccionado.

Este documento define qué información puede visualizar y operar cada empleado según su contexto.

---

# Reglas Generales

## BR-STAFF-SCOPE-001

Todo empleado deberá pertenecer al menos a una sociedad.

Restricciones:

- no existen empleados sin sociedad asignada;
- la sociedad determina contexto operativo.

---

## BR-STAFF-SCOPE-002

Un empleado podrá pertenecer a múltiples sociedades.

Condiciones:

- cada sociedad opera de forma aislada;
- los permisos deberán respetar el contexto activo.

---

## BR-STAFF-SCOPE-003

Un empleado podrá tener una o múltiples zonas asignadas.

Objetivo:

permitir organización operativa y segmentación territorial.

---

## BR-STAFF-SCOPE-004

El acceso operativo deberá respetar simultáneamente:

- sociedad activa;
- zonas asignadas;
- rol del usuario.

---

## BR-STAFF-SCOPE-004A

Un empleado que pertenezca a múltiples sociedades deberá operar únicamente dentro de la sociedad activa seleccionada durante la sesión.

Implicancias:

- visualización de información;
- permisos operativos;
- consultas;
- creación de registros.

Objetivo:

garantizar aislamiento operativo entre sociedades.

---

# Alcance Operativo

El sistema deberá filtrar información considerando:

Empleado
↓

Sociedad activa
↓

Zona asignada
↓

Permisos del rol
↓

Información visible

---

# Roles y Alcance

## SELLER

Puede:

- pertenecer a una o varias sociedades;
- tener zonas asignadas;
- registrar preventas.

Restricciones:

- no puede validar ventas;
- no puede cerrar operaciones.

---

## COLLECTOR

Puede:

- pertenecer a una o varias sociedades;
- tener zonas asignadas;
- realizar visitas ambientales;
- confirmar entregas.

Restricciones:

- no puede validar ventas;
- no puede cerrar ventas.

---

## ADMIN

Puede:

- operar dentro de sociedades habilitadas;
- validar operaciones;
- coordinar entregas;
- cerrar operaciones.

Restricciones actuales:

- no puede registrar ventas.

Observación:

Existe una definición funcional aprobada para habilitar registro de ventas en futuras iteraciones.

---

# Restricciones Técnicas

- Backend deberá aplicar filtros obligatorios.
- Frontend deberá respetar alcance devuelto.
- No se permitirá acceso cruzado entre sociedades.
- La sociedad activa deberá mantenerse durante sesión.

---

# Casos de Ejemplo

## Caso 1 — Sociedad única

Empleado:

SELLER

Sociedad:

Canarias Norte

Resultado:

Visualiza únicamente información de esa sociedad.

---

## Caso 2 — Multi-sociedad

Empleado:

ADMIN

Sociedades:

- Canarias Norte
- Canarias Sur

Resultado:

Opera únicamente dentro de la sociedad seleccionada.

---

## Caso 3 — Zona restringida

Empleado:

COLLECTOR

Zona:

Zona Oeste

Resultado:

Visualiza únicamente registros correspondientes.

---

# Estado

Documento vigente.

Implementado:
✅ Alcance por sociedad

Implementación parcial:
🟡 Gestión por zonas

Pendiente:

- formularios administrativos;
- configuración completa de asignaciones;
- ampliación de permisos.