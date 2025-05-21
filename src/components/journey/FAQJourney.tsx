import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, ChartBar, Rocket, Lightbulb, Code, Settings, Star } from "lucide-react";
import { FAQCategoryData, faqData } from "@/data/faqData";

const categoryIcons = {
  technology: <Code className="w-5 h-5" />,
  design: <Settings className="w-5 h-5" />,
  impact: <Rocket className="w-5 h-5" />,
  idea: <Lightbulb className="w-5 h-5" />,
  market: <ChartBar className="w-5 h-5" />,
};

const FAQJourney = () => {
  const [activeTab, setActiveTab] = useState("technology");
  const [expandedItems, setExpandedItems] = useState<Record<string, string[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });

  // Initialize expanded items state
  useEffect(() => {
    const initialState: Record<string, string[]> = {};
    Object.keys(faqData).forEach(category => {
      initialState[category] = [];
    });
    setExpandedItems(initialState);
  }, []);

  const handleAccordionChange = (category: string, value: string) => {
    setExpandedItems(prev => {
      const currentItems = prev[category] || [];
      
      if (currentItems.includes(value)) {
        return {
          ...prev,
          [category]: currentItems.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentItems, value]
        };
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section 
      id="faq-journey" 
      className="py-16 md:py-24 bg-gradient-to-b from-[#0c1018] to-[#131b2e] relative overflow-hidden"
      ref={containerRef}
    >
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full">
          {Array.from({ length: 20 }).map((_, index) => (
            <div 
              key={index} 
              className="absolute rounded-full" 
              style={{
                width: Math.random() * 8 + 2 + "px", 
                height: Math.random() * 8 + 2 + "px",
                backgroundColor: `rgba(0, 184, 212, ${Math.random() * 0.2 + 0.1})`,
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(0, 184, 212, 0.3)`,
                opacity: Math.random() * 0.5 + 0.2,
                transform: `scale(${Math.random() * 0.5 + 0.8})`,
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Badge className="mb-4 bg-teal/20 text-teal border-teal/30 hover:bg-teal/30 px-3 py-1">
            FOR JUDGES & INVESTORS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Financial Intelligence <span className="text-teal">Journey</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Explore how NeuroTicker is revolutionizing financial analytics through geospatial visualization, 
            AI-driven insights, and immersive data experiences.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <motion.div 
              className="mb-12 overflow-x-auto pb-4"
              variants={itemVariants}
            >
              <TabsList className="bg-black/20 backdrop-blur-sm border border-white/10 p-1 flex w-full md:w-auto mx-auto justify-between">
                {Object.entries(faqData).map(([category, data]) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className={cn(
                      "flex flex-col md:flex-row items-center gap-2 px-4 py-3 min-w-[120px] data-[state=active]:bg-teal/20 data-[state=active]:text-teal text-sm md:text-base transition-all duration-300",
                      activeTab === category ? "shadow-[0_0_10px_rgba(0,184,212,0.3)]" : ""
                    )}
                  >
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    <span className="capitalize">{data.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            <div className="relative min-h-[600px]">
              <AnimatePresence mode="wait">
                {Object.entries(faqData).map(([category, { title, description, questions }]) => (
                  <TabsContent 
                    key={category} 
                    value={category}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      <Card className="p-6 bg-black/20 backdrop-blur-sm border border-white/10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 h-20 w-20 bg-teal/10 rounded-bl-full"></div>
                        <div className="relative z-10">
                          <div className="inline-flex items-center justify-center rounded-full bg-teal/20 p-2 mb-4">
                            {categoryIcons[category as keyof typeof categoryIcons]}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                          <p className="text-gray-300">{description}</p>
                        </div>
                      </Card>

                      <Carousel 
                        className="w-full"
                        opts={{
                          align: "start",
                          loop: false,
                        }}
                      >
                        <CarouselContent className="-ml-4">
                          {questions.map((item, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                              <div className="h-full">
                                <Card className="p-5 h-full bg-black/30 backdrop-blur-sm border border-white/10 hover:border-teal/30 transition-all duration-300 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="bg-teal/20 rounded-full p-2">
                                        {item.icon ? item.icon : <Star className="h-4 w-4 text-teal" />}
                                      </div>
                                      <Badge variant="outline" className="bg-white/5">#{index + 1}</Badge>
                                    </div>
                                    <h4 className="font-semibold text-white mb-2">{item.question}</h4>
                                    <p className="text-sm text-gray-300">{item.answer}</p>
                                  </div>
                                  
                                  {item.details && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                      <p className="text-xs text-teal">View technical details</p>
                                    </div>
                                  )}
                                </Card>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <div className="flex justify-end gap-2 mt-4">
                          <CarouselPrevious className="relative inset-0 translate-y-0" />
                          <CarouselNext className="relative inset-0 translate-y-0" />
                        </div>
                      </Carousel>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="mt-12"
                    >
                      <h3 className="text-xl font-semibold text-white mb-6">Detailed Exploration</h3>
                      <Accordion
                        type="multiple"
                        value={expandedItems[category]}
                        className="space-y-4"
                      >
                        {questions.map((item, index) => (
                          <AccordionItem
                            key={`${category}-${index}`}
                            value={`${category}-${index}`}
                            className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger 
                              onClick={() => handleAccordionChange(category, `${category}-${index}`)}
                              className="px-6 py-4 hover:bg-white/5 hover:no-underline group"
                            >
                              <div className="flex items-center gap-3 text-left">
                                <div className="bg-teal/20 rounded-full p-1.5">
                                  {item.icon ? item.icon : <Star className="h-3.5 w-3.5 text-teal" />}
                                </div>
                                <span className="text-white group-hover:text-teal transition-colors">
                                  {item.question}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                              <div className="pl-10 border-l border-teal/20">
                                <p className="text-gray-300 mb-4">{item.answer}</p>
                                
                                {item.details && (
                                  <div className="mt-4 bg-black/40 rounded-lg p-4 border border-white/5">
                                    <h5 className="text-sm font-medium text-teal mb-2">Technical Details</h5>
                                    <p className="text-sm text-gray-400">{item.details}</p>
                                  </div>
                                )}
                                {/* 
                                {item.metrics && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                    {item.metrics.map((metric, idx) => (
                                      <div key={idx} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                        <p className="text-xs text-gray-400 uppercase">{metric.label}</p>
                                        <p className="text-2xl font-semibold text-white">{metric.value}</p>
                                      </div>
                                    ))}
                                  </div>
                                )} */}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQJourney;
