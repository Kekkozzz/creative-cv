import Hero from '@/components/Hero';
import Section01 from '@/components/Section01';
import Sidebar, { MobileProgressBar } from '@/components/Sidebar';

/**
 * Home Page - Creative CV
 * Da Zero a Developer: Francesco Urban's Story
 */
export default function Home() {
  return (
    <>
      {/* Mobile Progress Bar (mobile only) */}
      <MobileProgressBar />

      {/* Sidebar Navigation (desktop only) */}
      <Sidebar />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section - Introduction */}
        <Hero />

        {/* Section 01 - La Prima Riga */}
        <Section01 />

        {/* Future sections will be added here */}
        {/* <Section02 /> - Aulab */}
        {/* <Section03 /> - Backend */}
        {/* ... */}
      </main>
    </>
  );
}
