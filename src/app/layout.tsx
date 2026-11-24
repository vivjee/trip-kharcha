import type { Metadata, Viewport } from "next";
import {
  Anton,
  Bricolage_Grotesque,
  Fraunces,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Orbitron,
  Outfit,
  Plus_Jakarta_Sans,
  Quicksand,
  Space_Grotesk,
  Syncopate,
  Syne,
} from "next/font/google";
import "./globals.css";
import "./workspace.css";
import AppearanceBootstrap from "@/components/AppearanceBootstrap";
import AppearanceProvider from "@/components/AppearanceProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", preload: false, display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", preload: false, display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", preload: false, display: "swap" });
const syncopate = Syncopate({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-syncopate", preload: false, display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", preload: false, display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", preload: false, display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", preload: false, display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif", preload: false, display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", preload: false, display: "swap" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", preload: false, display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", preload: false, display: "swap" });

const fontVariables = [
  inter.variable,
  plusJakartaSans.variable,
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
  manifest: "/manifest.webmanifest",
  title: "TripKharcha | Nepal Group Expenses & Trip Planning",
  description: "Private, offline-first group trip expense tracking, pre-trip essentials planning, and simplified settlements in NPR.",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#EFEAE1" }, { media: "(prefers-color-scheme: dark)", color: "#0F131E" }],
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
      data-theme-preset="midnight"
      data-surface="neumorphic"
      data-pattern="none"
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
