import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cozin",
  description: "Roblox game code shop powered by points.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
