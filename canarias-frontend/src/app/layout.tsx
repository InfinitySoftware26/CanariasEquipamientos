import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Canarias Equipamientos",
    template: "%s | Canarias Equipamientos",
  },
  description: "Sistema de gestión empresarial",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#075087] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
