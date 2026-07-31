"use client";

import { useState } from "react";

import {
  RouteSheetItem,
  RouteSheetItemResult,
} from "@/types/rotue-sheets/routeSheets.types";
import { CancelButton } from "@/components/button/CancelButton";
import { SaveButton } from "@/components/button/SaveButton";

interface Props {
  item: RouteSheetItem | null;

  onClose: () => void;

  onSubmit: (data: {
    result: RouteSheetItemResult;
    collectedAmount?: number;
    notes?: string;
  }) => void;
}

export function RouteSheetItemResultModal({ item, onClose, onSubmit }: Props) {
  const [result, setResult] = useState<RouteSheetItemResult>(
    RouteSheetItemResult.COMPLETED,
  );

  const [amount, setAmount] = useState("");

  const [notes, setNotes] = useState("");

  if (!item) return null;

  return (
    <div
      className="
fixed
inset-0
bg-black/60
flex
items-center
justify-center
p-5
"
    >
      <div
        className="
bg-[#111827]
rounded-3xl
p-6
w-full
max-w-md
space-y-5
"
      >
        <h2
          className="
text-xl
font-bold
"
        >
          Registrar visita
        </h2>

        <select
          value={result}
          onChange={(e) => setResult(e.target.value as RouteSheetItemResult)}
          className="
w-full
rounded-xl
bg-black/20
p-3
"
        >
          <option value="COMPLETED">Completada</option>

          <option value="FAILED">Fallida</option>

          <option value="RESCHEDULED">Reprogramar</option>
        </select>

        {item.itemType === "INSTALLMENT" && result === "COMPLETED" && (
          <input
            type="number"
            placeholder="Monto cobrado"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="
w-full
rounded-xl
bg-black/20
p-3
"
          />
        )}

        <textarea
          placeholder="Observaciones"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="
w-full
rounded-xl
bg-black/20
p-3
"
        />

        <div
          className="
flex
gap-3
"
        >
          <CancelButton onClick={onClose} className="flex-1 py-3" />

          <SaveButton
            onClick={() => {
              onSubmit({
                result,

                collectedAmount: amount ? Number(amount) : undefined,

                notes: notes || undefined,
              });
            }}
            className="flex-1 py-3 bg-green-600 hover:bg-emerald-500"
          >
            Guardar
          </SaveButton>
        </div>
      </div>
    </div>
  );
}
