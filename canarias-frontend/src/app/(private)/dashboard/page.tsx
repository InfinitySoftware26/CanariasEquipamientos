"use client";

import { redirect } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { getDashboardRoute } from "@/lib/redirection-role";

export default function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role);

  if (!role) {
    redirect("/login");
  }

  redirect(getDashboardRoute(role));
}
