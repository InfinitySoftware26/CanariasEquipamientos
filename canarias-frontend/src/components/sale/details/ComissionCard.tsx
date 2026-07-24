"use client";

import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  extra?: string;
}

export function CommissionCard({ icon, title, value, subtitle, extra }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-white/5 p-3 text-white">{icon}</div>

        <div>
          <p className="text-white/60">{title}</p>

          <p className="mt-2 text-4xl font-bold text-white">{value}</p>

          <p className="mt-3 text-sm text-white/40">{subtitle}</p>

          {extra && (
            <p className="mt-1 font-semibold text-[#F5A300]">{extra}</p>
          )}
        </div>
      </div>
    </div>
  );
}
