import { StepTitleProps } from "@/types/preload-sale/preload.type";

export function StepTitle({ icon, label, desc }: StepTitleProps) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="text-[#F5A300] mt-1">{icon}</span>
      <div>
        <h2 className="text-lg font-semibold text-white">{label}</h2>
        {desc && <p className="text-xs text-white/50">{desc}</p>}
      </div>
    </div>
  );
}
