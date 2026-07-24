import { ReactNode } from "react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        group
        rounded-2xl
        border
        border-white/10
        bg-white/5
        p-5
        text-left
        transition-all
        hover:border-[#ffa408]/40
        hover:bg-[#ffa408]/10
      "
    >
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-[#ffa408]
          text-black
          transition
          group-hover:scale-105
        "
      >
        {icon}
      </div>

      <h3 className="font-semibold text-white">{title}</h3>

      <p className="mt-1 text-sm text-white/50">{description}</p>
    </button>
  );
}
