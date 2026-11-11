// Deja solo dígitos. Es el valor que se guarda en el formulario y se envía al backend.
export function parseMoneyInput(value: string): string {
  return value.replace(/\D/g, "");
}

// Formatea para mostrar: "$ 1.234.567". Vacío si no hay dígitos.
export function formatMoneyInput(value: string): string {
  const digits = parseMoneyInput(value);

  if (!digits) {
    return "";
  }

  return `$ ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
