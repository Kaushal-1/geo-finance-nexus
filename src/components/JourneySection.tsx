import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, Rocket, Flag, Star, Award, MapPin } from "lucide-react";
import FuturePlansTimeline from "./journey/FuturePlansTimeline";

const journeyMilestones = [
  {
    id: 1,
    title: "Concept & Research",
    date: "1st of May 2025 Q2",
    icon: Flag,
    description: "Initial market research and concept validation with financial analysts",
    achievement: "Identified key market gap in geospatial analytics",
    metric: "Analyzed 100+ sources"
  },
  {
    id: 2,
    title: "Technology Foundation",
    date: "10th of May 2025 Q2",
    icon: MapPin,
    description: "Built core mapping technology and data integration architecture",
    achievement: "Completed prototype of GeoMapboard",
    metric: "3 mapping APIs integrated"
  },
  {
    id: 3,
    title: "Core Product Development",
    date: "14th of May 2025 Q2",
    icon: Rocket,
    description: "Developed full working platform with trading integration and analytics",
    achievement: "Successful alpha testing with select partners",
    metric: "87% positive feedback from testers"
  },
  {
    id: 4,
    title: "Market Validation",
    date: "16th of May 2025 Q2",
    icon: Star,
    description: "Expanded to beta program ",
    achievement: "Secured the mentorship program",
    metric: "Published the website for the public"
  },
  {
    id: 5,
    title: "Current Growth",
    date: "17th of May 2025 Q2",
    icon: Award,
    description: "Platform expansion with Sonar API integration and global coverage",
    achievement: "Growing user base with strong retention metrics",
    metric: "1000+ stocks analyzed"
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const progressVariant = {
  hidden: { width: "0%" },
  visible: { width: "100%" }
};

const JourneySection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/0 via-teal/5 to-black/0 pointer-events-none"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-10 w-24 h-24 rounded-full bg-teal/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-10 w-32 h-32 rounded-full bg-teal/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="border-teal/30 bg-teal/5 text-teal px-3 py-1 mb-4">
            Our Innovation Path
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The GeoFinance Nexus Journey
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From concept to market-changing innovation - the evolution of our platform
          </p>
        </motion.div>

        {/* Timeline for desktop */}
        <div className="hidden md:block relative">
          {/* Progress line */}
          <div className="absolute top-16 left-0 right-0 h-1 bg-gray-800">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal to-teal-dark"
              variants={progressVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            ></motion.div>
          </div>

          <div className="flex justify-between relative">
            {journeyMilestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.div 
                  key={milestone.id}
                  className="w-1/5 px-3"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="relative">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 rounded-full bg-teal-gradient flex items-center justify-center z-10 relative button-glow">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card card-hover mt-12 p-5 rounded-xl h-full">
                    <div className="text-teal text-sm font-mono mb-1">{milestone.date}</div>
                    <h3 className="text-white text-lg font-bold mb-2">{milestone.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{milestone.description}</p>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="bg-black/30 rounded-md p-2 text-center">
                            <div className="text-teal font-bold">{milestone.metric}</div>
                            <div className="text-xs text-gray-400">{milestone.achievement}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{milestone.achievement}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline for mobile - vertical */}
        <div className="md:hidden relative">
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-800">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-teal to-teal-dark"
              style={{ height: "0%" }}
              animate={{ height: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            ></motion.div>
          </div>
          
          <div className="space-y-10">
            {journeyMilestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <motion.div 
                  key={milestone.id}
                  className="pl-12 relative"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-teal-gradient flex items-center justify-center z-10 button-glow">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="glass-card p-4 rounded-xl">
                    <div className="text-teal text-sm font-mono mb-1">{milestone.date}</div>
                    <h3 className="text-white text-lg font-bold mb-2">{milestone.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{milestone.description}</p>
                    
                    <div className="bg-black/30 rounded-md p-2 text-center">
                      <div className="text-teal font-bold">{milestone.metric}</div>
                      <div className="text-xs text-gray-400">{milestone.achievement}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-xl text-gray-300 mb-6">Excited to continue our journey with visionary investors</p>
          <div className="inline-flex items-center bg-teal/10 border border-teal/20 rounded-full px-5 py-2 text-teal">
            <span className="mr-2">Next milestone: Global Market Expansion</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
        
        {/* Future Plans Timeline Section */}
        <FuturePlansTimeline />
      </div>
    </section>
  );
};

export default JourneySection;
