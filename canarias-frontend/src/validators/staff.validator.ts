import { CreateStaffPayload } from "@/types/staff/createStaff.type";

export interface StaffValidationErrors {
  name?: string;
  dni?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
  societyId?: string;
}

export function validateStaff(form: CreateStaffPayload): StaffValidationErrors {
  const errors: StaffValidationErrors = {};

  // Nombre
  if (!form.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  } else if (form.name.length > 100) {
    errors.name = "El nombre no puede superar los 100 caracteres.";
  }

  // DNI
  if (!form.dni.trim()) {
    errors.dni = "El DNI es obligatorio.";
  } else if (!/^\d{7,8}$/.test(form.dni)) {
    errors.dni = "El DNI debe contener 7 u 8 dígitos numéricos.";
  }

  // Email
  if (!form.email.trim()) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Ingrese un correo electrónico válido.";
  }

  // Teléfono
  if (!form.phone.trim()) {
    errors.phone = "El teléfono es obligatorio.";
  } else if (form.phone.length > 20) {
    errors.phone = "El teléfono no puede superar los 20 caracteres.";
  }

  // Contraseña
  if (!form.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
    errors.password =
      "La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula y un número.";
  }

  // Rol
  if (!form.role) {
    errors.role = "Seleccione un rol.";
  }

  // Sociedad
  if (!form.societyId) {
    errors.societyId = "Debe seleccionar una sociedad.";
  }

  return errors;
}
