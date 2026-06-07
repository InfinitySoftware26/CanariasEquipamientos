interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="mt-2 text-white/60">{description}</p>
      </div>

      <div
        className="
          rounded-3xl
          border
          border-dashed
          border-white/10
          bg-white/[0.04]
          p-10
          text-center
          backdrop-blur-xl
        "
      >
        <p className="text-white/60">
          Este módulo estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
