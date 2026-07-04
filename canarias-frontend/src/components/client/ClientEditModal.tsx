"use client";

import { useState } from "react";

import { updateClient } from "@/services/client.service";
import { ClientView } from "@/types/cretateClient.type";

export function ClientEditModal({
  client,
  onClose,
}: {
  client: ClientView;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: client.name ?? "",
    surname: client.surname ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    observations: client.observations ?? "",
  });

  const handleSave = async () => {
    await updateClient(client.clientId, {
      name: form.name,
      surname: form.surname,
      phone: form.phone,
      address: form.address,
      observations: form.observations,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="w-[520px] rounded-3xl bg-[#0E1726] p-6 border border-white/10 space-y-4">
        <h3 className="text-white text-lg">Editar cliente</h3>

        {Object.entries(form).map(([key, value]) => (
          <input
            key={key}
            value={value}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
            className="w-full rounded-xl bg-[#0B1220] p-3 text-white"
          />
        ))}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-white/60">
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="rounded-xl bg-[#F5A300] px-4 py-2 text-black"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
