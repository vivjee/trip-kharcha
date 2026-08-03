import type { Metadata } from "next";
import {
  Anton,
  Bricolage_Grotesque,
  Fraunces,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Orbitron,
  Outfit,
  Quicksand,
  Space_Grotesk,
  Syncopate,
  Syne,
} from "next/font/google";
import "./globals.css";
import AppearanceBootstrap from "@/components/AppearanceBootstrap";
import AppearanceProvider from "@/components/AppearanceProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", display: "swap" });
const syncopate = Syncopate({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-syncopate", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });

const fontVariables = [
  inter.variable,
  spaceGrotesk.variable,
  jetbrains.variable,
  orbitron.variable,
  syncopate.variable,
  syne.variable,
  outfit.variable,
  fraunces.variable,
  instrumentSerif.variable,
  anton.variable,
  quicksand.variable,
  bricolage.variable,
].join(" ");

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
    <html
      lang="en"
      data-theme="dark"
      data-theme-preset="slate"
      data-surface="material"
      data-pattern="mesh"
      data-font-style="default"
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <head>
        <AppearanceBootstrap />
      </head>
      <body className="min-h-full flex flex-col">
        <AppearanceProvider>{children}</AppearanceProvider>
      </body>
    </html>
  );
}
