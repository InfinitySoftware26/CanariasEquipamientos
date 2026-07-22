import { ReactNode } from "react";

interface DashboardHeroProps {
  title: string;
  subtitle: string;
  badge?: string;
  action?: ReactNode;
}

export function DashboardHero({
  title,
  subtitle,
  badge,
  action,
}: DashboardHeroProps) {
  return (
    <section
      className="
relative
overflow-hidden
rounded-3xl
border
border-white/10
bg-gradient-to-r
from-[#10254A]
via-[#16315F]
to-[#21457A]
p-8
"
    >
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          {badge && (
            <span
              className="
inline-flex
rounded-full
border
border-[#ffa408]/30
bg-[#ffa408]/10
px-3
py-1
text-xs
font-medium
text-[#ffa408]
"
            >
              {badge}
            </span>
          )}

          <h1
            className="
mt-4
text-3xl
font-bold
text-white
"
          >
            {title}
          </h1>

          <p
            className="
mt-2
text-white/60
"
          >
            {subtitle}
          </p>
        </div>

        {action}
      </div>

      <div
        className="
absolute
right-0
top-0
h-40
w-40
rounded-full
bg-[#ffa408]/20
blur-3xl
"
      />
    </section>
  );
}
