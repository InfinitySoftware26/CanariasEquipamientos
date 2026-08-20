"use client";

import { useState } from "react";

import { rescheduleFailedVisit } from "@/services/failed-visits/failed-visits.service";

export function useRescheduleFailedVisit() {
  const [loading, setLoading] = useState(false);

  const reschedule = async (id: string, rescheduledDate: string) => {
    try {
      setLoading(true);

      await rescheduleFailedVisit(id, { rescheduledDate });
    } finally {
      setLoading(false);
    }
  };

  return {
    reschedule,
    loading,
  };
}
