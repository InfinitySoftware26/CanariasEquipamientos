import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canarias Equipamientos",
  description: "Sistema de gestión empresarial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          {children}
        </div>
      </body>
    </html>
  );
}
