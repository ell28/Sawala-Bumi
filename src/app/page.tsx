import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import SocialProof from "@/components/SocialProof";
import BookingSection from "@/components/BookingSection";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <HowItWorks />
        <Pricing />
        <SocialProof />
        <BookingSection />
        <FAQ />
      </main>
      <footer className="border-t border-gray-100 bg-foreground px-4 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Sawala Bumi. All rights reserved.
      </footer>
    </>
  );
}
