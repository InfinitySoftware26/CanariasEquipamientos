"use client";

import { useRouter } from "next/navigation";

import { useCreateRouteSheet } from "@/hooks/route-sheets/useCreateSheet";
import { useZones } from "@/hooks/zones/useZones";
import { useCollectors } from "@/hooks/collector/useCollectors";

import { RouteSheetCreateForm } from "@/components/route-sheets/RouteSheetCreateForm";

import { CreateRouteSheetPayload } from "@/types/rotue-sheets/createRouteSheets.type";

export default function NewRouteSheetPage() {
  const router = useRouter();

  const { create, loading: createLoading } = useCreateRouteSheet();

  const { zones, loading: zonesLoading } = useZones();

  const { collectors, loading: collectorsLoading } = useCollectors();

  async function handleSubmit(data: CreateRouteSheetPayload) {
    const sheet = await create(data);

    router.push(`/route-sheets/${sheet.routeSheetId}`);
  }

  return (
    <div className="space-y-6">
      <div
        className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        "
      >
        <h1 className="text-2xl font-bold">Nueva hoja de ruta</h1>

        <p className="mt-2 text-white/50">
          Asignar cobrador y zona de recorrido
        </p>
      </div>

      <RouteSheetCreateForm
        zones={(Array.isArray(zones) ? zones : []).map((zone) => ({
          id: zone.zoneId,
          name: zone.name,
        }))}
        collectors={collectors.map((person) => ({
          id: person.staffId,
          name: person.name,
        }))}
        loading={createLoading || zonesLoading || collectorsLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
