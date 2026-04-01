import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import "./services.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Servizi Web & Digitali — Edizioni Duepuntozero",
  description:
    "Pacchetti trasparenti per siti web, e-commerce, web app e mobile app. Soluzioni digitali su misura per il tuo business.",
};

export default function ServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased noise`}
    >
      {children}
    </div>
  );
}
