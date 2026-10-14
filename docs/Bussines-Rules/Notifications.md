# Business Rules — Notificaciones

# Objetivo

Las notificaciones permiten informar a los usuarios internos del sistema sobre situaciones que requieren atención.

---

# Canal

Las notificaciones serán internas.

No forman parte del alcance actual:

emails a clientes;
emails automáticos externos;
comunicaciones comerciales externas.

---

# Incumplimiento de pago

Cuando un cliente acumula dos cuotas consecutivas impagas, el sistema debe generar una notificación para Administración.

La notificación debe permitir identificar la situación que requiere atención.

---

# Información mínima

La notificación debe permitir acceder o identificar:

cliente;
venta relacionada;
motivo;
fecha;
estado de atención.

El diseño definitivo de la notificación queda a cargo de la implementación.

---

# Estado

Las notificaciones deben poder distinguirse entre pendientes de atención y aquellas que ya fueron atendidas cuando corresponda.

---

# Principio

La notificación informa una situación.

No reemplaza la operación de negocio que debe realizar el usuario.

Por ejemplo:

2 cuotas consecutivas impagas
        ↓
Notificación
        ↓
Administración revisa
        ↓
Puede gestionar retiro


# Alcance

La primera implementación se concentra en notificaciones internas relacionadas con situaciones operativas del sistema.

Nuevos eventos podrán incorporarse posteriormente.