"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import {
  RouteSheetItem,
  RouteSheetStatus,
} from "@/types/rotue-sheets/routeSheets.types";

import { RouteSheetHeader } from "@/components/route-sheets/RouteSheetHeader";
import { RouteSheetItemCard } from "@/components/route-sheets/RouteSheetItemCard";

import { useRouteSheet } from "@/hooks/route-sheets/useRouteSheet";
import { useUpdateRouteSheetItem } from "@/hooks/route-sheets/useUpdateRouteSheetItem";
import { useUpdateRouteSheetStatus } from "@/hooks/route-sheets/useUpdateRouteSheetStatus";
import { RouteSheetItemResultModal } from "@/components/route-sheets/RouteSheetItemResult";

export default function RouteSheetDetailPage() {
  const params = useParams();

  const routeSheetId = params.id as string;

  const { routeSheet, loading, reload } = useRouteSheet(routeSheetId);

  const { update } = useUpdateRouteSheetItem();

  const { update: updateStatus } = useUpdateRouteSheetStatus();

  const [selectedItem, setSelectedItem] = useState<RouteSheetItem | null>(null);

  if (loading || !routeSheet) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <RouteSheetHeader
        routeSheet={routeSheet}
        onStatusChange={async (status: RouteSheetStatus) => {
          await updateStatus(routeSheet.routeSheetId, status);
          reload();
        }}
      />

      <div className="grid gap-4">
        {routeSheet.items.map((item) => (
          <RouteSheetItemCard
            key={item.itemId}
            item={item}
            onAction={() => setSelectedItem(item)}
          />
        ))}
      </div>

      <RouteSheetItemResultModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSubmit={async (data) => {
          if (!selectedItem) {
            return;
          }

          await update(selectedItem.itemId, data);

          setSelectedItem(null);

          reload();
        }}
      />
    </div>
  );
}
