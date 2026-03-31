import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ServicesOverview from "./components/ServicesOverview";
import CaseStudies from "./components/CaseStudies";
import AIShowcase from "./components/AIShowcase";
import PricingSection from "./components/PricingSection";
import ContactHub from "./components/ContactHub";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServicesOverview />
        <CaseStudies />
        <AIShowcase />
        <PricingSection />
        <ContactHub />
      </main>
      <Footer />
    </>
  );
}
