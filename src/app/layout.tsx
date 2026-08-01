import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Trip Calculator v2 | Nepal Group Expenses",
  description: "Private, offline-first group trip expense tracking with flexible splits and simplified settlements in NPR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className={`${plusJakarta.className} min-h-full flex flex-col selection:bg-indigo-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
