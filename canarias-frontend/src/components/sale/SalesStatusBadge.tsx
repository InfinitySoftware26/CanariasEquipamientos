export function SaleStatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-semibold h-fit ${className}`}
    >
      {label}
    </span>
  );
}
