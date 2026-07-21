import { UpdateStaffPayload } from "@/types/staff/updateStaff.type";

export interface UpdateStaffValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export function validateUpdateStaff(
  form: UpdateStaffPayload,
): UpdateStaffValidationErrors {
  const errors: UpdateStaffValidationErrors = {};

  // Nombre
  if (!form.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  } else if (form.name.length > 100) {
    errors.name = "El nombre no puede superar los 100 caracteres.";
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

  // Rol
  if (!form.role) {
    errors.role = "Seleccione un rol.";
  }

  return errors;
}