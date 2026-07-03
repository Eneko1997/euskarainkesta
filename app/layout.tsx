import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Euskara Inkesta · Lanbide-Euskal Enplegu Zerbitzu Publikoa",
  description: "Prestakuntza beharrak identifikatzeko inkesta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
