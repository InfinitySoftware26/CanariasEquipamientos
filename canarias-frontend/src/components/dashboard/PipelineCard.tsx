interface PipelineCardProps {
  title: string;
  value: number;
  highlight?: boolean;
}

export function PipelineCard({
  title,
  value,
  highlight = false,
}: PipelineCardProps) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        transition
        ${
          highlight
            ? "border-[#ffa408]/40 bg-[#ffa408]/10"
            : "border-white/10 bg-white/5"
        }
      `}
    >
      <p className="text-xs uppercase tracking-wide text-white/50">{title}</p>

      <p
        className={`
          mt-3
          text-3xl
          font-bold
          ${highlight ? "text-[#ffa408]" : "text-white"}
        `}
      >
        {value}
      </p>
    </div>
  );
}
