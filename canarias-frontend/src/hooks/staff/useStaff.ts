"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { getStaff } from "@/services/staff.service";
import { Staff } from "@/types/staff/staff.type";

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const staffList = await getStaff();

      setStaff(staffList);
    } catch (err) {
      console.error(err);
      setError("No se pudieron obtener los empleados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staff;

    const value = search.toLowerCase();

    return staff.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(value) ||
        employee.email.toLowerCase().includes(value) ||
        employee.dni.includes(value) ||
        employee.role.toLowerCase().includes(value)
      );
    });
  }, [staff, search]);

  const orderedStaff = useMemo(() => {
    return [...filteredStaff].sort((a, b) => {
      if (a.isActive === b.isActive) return 0;

      return a.isActive ? -1 : 1;
    });
  }, [filteredStaff]);

  return {
    staff: orderedStaff,
    loading,
    error,
    search,
    setSearch,
    refreshStaff: loadStaff,
  };
}
