
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Mock data for market indices
const marketIndices = [
  { 
    name: 'S&P 500', 
    value: '4,587.64', 
    change: '+12.37', 
    percentChange: '+0.27%', 
    trend: 'up',
    sparkline: [2, 3, 2, 4, 3, 5, 4, 6, 5, 7]
  },
  { 
    name: 'Nasdaq', 
    value: '14,346.02', 
    change: '+87.30', 
    percentChange: '+0.61%', 
    trend: 'up',
    sparkline: [4, 5, 3, 5, 6, 5, 7, 8, 7, 9]
  },
  { 
    name: 'Dow Jones', 
    value: '36,117.38', 
    change: '-70.13', 
    percentChange: '-0.19%', 
    trend: 'down',
    sparkline: [8, 7, 9, 6, 7, 5, 6, 4, 5, 3]
  },
  { 
    name: 'Russell 2000', 
    value: '1,851.96', 
    change: '+18.64', 
    percentChange: '+1.02%', 
    trend: 'up',
    sparkline: [3, 2, 4, 3, 5, 4, 6, 5, 7, 6]
  },
];

// Asian markets data
const asianMarkets = [
  { 
    name: 'Nikkei 225', 
    value: '33,408.39', 
    change: '-130.78', 
    percentChange: '-0.39%', 
    trend: 'down',
    sparkline: [6, 5, 7, 4, 5, 3, 4, 2, 3, 1]
  },
  { 
    name: 'Hang Seng', 
    value: '16,042.71', 
    change: '+253.64', 
    percentChange: '+1.61%', 
    trend: 'up',
    sparkline: [2, 3, 2, 4, 3, 5, 4, 7, 6, 8]
  },
];

// European markets data
const europeanMarkets = [
  { 
    name: 'FTSE 100', 
    value: '7,512.58', 
    change: '+34.85', 
    percentChange: '+0.47%', 
    trend: 'up',
    sparkline: [4, 3, 5, 4, 6, 5, 7, 6, 8, 7]
  },
  { 
    name: 'DAX', 
    value: '16,634.08', 
    change: '-70.46', 
    percentChange: '-0.42%', 
    trend: 'down',
    sparkline: [7, 6, 8, 5, 6, 4, 5, 3, 4, 2]
  },
];

// Mini sparkline chart component
const MiniSparkline = ({ data, trend }: { data: number[], trend: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="24" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={trend === 'up' ? '#00e676' : '#ff5252'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Market index card component
const MarketCard = ({ market }: { market: any }) => (
  <div className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors rounded-md group">
    <div>
      <h3 className="text-white font-medium">{market.name}</h3>
    </div>
    <div className="flex items-center gap-3">
      <span className="font-mono text-white">{market.value}</span>
      <div className="flex flex-col items-end min-w-[80px]">
        <span className={`font-mono text-sm ${market.trend === 'up' ? 'text-[#00e676]' : 'text-[#ff5252]'}`}>
          {market.trend === 'up' ? '+' : ''}{market.change}
        </span>
        <span className={`font-mono text-xs ${market.trend === 'up' ? 'text-[#00e676]' : 'text-[#ff5252]'}`}>
          {market.percentChange}
        </span>
      </div>
      <div className="w-[60px] opacity-70 group-hover:opacity-100 transition-opacity">
        <MiniSparkline data={market.sparkline} trend={market.trend} />
      </div>
    </div>
  </div>
);

const MarketPerformancePanel = () => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="h-full flex">
        <button 
          onClick={() => setCollapsed(false)}
          className="h-full w-8 bg-[#1a2035]/80 backdrop-blur-sm rounded-l-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Card className="h-full bg-[#1a2035]/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="text-lg font-medium text-white">Market Performance</h2>
        <button 
          onClick={() => setCollapsed(true)}
          className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronUp className="h-4 w-4 text-white" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* US Indices Section */}
        <div className="p-4">
          <h3 className="text-sm text-[#a0aec0] mb-2 font-medium">US INDICES</h3>
          <div className="space-y-1">
            {marketIndices.map((market, index) => (
              <MarketCard key={index} market={market} />
            ))}
          </div>
        </div>
        
        {/* Asian Markets Section */}
        <Collapsible className="px-4 mb-2">
          <div className="flex items-center justify-between py-2">
            <h3 className="text-sm text-[#a0aec0] font-medium">ASIAN MARKETS</h3>
            <CollapsibleTrigger className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <ChevronDown className="h-3 w-3 text-[#a0aec0]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="space-y-1">
              {asianMarkets.map((market, index) => (
                <MarketCard key={index} market={market} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* European Markets Section */}
        <Collapsible className="px-4">
          <div className="flex items-center justify-between py-2">
            <h3 className="text-sm text-[#a0aec0] font-medium">EUROPEAN MARKETS</h3>
            <CollapsibleTrigger className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <ChevronDown className="h-3 w-3 text-[#a0aec0]" />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="space-y-1">
              {europeanMarkets.map((market, index) => (
                <MarketCard key={index} market={market} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      <div className="bg-gradient-to-r from-[#7b61ff]/20 to-[#00b8d4]/20 p-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[#a0aec0]">GLOBAL MARKET CAP</p>
            <p className="font-mono text-white text-lg">$93.4T</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#00e676]/20 flex items-center justify-center">
              <ArrowUp className="h-4 w-4 text-[#00e676]" />
            </div>
            <span className="font-mono text-[#00e676]">+1.2%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketPerformancePanel;
