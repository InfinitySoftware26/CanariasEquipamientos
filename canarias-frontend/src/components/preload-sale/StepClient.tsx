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

      <div className="space-y-4">
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

        {form.documentNumber && (
          <div className="mt-2 text-xs">
            {clientFound ? (
              <p className="text-green-400">
                ✔ Cliente encontrado en la base de datos
              </p>
            ) : (
              <p className="text-yellow-400">
                ⚠ Cliente no encontrado. Se creará automáticamente.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
