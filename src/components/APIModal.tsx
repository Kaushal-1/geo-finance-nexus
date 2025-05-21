
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface APIModalProps {
  open: boolean;
  onClose: () => void;
}

const APIModal = ({ open, onClose }: APIModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] border-white/10 bg-[#1a1f2e]/95 backdrop-blur-lg text-white p-0 gap-0">
        <div className="sticky top-0 z-10 bg-[#1a1f2e]/95 backdrop-blur-lg border-b border-white/10 p-4">
          <DialogHeader className="mb-0">
            <DialogTitle className="text-xl font-bold text-white">
              APIs Used in NeuroTicker
            </DialogTitle>
          </DialogHeader>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <ScrollArea className="h-[60vh] p-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-400 flex items-center">
                <span className="bg-teal-500/20 p-1 rounded-md mr-2">📘</span> 
                We Use the Following APIs:
              </h3>
              
              <div className="grid gap-4">
                {/* SONAR API */}
                <div className="p-4 rounded-lg border border-teal-500/30 bg-teal-500/5 transition-all duration-300 hover:bg-teal-500/10 hover:border-teal-500/40">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <span className="text-lg">🔍</span>
                    </div>
                    <div>
                      <h4 className="text-md font-bold text-teal-300">SONAR API by Perplexity</h4>
                      <p className="text-sm text-teal-200/70">Primary AI engine powering the platform</p>
                    </div>
                  </div>
                </div>
                
                {/* TRADING API */}
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <div>
                      <h4 className="text-md font-bold">TRADING API by Alpaca</h4>
                      <p className="text-sm text-gray-400">Stock trading and market data</p>
                    </div>
                  </div>
                </div>
                
                {/* MAP API */}
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-lg">🗺️</span>
                    </div>
                    <div>
                      <h4 className="text-md font-bold">MAP API by Mapbox</h4>
                      <p className="text-sm text-gray-400">Globe visualization and geospatial mapping</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="bg-white/10 p-1 rounded-md mr-2">🚀</span> 
                How We Use Them
              </h3>
              
              <Accordion type="single" collapsible className="w-full">
                {/* Map Dashboard Section */}
                <AccordionItem value="map-dashboard" className="border-white/10">
                  <AccordionTrigger className="text-md font-medium hover:text-teal-400 py-3">
                    1. Map Dashboard
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="pl-4 border-l-2 border-teal-500/50 space-y-2">
                        <h4 className="font-semibold text-teal-400">SONAR API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Fetches real-time stock-specific news.</li>
                          <li>• Displays country-wise economic updates in the Global News section.</li>
                        </ul>
                      </div>
                      
                      <div className="pl-4 border-l-2 border-blue-500/50 space-y-2">
                        <h4 className="font-semibold text-blue-400">Mapbox API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Powers the animated globe visualization with real-time overlays.</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Trading Dashboard Section */}
                <AccordionItem value="trading-dashboard" className="border-white/10">
                  <AccordionTrigger className="text-md font-medium hover:text-teal-400 py-3">
                    2. Trading Dashboard
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="pl-4 border-l-2 border-teal-500/50 space-y-2">
                        <h4 className="font-semibold text-teal-400">SONAR API</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li>• Powers the Sonar Screener: retrieves latest stock-specific news and generates AI summaries.</li>
                          <li>• Adds citations so users can explore original sources.</li>
                          <li>• Enables Sonar Market Analysis Tool with technical & fundamental breakdown.</li>
                          
                          <li className="bg-black/30 p-3 rounded-lg border border-white/5 mt-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>Price: $207.93</div>
                              <div>52-Week Range: $202.95 - $213.94</div>
                              <div>RSI (14): 30.6 (Oversold)</div>
                              <div>P/E Ratio: 25.5</div>
                              <div>Market Cap: 2.5T</div>
                              <div>Dividend Yield: 0.05%</div>
                              <div>Beta: 1.2</div>
                            </div>
                            
                            <div className="mt-2 text-xs">
                              <div className="font-semibold text-gray-200">Moving Averages:</div>
                              <div>50-day MA: $209.51</div>
                              <div>200-day MA: $210.03</div>
                              <div>MACD: -0.43, Signal: -0.47, Histogram: 0.04 (Bullish)</div>
                            </div>
                            
                            <div className="mt-2 text-xs">
                              <div className="font-semibold text-gray-200">Summary Recommendation:</div>
                              <div>Oscillators: 8 Neutral</div>
                              <div>Moving Averages: 1 Neutral</div>
                              <div className="font-semibold text-gray-200 mt-1">Overall: Neutral</div>
                            </div>
                          </li>
                          <li>• 🧠 Indicator-Based Verdict: A recommendation with vote percentages (Buy/Sell/Neutral).</li>
                          <li className="font-semibold text-teal-400">💡 Entirely powered by SONAR API</li>
                        </ul>
                      </div>
                      
                      <div className="pl-4 border-l-2 border-blue-500/50 space-y-2">
                        <h4 className="font-semibold text-blue-400">Alpaca API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Fetches live stock charts</li>
                          <li>• Enables paper trading (buy/sell simulation)</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Compare Stocks Page Section */}
                <AccordionItem value="compare-stocks" className="border-white/10">
                  <AccordionTrigger className="text-md font-medium hover:text-teal-400 py-3">
                    3. Compare Stocks Page
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="pl-4 border-l-2 border-teal-500/50 space-y-2">
                        <h4 className="font-semibold text-teal-400">SONAR API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Lets users compare two stocks side by side.</li>
                          <li>• Provides detailed analysis, with:</li>
                          <li className="pl-4">- Technical indicators</li>
                          <li className="pl-4">- Sentiment scoring</li>
                          <li className="pl-4">- AI summary of latest news (with citations)</li>
                          <li className="pl-4">- A Buy Recommendation Panel</li>
                        </ul>
                      </div>
                      
                      <div className="pl-4 border-l-2 border-blue-500/50 space-y-2">
                        <h4 className="font-semibold text-blue-400">Alpaca API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Retrieves real-time chart data for both stocks</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Sonar Researcher Page Section */}
                <AccordionItem value="sonar-researcher" className="border-white/10">
                  <AccordionTrigger className="text-md font-medium hover:text-teal-400 py-3">
                    4. Sonar Researcher Page
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="pl-4 border-l-2 border-teal-500/50 space-y-2">
                        <h4 className="font-semibold text-teal-400">SONAR API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• A specialized chat assistant for financial research</li>
                          <li>• Tailored to user's trading portfolio</li>
                          <li>• Can answer real-time financial queries</li>
                          <li>• Personalizes answers using live portfolio + market data</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Telegram Bot Integration */}
                <AccordionItem value="telegram-bot" className="border-white/10">
                  <AccordionTrigger className="text-md font-medium hover:text-teal-400 py-3">
                    5. Telegram Bot Integration
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <div className="pl-4 border-l-2 border-teal-500/50 space-y-2">
                        <h4 className="font-semibold text-teal-400">SONAR API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Powers NeuroTickerrBot via /chat feature.</li>
                          <li>• Sends alerts, stock updates, and real-time news.</li>
                        </ul>
                      </div>
                      
                      <div className="pl-4 border-l-2 border-blue-500/50 space-y-2">
                        <h4 className="font-semibold text-blue-400">Alpaca API</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Executes buy/sell commands based on user prompts</li>
                          <li>• Lets users trade directly from Telegram</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default APIModal;
