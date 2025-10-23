import Hero from '@/components/Hero';
import Section01Intro from '@/components/Section01Intro';
import Section01 from '@/components/Section01';
import FineHero from '@/components/FineHero';
import Sidebar, { MobileProgressBar } from '@/components/Sidebar';

/**
 * Home Page - Creative CV
 * Da Zero a Developer: Francesco Urban's Story
 */
export default function Home() {
  return (
    <>
      {/* Sidebar Navigation (desktop only) */}
      <Sidebar />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section - Introduction */}
        <Hero />
        <FineHero />

        {/* Chapter 01: La Prima Riga */}
        {/* Intro - Chapter opening */}
        <Section01Intro />
        {/* Content - The story */}
        <Section01 />

        {/* Future sections will be added here */}
        {/* <Section02 /> - Aulab */}
        {/* <Section03 /> - Backend */}
        {/* ... */}
      </main>
    </>
  );
}
