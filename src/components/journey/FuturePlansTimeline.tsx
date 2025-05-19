
import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "framer-motion";
import { TrendingUp, Users, Calendar, Radar, ArrowRight, Code, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface FutureFeature {
  id: number;
  title: string;
  timeline: string;
  icon: React.ElementType;
  description: string;
  details: string[];
  highlightText: string;
  techStack: string[];
}

const futureFeatures: FutureFeature[] = [
  {
    id: 1,
    title: "Sentiment Heatmap",
    timeline: "Q3 2025",
    icon: TrendingUp,
    description: "Global & Sector-Wise Real-time Market Sentiment Analysis",
    details: [
      "Real-time sentiment visualization across countries and sectors",
      "Sector-specific insights for Tech, Energy, Health, etc.",
      "Dynamic green/red indicators showing market mood shifts",
      "Interactive click-to-drill functionality for deeper analysis"
    ],
    highlightText: "Leveraging Sonar's AI to detect sentiment shifts before markets react",
    techStack: ["Mapbox Heatmaps", "Sonar API", "Sentiment Analysis"]
  },
  {
    id: 2,
    title: "Social Trading Feed",
    timeline: "Q4 2025",
    icon: Users,
    description: "Community-powered Trading Insights and Portfolio Sharing",
    details: [
      "Follow top traders and learn from their strategies",
      "AI-generated summaries explaining trade logic",
      "Performance leaderboard with verified tracking",
      "Engage through likes, comments, and shares"
    ],
    highlightText: "Democratizing financial wisdom through community intelligence",
    techStack: ["Alpaca API", "Sonar AI Summaries", "Real-time Feeds"]
  },
  {
    id: 3,
    title: "Earnings Calendar",
    timeline: "Q1 2026",
    icon: Calendar,
    description: "Integrated Earnings Reports with AI-powered Analyst Forecasts",
    details: [
      "Comprehensive view of upcoming earnings events",
      "AI-extracted summaries and key metrics",
      "Forecasted EPS, revenue, and rating changes",
      "Smart alerts for stocks in user portfolios"
    ],
    highlightText: "Turning earnings noise into actionable intelligence",
    techStack: ["Calendar UI", "Sonar Forecasting", "Alert System"]
  },
  {
    id: 4,
    title: "Local Investment Radar",
    timeline: "Q2 2026",
    icon: Radar,
    description: "Discover Emerging Microeconomic Activity Before Big Investors",
    details: [
      "Early detection of local growth signals across geographies",
      "Microeconomic activity indicators and patterns",
      "Geographic investment opportunities visualization",
      "Proprietary scoring of emerging market trends"
    ],
    highlightText: "Sonar surfaces emerging signals—before institutional investors catch on",
    techStack: ["Geospatial Analysis", "Sonar API", "Predictive Modeling"]
  }
];

const FuturePlansTimeline: React.FC = () => {
  // Animation controls
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: false, amount: 0.2 });
  
  // Start animations when component comes into view
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);
  
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const lineVariants = {
    hidden: { scaleY: 0, originY: 0 },
    visible: { 
      scaleY: 1, 
      transition: { 
        duration: 1.5, 
        ease: "easeInOut"
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay: 0.3
      }
    }
  };
  
  return (
    <div className="py-16 relative overflow-hidden" ref={containerRef}>
      {/* Background elements */}
      <div className="absolute top-1/3 left-10 w-64 h-64 rounded-full bg-teal/5 blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-10 w-72 h-72 rounded-full bg-teal/5 blur-[120px]"></div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="outline" className="border-teal/30 bg-teal/5 text-teal px-3 py-1 mb-4">
            Looking Ahead
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Future Innovation Roadmap
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our vision for expanding the GeoFinance Nexus ecosystem with cutting-edge features
          </p>
        </motion.div>

        <motion.div 
          className="relative max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-800 md:left-1/2 md:transform md:-translate-x-1/2">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-b from-teal via-teal/50 to-teal/20"
              variants={lineVariants}
            ></motion.div>
          </div>
          
          {/* Timeline Items */}
          {futureFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div 
                key={feature.id}
                className={`relative flex mb-20 last:mb-0 ${index === futureFeatures.length - 1 ? '' : 'pb-8'}`}
                variants={itemVariants}
              >
                {/* Timeline node */}
                <div className="absolute left-8 w-1 flex items-center justify-center md:left-1/2 md:transform md:-translate-x-1/2">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-teal-gradient flex items-center justify-center z-10 button-glow"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 + 0.5, duration: 0.5, type: "spring" }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>
                </div>

                {/* Content alignment based on even/odd for desktop */}
                <div className={`w-full pl-20 md:w-1/2 md:pl-0 ${isEven ? 'md:pr-16' : 'md:pl-16 md:ml-auto'}`}>
                  {/* Timeline badge */}
                  <motion.div 
                    className="inline-block mb-3"
                    variants={badgeVariants}
                  >
                    <Badge className="bg-teal/20 text-teal border-none px-3 py-1 text-sm font-mono">
                      {feature.timeline}
                    </Badge>
                  </motion.div>

                  {/* Feature card */}
                  <motion.div 
                    className="glass-card card-hover p-6 rounded-xl h-full ripple"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 184, 212, 0.2)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <h3 className="text-white text-2xl font-bold mb-3 flex items-center">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 text-lg">
                      {feature.description}
                    </p>
                    
                    <div className="answer-highlight mb-5">
                      <p className="text-teal font-medium italic">"{feature.highlightText}"</p>
                    </div>

                    <div className="space-y-2 mb-5">
                      {feature.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start">
                          <ArrowRight className="h-4 w-4 text-teal mt-1 mr-2 flex-shrink-0" />
                          <p className="text-gray-400">{detail}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <TooltipProvider>
                        {feature.techStack.map((tech, idx) => (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="bg-black/30 rounded-full px-3 py-1 text-xs font-mono text-teal flex items-center gap-1">
                                <Code className="h-3 w-3" />
                                {tech}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Technology: {tech}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Final node */}
          <motion.div
            className="absolute bottom-0 left-8 md:left-1/2 md:transform md:-translate-x-1/2 mb-0"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-dark to-teal-light flex items-center justify-center z-10">
              <Globe className="h-8 w-8 text-white" />
            </div>
          </motion.div>
        </motion.div>
        
        {/* Call to action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.7 }}
        >
          <p className="text-xl text-gray-300 mb-4">
            Ready to join us on this journey of innovation?
          </p>
          <div className="inline-flex items-center bg-teal/10 border border-teal/20 rounded-full px-5 py-2 text-teal">
            <span className="mr-2">We're just getting started</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FuturePlansTimeline;
