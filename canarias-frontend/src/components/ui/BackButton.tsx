"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const HIDDEN_ROUTES = [
  "/dashboard",
  "/sales",
  "/clients",
  "/staff",
  "/products",
  "/settings",
];

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Ocultar en las pantallas principales
  if (HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className="
        mb-6
        flex h-11 w-11 items-center justify-center
        rounded-2xl
        border border-white/10
        bg-[#111827]
        text-white
        transition-all
        hover:border-[#F5A300]/40
        hover:bg-[#1A2436]
      "
      aria-label="Volver"
    >
      <ArrowLeft size={20} />
    </button>
  );
}
