
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Globe, Bot, BarChart } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import WelcomeModal from "@/components/WelcomeModal";
import FeatureCard from "@/components/FeatureCard";

const Index: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show welcome modal after 1 second for first-time visitors
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    if (!hasVisitedBefore) {
      const timer = setTimeout(() => {
        setShowModal(true);
        localStorage.setItem("hasVisitedBefore", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
        {/* Interactive background */}
        <ParticleField />

        {/* Navbar */}
        <nav className="fixed top-0 z-20 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Globe className="mr-2 h-6 w-6 text-teal-400" />
              <span className="text-xl font-bold">GeoFinance</span>
            </div>
            <div className="hidden space-x-6 md:flex">
              <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => navigate("/chat-research")}>
                AI Research
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => navigate("/signin")}>
                Sign In
              </Button>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container relative mx-auto min-h-screen px-4 pt-32 pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Global Finance<br /> 
                <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">Visualized</span>
              </h1>
              <p className="mb-8 max-w-2xl text-lg text-gray-400">
                Real-time financial data and market insights powered by AI. Experience a new way to understand global markets through interactive visualizations and expert analysis.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 text-white" onClick={() => navigate("/dashboard")}>
                  Explore Dashboard
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-gray-700 bg-black/50 text-gray-300" onClick={() => navigate("/chat-research")}>
                  <Bot className="mr-2 h-5 w-5" />
                  Try AI Research
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:col-span-2">
              <div className="relative h-[400px] w-[400px]">
                <Globe className="absolute inset-0 h-full w-full rotate-12 text-teal-500/20 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Platform Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard 
              icon={<Globe className="h-8 w-8" />}
              title="Interactive Global Map"
              description="Explore financial data from around the world with our interactive 3D globe visualization."
            />
            <FeatureCard 
              icon={<Bot className="h-8 w-8" />}
              title="AI Market Research"
              description="Get personalized market insights and analysis powered by advanced AI technology."
            />
            <FeatureCard 
              icon={<BarChart className="h-8 w-8" />}
              title="Real-Time Analytics"
              description="Track market performance with real-time data feeds and customizable analytics."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-black py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-4 flex items-center justify-center">
              <Globe className="mr-2 h-5 w-5 text-teal-400" />
              <span className="text-lg font-bold">GeoFinance</span>
            </div>
            <p className="text-sm text-gray-500">© 2025 GeoFinance. All rights reserved.</p>
          </div>
        </footer>
      </main>

      {/* Welcome Modal */}
      <WelcomeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Index;
