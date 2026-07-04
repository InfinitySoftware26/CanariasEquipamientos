"use client";

import { Client } from "@/types/cretateClient.type";
import { ClientRow } from "./ClientRow";

interface Props {
  clients: Client[];
}

export function ClientTable({ clients }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0E1726] md:rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr className="text-left text-[10px] uppercase tracking-wider text-white/50 md:text-xs">
              <th className="px-3 py-3 md:px-6 md:py-4">Cliente</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Documento</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Teléfono</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Dirección</th>
              <th className="px-3 py-3 md:px-6 md:py-4">Estado</th>
              <th className="px-3 py-3 md:px-6 md:py-4"></th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <ClientRow key={client.clientId} client={client} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
