
import React, { useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, X } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MarketPerformancePanel = () => {
  const { marketData } = useDashboard();
  const [isOpen, setIsOpen] = useState(true);

  // Format number with + sign for positive values
  const formatChange = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  return (
    <div 
      className={`absolute top-0 right-0 h-full z-10 transition-all duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-44px)]"
      }`}
    >
      {/* Toggle button */}
      <div 
        className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-[20px] bg-black/40 backdrop-blur-md rounded-l-lg p-2 cursor-pointer z-20 border border-r-0 border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronRight className="h-5 w-5 text-white/70" /> : <ChevronLeft className="h-5 w-5 text-white/70" />}
      </div>
      
      {/* Main panel */}
      <div className="h-full w-[320px] bg-black/40 backdrop-blur-md border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Market Performance</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-3 space-y-4">
          {marketData.map((index) => (
            <Card key={index.id} className="bg-black/30 border border-white/10 text-white overflow-hidden">
              <CardHeader className="p-3 pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{index.name}</CardTitle>
                  <div className={`text-base font-mono ${index.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    {index.current.toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 pt-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div 
                    className={`flex items-center ${
                      index.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {index.trend === "up" ? 
                      <TrendingUp className="h-4 w-4 mr-1" /> : 
                      <TrendingDown className="h-4 w-4 mr-1" />
                    }
                    <span className="text-sm font-mono">
                      {formatChange(index.change)} ({formatChange(index.changePercent)}%)
                    </span>
                  </div>
                </div>
                
                {/* Sparkline chart */}
                <div className="h-[70px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={index.history}>
                      <XAxis 
                        dataKey="date" 
                        hide={true} 
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        hide={true} 
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const value = payload[0].value;
                            return (
                              <div className="bg-black/80 border border-white/10 rounded p-2 text-xs">
                                <p className="mb-1">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                                <p className="font-mono text-white">
                                  {typeof value === 'number' ? value.toFixed(2) : value}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={index.trend === "up" ? "#10B981" : "#EF4444"} 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketPerformancePanel;
