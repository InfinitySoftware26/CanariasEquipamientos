"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, MapPin, Phone, Package } from "lucide-react";
import { PreloadFormData } from "@/types/preloadForm.types";
import { createPreloadClient, createSale } from "@/services/auth.service";

const initialForm: PreloadFormData = {
  name: "",
  surname: "",
  documentNumber: "",
  address: "",
  locality: "",
  phone: "",
  product: "",
  installments: "",
  installmentValue: "",
  ref1Phone: "",
  ref1Relationship: "",
  ref1Address: "",
  ref2Phone: "",
  ref2Relationship: "",
  ref2Address: "",
};

function SectionTitle({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[#F5A300]">{icon}</span>
      <h2 className="text-lg font-semibold text-white">{label}</h2>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-white/60">
        {label}
        {required && <span className="ml-1 text-[#F5A300]">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = `
  w-full rounded-xl border border-white/10
  bg-white/[0.06] px-4 py-2.5
  text-white placeholder:text-white/30
  outline-none focus:border-[#F5A300]/60 focus:bg-white/[0.09]
  transition-colors
`;

export default function PreloadPage() {
  const router = useRouter();
  const [form, setForm] = useState<PreloadFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ handleChange definido
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
      const observations = [
        `Localidad: ${form.locality}`,
        `Ref1: ${form.ref1Phone} | ${form.ref1Relationship} | ${form.ref1Address}`,
        `Ref2: ${form.ref2Phone} | ${form.ref2Relationship} | ${form.ref2Address}`,
      ].join(" | ");

      const client = await createPreloadClient({
        name: form.name,
        surname: form.surname,
        documentNumber: form.documentNumber,
        address: form.address,
        phone: form.phone,
        observations,
      });

      await createSale({
        clientId: client.clientId,
        paymentType: "installments",
        totalAmount:
          parseFloat(form.installmentValue) * parseInt(form.installments) || 0,
        saleDate: new Date().toISOString(),
        observation: `Producto: ${form.product} | Cuotas: ${form.installments} x $${form.installmentValue}`,
        products: [],
      });

      router.push("/seller");
    } catch (err: any) {
      setError(
        err?.message ??
          "Error al guardar. Revisá los datos e intentá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 className="text-3xl font-bold text-white">
          Precarga de <span className="text-[#F5A300]">cliente y venta</span>
        </h1>
        <p className="mt-2 text-white/60">
          Completá todos los campos obligatorios.
        </p>
      </section>

      <div className="space-y-6">
        {/* DATOS DEL CLIENTE */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <SectionTitle icon={<User size={18} />} label="Datos del cliente" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" required>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Juan"
                className={inputClass}
              />
            </Field>
            <Field label="Apellido" required>
              <input
                name="surname"
                value={form.surname}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                className={inputClass}
              />
            </Field>
            <Field label="DNI" required>
              <input
                name="documentNumber"
                value={form.documentNumber}
                onChange={handleChange}
                placeholder="Ej: 30123456"
                className={inputClass}
              />
            </Field>
            <Field label="Contacto / Teléfono" required>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ej: 2804000000"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* DIRECCIÓN */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <SectionTitle icon={<MapPin size={18} />} label="Dirección" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dirección" required>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Calle y número"
                className={inputClass}
              />
            </Field>
            <Field label="Localidad" required>
              <input
                name="locality"
                value={form.locality}
                onChange={handleChange}
                placeholder="Ej: Trelew"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* PRODUCTO */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <SectionTitle icon={<Package size={18} />} label="Producto" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Producto" required>
              <input
                name="product"
                value={form.product}
                onChange={handleChange}
                placeholder="Nombre del producto"
                className={inputClass}
              />
            </Field>
            <Field label="Cantidad de cuotas" required>
              <input
                name="installments"
                value={form.installments}
                onChange={handleChange}
                placeholder="Ej: 12"
                className={inputClass}
              />
            </Field>
            <Field label="Valor de cuota" required>
              <input
                name="installmentValue"
                value={form.installmentValue}
                onChange={handleChange}
                placeholder="Ej: 15000"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* REFERENCIAS */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <SectionTitle icon={<Phone size={18} />} label="Referencias" />
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A300]">
                  Referencia {n}
                </p>
                <Field label="Teléfono" required>
                  <input
                    name={`ref${n}Phone`}
                    value={form[`ref${n}Phone` as keyof PreloadFormData]}
                    onChange={handleChange}
                    placeholder="Ej: 2804000000"
                    className={inputClass}
                  />
                </Field>
                <Field label="Parentesco" required>
                  <input
                    name={`ref${n}Relationship`}
                    value={form[`ref${n}Relationship` as keyof PreloadFormData]}
                    onChange={handleChange}
                    placeholder="Ej: Hermano/a"
                    className={inputClass}
                  />
                </Field>
                <Field label="Dirección" required>
                  <input
                    name={`ref${n}Address`}
                    value={form[`ref${n}Address` as keyof PreloadFormData]}
                    onChange={handleChange}
                    placeholder="Calle y número"
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl bg-[#F5A300] px-8 py-3 font-semibold text-[#0D1B2A] hover:bg-[#ffa408] disabled:opacity-50 transition-colors"
          >
            {loading ? "Enviando..." : "Confirmar precarga"}
          </button>
        </div>
      </div>
    </div>
  );
}
