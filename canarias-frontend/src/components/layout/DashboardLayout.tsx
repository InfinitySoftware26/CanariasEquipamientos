"use client";

import { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BackButton } from "../ui/BackButton";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#163868_0%,#07111F_60%)]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-72">
        <Header />

        <main className="container-page py-8">
          <BackButton />

          <div className="mt-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
