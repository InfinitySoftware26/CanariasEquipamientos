import { SalesStatsType } from "@/types/sales/salesStats.type";

function CardStat({
  title,
  value,
  color,
  bg,
  border,
}: {
  title: string;
  value: number;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div className={`rounded-3xl border p-6 ${border} ${bg}`}>
      <p className="text-sm text-white/70">{title}</p>

      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function SalesStats({ stats }: { stats: SalesStatsType }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
      <CardStat
        title="Ventas"
        value={stats.total}
        color="text-white"
        bg="bg-slate-900"
        border="border-white/10"
      />

      <CardStat
        title="Validación"
        value={stats.adminValidation}
        color="text-red-400"
        bg="bg-red-950/40"
        border="border-red-500/30"
      />

      <CardStat
        title="Visita"
        value={stats.envVisit}
        color="text-orange-400"
        bg="bg-orange-950/40"
        border="border-orange-500/30"
      />

      <CardStat
        title="Entrega"
        value={stats.delivery}
        color="text-amber-400"
        bg="bg-amber-950/40"
        border="border-amber-500/30"
      />

      <CardStat
        title="Cerradas"
        value={stats.closed}
        color="text-emerald-400"
        bg="bg-emerald-950/30"
        border="border-emerald-500/30"
      />
    </section>
  );
}
