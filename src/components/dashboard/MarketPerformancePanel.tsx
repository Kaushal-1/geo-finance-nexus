
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMarketData } from '@/hooks/useMarketData';
import { FormattedMarketData } from '@/services/marketService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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
const MarketCard = ({ market }: { market: FormattedMarketData }) => (
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
          {market.trend === 'up' ? '+' : ''}{market.percentChange}%
        </span>
      </div>
      <div className="w-[60px] opacity-70 group-hover:opacity-100 transition-opacity">
        <MiniSparkline data={market.sparkline} trend={market.trend} />
      </div>
    </div>
  </div>
);

// Loading skeleton for market card
const MarketCardSkeleton = () => (
  <div className="flex items-center justify-between p-3 border-b border-white/5 rounded-md">
    <Skeleton className="h-5 w-24 bg-white/10" />
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-16 bg-white/10" />
      <div className="flex flex-col items-end min-w-[80px]">
        <Skeleton className="h-4 w-12 bg-white/10 mb-1" />
        <Skeleton className="h-3 w-10 bg-white/10" />
      </div>
      <Skeleton className="h-6 w-[60px] bg-white/10" />
    </div>
  </div>
);

const MarketPerformancePanel = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { 
    usMarketData, 
    asianMarketData, 
    europeanMarketData, 
    globalMetrics,
    refreshData,
    isLoading,
    error
  } = useMarketData();

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
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-white">Market Performance</h2>
          {isLoading && <span className="animate-pulse text-xs text-[#a0aec0]">updating...</span>}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshData}
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <button 
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ChevronUp className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* US Indices Section */}
        <div className="p-4">
          <h3 className="text-sm text-[#a0aec0] mb-2 font-medium">US INDICES</h3>
          <div className="space-y-1">
            {isLoading && usMarketData.length === 0 ? (
              // Loading skeleton
              Array(4).fill(0).map((_, index) => <MarketCardSkeleton key={index} />)
            ) : usMarketData.length > 0 ? (
              usMarketData.map((market) => (
                <MarketCard key={market.symbol} market={market} />
              ))
            ) : (
              <div className="p-3 text-center text-[#a0aec0] text-sm">
                No market data available
              </div>
            )}
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
              {isLoading && asianMarketData.length === 0 ? (
                // Loading skeleton
                Array(2).fill(0).map((_, index) => <MarketCardSkeleton key={index} />)
              ) : asianMarketData.length > 0 ? (
                asianMarketData.map((market) => (
                  <MarketCard key={market.symbol} market={market} />
                ))
              ) : (
                <div className="p-3 text-center text-[#a0aec0] text-sm">
                  No Asian market data available
                </div>
              )}
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
              {isLoading && europeanMarketData.length === 0 ? (
                // Loading skeleton
                Array(2).fill(0).map((_, index) => <MarketCardSkeleton key={index} />)
              ) : europeanMarketData.length > 0 ? (
                europeanMarketData.map((market) => (
                  <MarketCard key={market.symbol} market={market} />
                ))
              ) : (
                <div className="p-3 text-center text-[#a0aec0] text-sm">
                  No European market data available
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      <div className="bg-gradient-to-r from-[#7b61ff]/20 to-[#00b8d4]/20 p-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[#a0aec0]">GLOBAL MARKET CAP</p>
            <p className="font-mono text-white text-lg">${globalMetrics.marketCap}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full ${globalMetrics.direction === 'up' ? 'bg-[#00e676]/20' : 'bg-[#ff5252]/20'} flex items-center justify-center`}>
              {globalMetrics.direction === 'up' 
                ? <ArrowUp className="h-4 w-4 text-[#00e676]" />
                : <ArrowDown className="h-4 w-4 text-[#ff5252]" />
              }
            </div>
            <span className={`font-mono ${globalMetrics.direction === 'up' ? 'text-[#00e676]' : 'text-[#ff5252]'}`}>
              {globalMetrics.direction === 'up' ? '+' : ''}{globalMetrics.performance}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#a0aec0] mt-2 flex items-center gap-1">
          <span>Last updated: {globalMetrics.lastUpdated.toLocaleTimeString()}</span>
          {isLoading && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>}
        </p>
      </div>
    </Card>
  );
};

export default MarketPerformancePanel;
