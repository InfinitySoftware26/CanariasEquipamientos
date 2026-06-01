"use client";

import { ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Content */}

      <div className="lg:pl-72">
        <Header />

        <main className="container-page py-6">{children}</main>
      </div>
    </div>
  );
}
