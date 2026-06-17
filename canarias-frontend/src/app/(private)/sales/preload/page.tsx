"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, MapPin, Phone, Package } from "lucide-react";
import { PreloadFormData } from "@/types/preloadForm.types";
import { getProducts } from "@/services/product.service";
import {
  createPreloadClient,
  searchClientByDocument,
} from "@/services/client.service";
import { createSale } from "@/services/sales.service";
import { ClientResponse } from "@/types/clientResponse.type";

const initialForm: PreloadFormData = {
  name: "",
  surname: "",
  documentNumber: "",

  address: "",
  locality: "",

  phone: "",

  productId: "",

  quantity: 1,

  installmentsCount: 3,

  paymentFrequency: "monthly",

  firstDueDate: "",

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
  const [searchingClient, setSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState(false);
  const [products, setProducts] = useState<
    {
      productId: string;
      name: string;
      brand?: string;
      model?: string;
    }[]
  >([]);

  const [existingClient, setExistingClient] = useState<ClientResponse | null>(
    null,
  );

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();

        setProducts(
          data.map(
            (p: {
              productId: string;
              name: string;
              brand?: string;
              model?: string;
            }) => ({
              productId: p.productId,
              name: p.name,
              brand: p.brand,
              model: p.model,
            }),
          ),
        );
      } catch {
        setError("No se pudieron cargar los productos");
      }
    }

    loadProducts();
  }, []);
  // ✅ handleChange definido
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSearchClient() {
    if (!form.documentNumber) {
      setError("Ingresá un DNI");
      return;
    }

    try {
      setSearchingClient(true);

      const client = await searchClientByDocument(form.documentNumber);

      if (!client) {
        setClientFound(false);
        setExistingClient(null);

        setError("Cliente no encontrado. Puede cargarse normalmente.");

        return;
      }

      setClientFound(true);
      setExistingClient(client);

      setForm((prev) => ({
        ...prev,
        name: client.name,
        surname: client.surname,
        address: client.address,
        phone: client.phone,
      }));

      setError(null);
    } catch {
      setError("Error buscando cliente");
    } finally {
      setSearchingClient(false);
    }
  }
  async function handleSubmit() {
    if (
      !form.name ||
      !form.surname ||
      !form.documentNumber ||
      !form.phone ||
      !form.address
    ) {
      setError("Completá todos los datos del cliente");
      return;
    }

    if (!form.productId) {
      setError("Seleccioná un producto");
      return;
    }

    if (!form.firstDueDate) {
      setError("Ingresá la fecha del primer vencimiento");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const observations = [
        `Localidad: ${form.locality}`,
        `Referencia 1: ${form.ref1Phone} - ${form.ref1Relationship} - ${form.ref1Address}`,
        `Referencia 2: ${form.ref2Phone} - ${form.ref2Relationship} - ${form.ref2Address}`,
      ].join(" | ");

      const client = await createPreloadClient({
        name: form.name,
        surname: form.surname,
        documentNumber: form.documentNumber,
        address: form.address,
        phone: form.phone,
        observations,
      });

      console.log("Cliente creado", client);

      if (!client?.clientId) {
        throw new Error("ID del cliente no encontrado");
      }

      await createSale({
        clientId: client.clientId,

        saleDate: new Date().toISOString(),

        installmentsCount: form.installmentsCount,

        paymentFrequency: form.paymentFrequency,

        firstDueDate: form.firstDueDate,

        observation: observations,

        products: [
          {
            productId: form.productId,
            quantity: form.quantity,
          },
        ],
      });

      router.push("/dashboard/seller");
    } catch (error: unknown) {
      setError((error as Error)?.message ?? "No se pudo guardar la precarga");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#10254A] via-[#16315F] to-[#21457A] p-8">
        <button
          onClick={() => router.push("/dashboard/seller")}
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
                disabled={clientFound}
              />
            </Field>
            <Field label="Apellido" required>
              <input
                name="surname"
                value={form.surname}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                className={inputClass}
                disabled={clientFound}
              />
            </Field>
            <Field label="DNI" required>
              <div className="flex gap-2">
                <input
                  name="documentNumber"
                  value={form.documentNumber}
                  onChange={handleChange}
                  placeholder="Ej: 30123456"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={handleSearchClient}
                  disabled={searchingClient}
                  className="rounded-xl bg-[#F5A300] px-4 font-semibold text-[#0D1B2A]"
                >
                  {searchingClient ? "..." : "Buscar"}
                </button>
              </div>
            </Field>
            <Field label="Contacto / Teléfono" required>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ej: 2804000000"
                className={inputClass}
                disabled={clientFound}
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
                disabled={clientFound}
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
        {clientFound && (
          <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            Cliente encontrado en el sistema. Solo se registrará la venta.
          </div>
        )}
        {/* PRODUCTO */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <SectionTitle icon={<Package size={18} />} label="Producto" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Producto" required>
              <select
                value={form.productId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    productId: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">Seleccionar producto</option>

                {products.map((product) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                    {product.brand ? ` - ${product.brand}` : ""}
                    {product.model ? ` ${product.model}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cantidad" required>
              <input
                type="number"
                min={1}
                name="quantity"
                value={form.quantity}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Cantidad de cuotas" required>
              <select
                value={form.installmentsCount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    installmentsCount: Number(e.target.value) as 3 | 6 | 9,
                  }))
                }
                className={inputClass}
              >
                <option value={3}>3 cuotas</option>
                <option value={6}>6 cuotas</option>
                <option value={9}>9 cuotas</option>
              </select>
            </Field>

            <Field label="Frecuencia de pago" required>
              <select
                value={form.paymentFrequency}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentFrequency: e.target.value as "weekly" | "monthly",
                  }))
                }
                className={inputClass}
              >
                <option value="monthly">Mensual</option>
                <option value="weekly">Semanal</option>
              </select>
            </Field>

            <Field label="Primer vencimiento" required>
              <input
                type="date"
                name="firstDueDate"
                value={form.firstDueDate}
                onChange={handleChange}
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
