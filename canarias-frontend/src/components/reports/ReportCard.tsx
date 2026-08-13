"use client";

import { ReactNode } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";

import { ReportFormat } from "@/types/reports/report.types";

interface ReportCardProps {
  title: string;
  description: string;
  format: ReportFormat;
  onDownload?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  tooltip?: string;
  loading?: boolean;
  children?: ReactNode;
}

export function ReportCard({
  title,
  description,
  format,
  onDownload,
  disabled = false,
  comingSoon = false,
  tooltip,
  loading = false,
  children,
}: ReportCardProps) {
  const isDisabled = disabled || comingSoon || loading;

  const Icon = format === "pdf" ? FileText : FileSpreadsheet;

  const iconColor = format === "pdf" ? "text-red-400" : "text-green-400";
  const iconBg = format === "pdf" ? "bg-red-500/10" : "bg-green-500/10";

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon size={22} className={iconColor} />
        </div>

        {comingSoon && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
            Próximamente
          </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-white">{title}</h3>

        <p className="mt-1 text-sm text-white/60">{description}</p>
      </div>

      {children}

      <button
        onClick={onDownload}
        disabled={isDisabled}
        title={tooltip}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5A300] px-4 py-2.5 font-medium text-black transition hover:bg-[#ffb21c] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generando...
          </>
        ) : (
          "Descargar"
        )}
      </button>
    </div>
  );
}
