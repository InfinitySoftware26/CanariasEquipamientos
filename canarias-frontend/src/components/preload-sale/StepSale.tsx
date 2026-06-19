import { Package } from "lucide-react";
import { StepTitle } from "./StepTitle";
import { StepSaleProps } from "@/types/preload-sale/preload.type";

export function StepSale({
  form,
  setForm,
  products,
  handleSubmit,
  loading,
}: StepSaleProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <StepTitle icon={<Package size={18} />} label="Venta" />

      <div className="space-y-3">
        <select
          className="input"
          value={form.productId}
          onChange={(e) =>
            setForm({
              ...form,
              productId: e.target.value,
            })
          }
        >
          <option value="">Producto</option>

          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="input"
          value={form.quantity}
          onChange={(e) =>
            setForm({
              ...form,
              quantity: Number(e.target.value),
            })
          }
        />

        <input
          type="date"
          className="input"
          value={form.firstDueDate}
          onChange={(e) =>
            setForm({
              ...form,
              firstDueDate: e.target.value,
            })
          }
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-[#F5A300] py-2 font-semibold text-[#0D1B2A]"
        >
          {loading ? "Enviando..." : "Confirmar venta"}
        </button>
      </div>
    </section>
  );
}
