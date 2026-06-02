interface PagePlaceholderProps {
  title: string;
  description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1
          className="
            text-2xl
            font-bold
            text-primary
            sm:text-3xl
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-white/50
            sm:text-base
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-5
          sm:p-6
          md:p-8
          lg:p-10
        "
      >
        <p
          className="
            text-sm
            text-white/60
            sm:text-base
          "
        >
          Módulo en desarrollo.
        </p>
      </div>
    </div>
  );
}
