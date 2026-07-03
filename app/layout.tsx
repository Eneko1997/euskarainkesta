import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inkesta Euskara · Lanbide",
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
