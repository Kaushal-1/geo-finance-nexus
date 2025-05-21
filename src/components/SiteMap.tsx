
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// Define site map structure
const siteMapData = [
  {
    title: "Platform",
    links: [
      { name: "Home", path: "/" },
      { name: "Mapboard", path: "/dashboard" },
      { name: "Trading Platform", path: "/trading" },
      { name: "Stock Comparer", path: "/stock-compare" },
      { name: "Sonar Research", path: "/chat-research" }
    ]
  },
  {
    title: "Account",
    links: [
      { name: "Sign In", path: "/signin" },
      { name: "Create Account", path: "/signup" },
      { name: "Account Settings", path: "/account-settings" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", path: "#documentation", external: true },
      { name: "APIs Used", path: "#apis-used", action: "showApiModal" },
      { name: "FAQ for Investors", path: "#faq", anchor: true }
    ]
  },
  {
    title: "Sections",
    links: [
      { name: "Analytics", path: "#features", anchor: true },
      { name: "Journey", path: "#journey", anchor: true },
      { name: "Plans", path: "#plans", anchor: true },
      { name: "FAQ", path: "#faq", anchor: true }
    ]
  }
];

interface SiteMapProps {
  onApiModalToggle: () => void;
}

const SiteMap = ({ onApiModalToggle }: SiteMapProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  const handleLinkClick = (link: any) => {
    if (link.action === "showApiModal") {
      onApiModalToggle();
    }
    
    if (link.anchor) {
      // Handle smooth scrolling for anchors
      const element = document.getElementById(link.path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <motion.div 
      className="site-map py-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-xl font-bold text-white mb-6"
          variants={fadeInUp}
        >
          Site Map
        </motion.h2>
        
        {/* Desktop version - Grid layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
          {siteMapData.map((category, idx) => (
            <motion.div 
              key={idx}
              className="space-y-3"
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <h3 className="text-teal font-semibold text-sm uppercase tracking-wider">{category.title}</h3>
              <Separator className="bg-white/10" />
              <ul className="space-y-2">
                {category.links.map((link, linkIdx) => (
                  <motion.li 
                    key={linkIdx}
                    className="text-gray-300 hover:text-white transition-colors"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.external ? (
                      <a 
                        href={link.path} 
                        className="flex items-center gap-1 hover:text-teal transition-colors"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {link.name}
                        <ExternalLink size={12} />
                      </a>
                    ) : link.action || link.anchor ? (
                      <button 
                        onClick={() => handleLinkClick(link)}
                        className="text-left flex items-center gap-1 hover:text-teal transition-colors w-full"
                      >
                        {link.name}
                        {link.anchor && <ChevronDown size={12} />}
                      </button>
                    ) : (
                      <Link to={link.path} className="flex items-center hover:text-teal transition-colors">
                        {link.name}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        {/* Mobile version - Accordion layout */}
        <div className="md:hidden">
          <Accordion type="multiple" className="w-full">
            {siteMapData.map((category, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-white/10">
                <AccordionTrigger className="hover:text-teal text-white py-3">
                  <span className="text-sm font-medium">{category.title}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 py-2">
                    {category.links.map((link, linkIdx) => (
                      <li key={linkIdx} className="pl-2">
                        {link.external ? (
                          <a 
                            href={link.path} 
                            className="flex items-center gap-1 text-gray-300 hover:text-teal"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {link.name}
                            <ExternalLink size={12} />
                          </a>
                        ) : link.action || link.anchor ? (
                          <button 
                            onClick={() => handleLinkClick(link)}
                            className="text-left flex items-center gap-1 text-gray-300 hover:text-teal w-full"
                          >
                            {link.name}
                            {link.anchor && <ChevronDown size={12} />}
                          </button>
                        ) : (
                          <Link to={link.path} className="text-gray-300 hover:text-teal flex items-center">
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteMap;
