import { Space_Grotesk, DM_Sans } from "next/font/google";
import "@/app/globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Creative Portfolio — Francesco Urban",
  description: "Da Zero a Developer: Francesco Urban's Story",
};

export default function CVLayout({ children }) {
  return (
    <div className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <SmoothScroll>{children}</SmoothScroll>
    </div>
  );
}
