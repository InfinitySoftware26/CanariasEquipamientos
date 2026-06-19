import { User } from "lucide-react";
import { StepTitle } from "./StepTitle";
import { StepClientProps } from "@/types/preload-sale/preload.type";

export function StepClient({
  form,
  setForm,
  handleSearchClient,
  clientFound,
}: StepClientProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <StepTitle icon={<User size={18} />} label="Cliente" />

      <div className="space-y-3">
        <input
          name="documentNumber"
          value={form.documentNumber}
          onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
          placeholder="DNI"
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-white"
        />

        <button
          onClick={handleSearchClient}
          className="w-full rounded-xl bg-[#F5A300] py-2 font-semibold text-[#0D1B2A]"
        >
          Buscar cliente
        </button>

        {clientFound ? (
          <p className="text-xs text-green-400 mt-2">Cliente existente</p>
        ) : (
          form.documentNumber && (
            <p className="text-xs text-yellow-400 mt-2">
              Cliente nuevo (se creará al continuar)
            </p>
          )
        )}
      </div>
    </section>
  );
}
