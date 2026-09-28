import type { Metadata } from "next";
import "./globals.css";
import "./studio.css";
import "./workbench.css";
import "./auth.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "CodeMentor AI | Your coding workspace",
  description:
    "Review code, learn with guided hints and build a consistent coding practice.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
