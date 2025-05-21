
import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Twitter, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SiteMapProps {
  onApiModalToggle: () => void;
}

const SiteMap: React.FC<SiteMapProps> = ({ onApiModalToggle }) => {
  const mainLinks = [
    { name: "Mapboard", path: "/dashboard" },
    { name: "Trading", path: "/trading" },
    { name: "Compare Stocks", path: "/stock-compare" },
    { name: "Research", path: "/chat-research" }
  ];

  const resourceLinks = [
    { name: "API Documentation", action: onApiModalToggle },
    { name: "User Guides", path: "#" },
    { name: "Market Tutorials", path: "#" },
    { name: "Financial Terms", path: "#" }
  ];

  const companyLinks = [
    { name: "About Us", path: "#" },
    { name: "Contact", path: "#" },
    { name: "Careers", path: "#" },
    { name: "Media Kit", path: "#" }
  ];

  const legalLinks = [
    { name: "Terms of Service", path: "#" },
    { name: "Privacy Policy", path: "#" },
    { name: "Disclosures", path: "#" },
    { name: "Cookie Policy", path: "#" }
  ];

  return (
    <div className="py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* About column - takes 2 grid spaces */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-teal p-1 mr-2">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-xl font-bold">NeuroTicker</span>
            </div>
            <p className="text-gray-400">
              NeuroTicker combines geospatial visualization with financial data analysis,
              providing traders and investors with location-aware market insights and 
              AI-powered trading capabilities.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10">
                <Twitter className="h-5 w-5 text-gray-400" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10">
                <Github className="h-5 w-5 text-gray-400" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="border-teal/30 text-teal hover:bg-teal/5"
              onClick={onApiModalToggle}
            >
              <Info className="h-4 w-4 mr-2" />
              API Information
            </Button>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              {mainLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white flex items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  {link.action ? (
                    <button
                      onClick={link.action}
                      className="text-gray-400 hover:text-white flex items-center"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white flex items-center"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal combined for smaller screens */}
          <div>
            <div className="mb-8">
              <h3 className="font-bold text-white text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white flex items-center"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white flex items-center"
                    >
                      {link.name}
                      {link.name === "Terms of Service" && (
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMap;
