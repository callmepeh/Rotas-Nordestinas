import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Rotas Nordestinas",
  description:
    "Explore a essência do Nordeste - Um guia completo de turismo pela região nordeste do Brasil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <UIProvider>
            <ClientLayout>{children}</ClientLayout>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
