import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ServiziLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
