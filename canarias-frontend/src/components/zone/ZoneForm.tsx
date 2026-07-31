"use client";

import { useState } from "react";

import { Zone } from "@/types/zones/zone.type";
import { SaveButton } from "@/components/button/SaveButton";

interface Props {
  initialValues?: Partial<Zone>;
  loading?: boolean;

  onSubmit(data: { name: string; description: string }): void;
}

export function ZoneForm({ initialValues, loading, onSubmit }: Props) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();

        onSubmit({
          name,
          description,
        });
      }}
    >
      <div>
        <label className="mb-2 block text-sm">Nombre</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-black/20
            p-3
          "
        />
      </div>

      <div>
        <label className="mb-2 block text-sm">Descripción</label>

        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-black/20
            p-3
          "
        />
      </div>

      <SaveButton disabled={loading} className="w-full">
        {loading ? "Guardando..." : "Guardar zona"}
      </SaveButton>
    </form>
  );
}
