
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import StockComparisonChart from "@/components/trading/StockComparisonChart";
import StockSelector from "@/components/trading/StockSelector";
import StockAnalysisPanel from "@/components/trading/StockAnalysisPanel";
import StockNewsPanel from "@/components/trading/StockNewsPanel";
import StockRecommendation from "@/components/trading/StockRecommendation";
import { alpacaService } from "@/services/alpacaService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const StockCompare = () => {
  const [stock1, setStock1] = useState("AAPL");
  const [stock2, setStock2] = useState("MSFT");
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimePrices, setRealTimePrices] = useState<{[key: string]: number}>({});
  const [error, setError] = useState<string | null>(null);
  
  // Fetch initial price data for the stocks
  const fetchInitialPrices = useCallback(async (symbols: string[]) => {
    try {
      console.log("Fetching initial prices for", symbols);
      setError(null);
      const promises = symbols.map(symbol => 
        alpacaService.getBars(symbol, "1Day", 1).catch(err => {
          console.error(`Error fetching bars for ${symbol}:`, err);
          return null;
        })
      );
      
      const results = await Promise.all(promises);
      
      const prices: {[key: string]: number} = {};
      symbols.forEach((symbol, index) => {
        const data = results[index];
        if (data && data.length > 0) {
          prices[symbol] = data[data.length - 1].c;
        } else {
          console.warn(`No price data found for ${symbol}`);
        }
      });
      
      console.log("Fetched initial prices:", prices);
      setRealTimePrices(prices);
    } catch (error) {
      console.error("Error fetching initial prices:", error);
      setError("Failed to fetch initial price data. Please try again.");
      // Still set comparison to true so UI doesn't hang
      toast({
        title: "Warning",
        description: "Could not fetch all stock data. Some information may be missing.",
        variant: "destructive"
      });
    }
  }, []);
  
  // Handle comparison button click
  const handleCompare = useCallback(async () => {
    if (stock1 === stock2) {
      toast({
        title: "Cannot Compare",
        description: "Please select two different stocks for comparison",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setIsComparing(false);
    setError(null);
    
    try {
      const symbols = [stock1, stock2];
      await fetchInitialPrices(symbols);
      setIsComparing(true);
    } catch (error) {
      console.error("Error starting comparison:", error);
      setError("Failed to start stock comparison. Please try again.");
      toast({
        title: "Comparison Error",
        description: "Failed to start stock comparison",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [stock1, stock2, fetchInitialPrices]);
  
  // Load initial data when stocks change
  useEffect(() => {
    if (isComparing) {
      fetchInitialPrices([stock1, stock2]);
    }
  }, [stock1, stock2, isComparing, fetchInitialPrices]);

  // Initial data load on mount
  useEffect(() => {
    // For hot reload/dynamic loading in production environment
    const loadDefaultComparison = async () => {
      setIsLoading(true);
      try {
        await fetchInitialPrices(['AAPL', 'MSFT']);
        setIsComparing(true);
      } catch (err) {
        console.error("Error loading default comparison:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Auto-start comparison if we have default symbols
    if (stock1 && stock2 && stock1 !== stock2) {
      loadDefaultComparison();
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <DashboardHeader />
      <div className="container p-4 md:p-6 mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Stock Comparison Tool</h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Compare stocks with in-depth technical and fundamental analysis
          </p>
        </div>
        
        {/* Stock Selection */}
        <Card className="bg-black/20 border-gray-800 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Stock 1</label>
                <StockSelector 
                  value={stock1}
                  onChange={setStock1}
                  disabled={isLoading}
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Stock 2</label>
                <StockSelector 
                  value={stock2}
                  onChange={setStock2}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleCompare}
                disabled={isLoading || !stock1 || !stock2}
                className="bg-teal-600 hover:bg-teal-700"
                size="lg"
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {isLoading ? "Loading..." : "Compare Stocks"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Comparison Content - Only shown after clicking Compare */}
        {isComparing && (
          <ErrorBoundary fallback={<div className="p-8 text-center text-red-400">An error occurred loading comparison data. Please try refreshing the page.</div>}>
            {/* Chart Comparison - Single chart showing both stocks */}
            <Card className="bg-black/20 border-gray-800 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span>Performance Comparison</span>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-blue-500 mr-1">■</span>
                      {stock1}: {realTimePrices[stock1] ? `$${realTimePrices[stock1].toFixed(2)}` : "Loading..."}
                    </div>
                    <div>
                      <span className="text-amber-500 mr-1">■</span>
                      {stock2}: {realTimePrices[stock2] ? `$${realTimePrices[stock2].toFixed(2)}` : "Loading..."}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StockComparisonChart symbols={[stock1, stock2]} />
              </CardContent>
            </Card>
            
            {/* Analysis Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ErrorBoundary fallback={<Skeleton className="h-96 w-full bg-gray-800/50" />}>
                <StockAnalysisPanel symbol={stock1} />
              </ErrorBoundary>
              <ErrorBoundary fallback={<Skeleton className="h-96 w-full bg-gray-800/50" />}>
                <StockAnalysisPanel symbol={stock2} />
              </ErrorBoundary>
            </div>
            
            {/* News Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ErrorBoundary fallback={<Skeleton className="h-96 w-full bg-gray-800/50" />}>
                <StockNewsPanel symbol={stock1} />
              </ErrorBoundary>
              <ErrorBoundary fallback={<Skeleton className="h-96 w-full bg-gray-800/50" />}>
                <StockNewsPanel symbol={stock2} />
              </ErrorBoundary>
            </div>
            
            {/* Buy Recommendation */}
            <ErrorBoundary fallback={<Skeleton className="h-40 w-full bg-gray-800/50" />}>
              <StockRecommendation stock1={stock1} stock2={stock2} />
            </ErrorBoundary>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default StockCompare;
