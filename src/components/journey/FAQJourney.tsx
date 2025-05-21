
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQJourney = () => {
  const faqs = [
    {
      question: "What makes NeuroTicker different from other financial platforms?",
      answer:
        "NeuroTicker uniquely combines geospatial visualization with financial data, enabling users to see markets in a geographical context. This approach reveals hidden correlations and insights that traditional platforms miss. Additionally, our integration of Perplexity's Sonar API provides AI-powered insights that are continually updated with the latest market intelligence."
    },
    {
      question: "Does NeuroTicker support real trading or just paper trading?",
      answer:
        "NeuroTicker supports both paper trading (for practice) and real trading through our Alpaca Markets API integration. Users can start with a paper account to test strategies before moving to real trading when comfortable."
    },
    {
      question: "How does the Sonar Screener work?",
      answer:
        "The Sonar Screener leverages Perplexity's API to analyze stocks in real-time. It aggregates news, financial data, and market sentiment to provide comprehensive analysis. The system breaks down complex financial indicators into easy-to-understand insights, complete with color-coded health scores and sourced citations."
    },
    {
      question: "Can I customize the geographic regions I want to analyze?",
      answer:
        "Yes, NeuroTicker allows users to focus on specific regions, countries, or even cities. You can create custom views that track financial data relevant to your areas of interest, and set up notifications for region-specific market events."
    },
    {
      question: "How often is the market data updated?",
      answer:
        "NeuroTicker provides real-time market data during trading hours through our API integrations. Chart data updates tick-by-tick, and our news feeds are refreshed continuously as new information becomes available."
    },
    {
      question: "What types of assets can I analyze and trade on NeuroTicker?",
      answer:
        "NeuroTicker currently supports stocks, ETFs, and cryptocurrencies. We're actively working on adding support for options, futures, forex, and commodities in upcoming releases."
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
            Common Questions
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about NeuroTicker
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <AccordionItem value={`item-${index}`} className="border-b border-white/10">
                  <AccordionTrigger className="text-left text-white hover:text-teal">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-gray-300 mb-6">
            Still have questions? Our team is here to help.
          </p>
          <div className="inline-flex items-center bg-teal/10 border border-teal/20 rounded-full px-5 py-2 text-teal">
            <span>support@neuroticker.com</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQJourney;
