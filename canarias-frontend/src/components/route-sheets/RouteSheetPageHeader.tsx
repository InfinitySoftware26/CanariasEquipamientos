interface Props {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function RouteSheetPageHeader({ title, description, action }: Props) {
  return (
    <header
      className="
      flex
      items-center
      justify-between
      rounded-3xl
      border
      border-white/10
      bg-white/5
      p-6
      "
    >
      <div>
        <h1
          className="
          text-2xl
          font-bold
          text-white
          "
        >
          {title}
        </h1>

        <p
          className="
          mt-1
          text-sm
          text-white/50
          "
        >
          {description}
        </p>
      </div>

      {action}
    </header>
  );
}
