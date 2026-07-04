export function SaleStatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        whitespace-nowrap
        rounded-full
        px-3
        py-1.5
        text-xs
        font-semibold
        ${className}
      `}
    >
      {label}
    </span>
  );
}
