import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, ChartBar, Bell, Clock } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import HomeMapboxGlobe from "@/components/HomeMapboxGlobe";
import "@/components/home-mapbox.css";
import APIModal from "@/components/APIModal";
import SubscriptionPlans from "@/components/SubscriptionPlans";
const Index = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHasScrolled(scrollPosition > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleExploreClick = () => {
    toast({
      title: "Welcome to GeoFinance",
      description: "Start exploring our advanced geospatial financial analytics platform.",
      duration: 5000
    });
  };
  const features = [{
    title: "Geospatial Insights",
    description: "Visualize financial data layered onto geographic maps to identify regional trends and opportunities.",
    icon: Globe
  }, {
    title: "Real-Time Dashboards",
    description: "Monitor market changes with customizable dashboards that update in real-time with global financial data.",
    icon: ChartBar
  }, {
    title: "Custom Alerts",
    description: "Set up personalized notifications for market events based on geospatial and financial parameters.",
    icon: Bell
  }, {
    title: "Portfolio Mapping",
    description: "Plot your investments on a global scale and visualize exposure across different geographic regions.",
    icon: Clock
  }];
  return <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${hasScrolled ? "py-3 bg-black/70 backdrop-blur-md" : "py-5 bg-transparent"}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-lg bg-teal p-1 mr-2">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold">GeoFinance</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            
            {/* <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Market Map</Link>
            <Link to="/trading" className="text-gray-300 hover:text-white transition-colors">Trading Dashboard</Link> */}
            <Link to="/stock-compare" className="text-gray-300 hover:text-white transition-colors">Compare Stocks</Link>
            <Link to="/chat-research" className="text-gray-300 hover:text-white transition-colors">AI Research</Link>
            <Link to="/signin" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/signin">
              
            </Link>
            <Link to="/dashboard">
              
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Mapbox Globe */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Globe - replaced with Mapbox Globe */}
        <div className="absolute inset-0 z-0 opacity-80">
          <HomeMapboxGlobe className="w-full h-full" />
        </div>
        
        {/* Content overlay */}
        <div className="container mx-auto relative z-10 pt-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="p-2 px-4 rounded-full border border-teal/30 bg-teal/5 backdrop-blur-sm inline-flex items-center">
                <span className="text-sm text-teal font-medium">New Feature: Sonar Powered Deep Research & Stock Comparer added !  </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Unlock the Power of Geospatial Financial Intelligence
              </h1>
              <p className="text-xl text-gray-300">
                Visualize market insights with dynamic maps and AI-driven data overlays
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button className="bg-teal-gradient text-white py-6 px-8 rounded-md button-glow">
                    Explore Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/trading">
                  <Button variant="outline" className="border-white/20 text-white py-6 px-8 rounded-md hover:bg-white/10">
                    Trading Platform <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(idx => <div key={idx} className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white/20"></div>)}
                </div>
                <span className="text-gray-400 text-sm font-mono">
                  <span className="text-teal font-bold">1000+</span> stocks analysed deeply using Sonar API !
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              {/* This space is intentionally empty for the hero section layout */}
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-gray-400 mb-2">Scroll to explore</span>
          <ArrowRight className="h-5 w-5 text-teal transform rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced Geospatial Analytics
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Combine financial data with location intelligence to discover insights that traditional analytics miss.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <div key={index} className="transition-all duration-500 opacity-0 translate-y-10" style={{
            animation: `fade-in 0.5s ease-out ${0.1 * (index + 1)}s forwards`
          }}>
                <FeatureCard title={feature.title} description={feature.description} icon={feature.icon} />
              </div>)}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section (replacing Stats Section) */}
      <SubscriptionPlans />

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to transform your financial analysis?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of analysts who have already discovered the power of geospatial financial intelligence.
            </p>
            <Link to="/dashboard">
              <Button className="bg-teal-gradient text-white py-6 px-8 text-lg rounded-md button-glow">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-black/50 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="rounded-lg bg-teal p-1 mr-2">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-lg font-bold">GeoFinance</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <button onClick={() => setShowAPIModal(true)} className="hover:text-teal transition-colors cursor-pointer">
                APIs Used
              </button>
              <a href="#" className="hover:text-teal transition-colors">Documentation</a>
            </div>
            <div className="mt-6 md:mt-0 text-sm text-gray-500">
              © 2025 GeoFinance. All rights reserved.
              
            </div>
          </div>
        </div>
      </footer>

      {/* API Modal */}
      <APIModal open={showAPIModal} onClose={() => setShowAPIModal(false)} />
    </div>;
};
export default Index;