import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cozin — Roblox Code Shop",
  description:
    "Buy Roblox game codes with Point. Top up via TrueMoney, get instant delivery.",
  other: {
    "theme-color": "#ffffff",
  },
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
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
