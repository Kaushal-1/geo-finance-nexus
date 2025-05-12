
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { finnhubService } from '@/services/finnhubService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon, PlusCircleIcon, TrendingUpIcon } from 'lucide-react';
import StockChart from '@/components/stock/StockChart';
import CompanyProfilePanel from '@/components/stock/CompanyProfilePanel';
import FinancialMetricsPanel from '@/components/stock/FinancialMetricsPanel';
import PeerComparisonPanel from '@/components/stock/PeerComparisonPanel';
import StockNewsPanel from '@/components/stock/StockNewsPanel';
import CompanyMapPanel from '@/components/stock/CompanyMapPanel';

// Define the interface for our stock data
interface StockDetailData {
  profile: any;
  quote: any;
  financials: any;
  earnings: any;
  peers: any;
  locations: any;
  news: any;
  insiderTransactions: any;
  lastUpdated: Date;
}

const StockDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stockData, setStockData] = useState<StockDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<string>('1W');

  useEffect(() => {
    async function loadStockData() {
      if (!symbol) {
        navigate('/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Load all company data in parallel
        const [profile, quote, financials, earnings, peers, locations, news, insiderTransactions] = await Promise.all([
          finnhubService.getCompanyProfile(symbol),
          finnhubService.getQuote(symbol),
          finnhubService.getCompanyFinancials(symbol).catch(() => ({ metric: {} })), // Continue if this fails
          finnhubService.getCompanyEarnings(symbol).catch(() => []), // Continue if this fails
          finnhubService.getCompanyPeers(symbol).catch(() => []), // Continue if this fails
          finnhubService.getSupplyChainLocations(symbol),
          finnhubService.getCompanyNews(
            symbol, 
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            new Date()
          ).catch(() => []), // Continue if this fails
          finnhubService.getInsiderTransactions(symbol).catch(() => []), // Continue if this fails
        ]);
        
        setStockData({
          profile,
          quote,
          financials,
          earnings,
          peers,
          locations,
          news,
          insiderTransactions,
          lastUpdated: new Date()
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading stock data:', err);
        setError('Failed to load company data. Please try again later.');
        setIsLoading(false);
        
        toast({
          title: "Error loading stock data",
          description: "Could not fetch the complete stock information. Some details may be limited.",
          variant: "destructive",
        });
      }
    }
    
    loadStockData();
    
    // Setup periodic updates for real-time data
    const updateInterval = setInterval(async () => {
      try {
        if (!symbol) return;
        
        const quote = await finnhubService.getQuote(symbol);
        setStockData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            quote,
            lastUpdated: new Date()
          };
        });
      } catch (err) {
        console.error('Error updating quote:', err);
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(updateInterval);
  }, [symbol, navigate, toast]);
  
  if (!symbol) {
    return <div className="p-8">Invalid stock symbol</div>;
  }

  // Format market cap
  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(2)}T`;
    } else {
      return `$${marketCap.toFixed(2)}B`;
    }
  };

  // Format number with K, M, B suffixes
  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    } else {
      return num.toFixed(2);
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (isLoading && !stockData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Stock Details</h1>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (error && !stockData) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-destructive/10 border border-destructive">
          <CardContent className="p-6">
            <h2 className="text-xl font-medium mb-2 text-destructive">Error</h2>
            <p>{error}</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-medium mb-2">No Data</h2>
            <p>No data available for this company.</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, quote, financials } = stockData;

  return (
    <div className="container mx-auto p-4">
      {/* Stock Header */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* Company Identity */}
              <div className="flex items-center gap-4">
                {profile.logo ? (
                  <img 
                    src={profile.logo} 
                    alt={profile.name || symbol} 
                    className="w-12 h-12 rounded-full object-contain bg-white p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {symbol.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{profile.name || symbol}</h1>
                  <div className="text-sm text-muted-foreground">
                    {symbol} • {profile.exchange || 'Unknown Exchange'}
                  </div>
                </div>
              </div>

              {/* Stock Price */}
              <div className="text-right">
                <div className="text-3xl font-mono font-bold">
                  ${quote.price.toFixed(2)}
                </div>
                <div className={quote.change >= 0 ? "text-green-500 flex items-center justify-end" : "text-red-500 flex items-center justify-end"}>
                  {quote.change >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                  )}
                  {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">Market Cap</div>
                  <div className="text-lg font-mono font-medium">
                    {formatMarketCap(profile.marketCapitalization)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">P/E Ratio</div>
                  <div className="text-lg font-mono font-medium">
                    {financials.metric?.peBasicExcl ? financials.metric.peBasicExcl.toFixed(2) : 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">52W Range</div>
                  <div className="text-xs font-mono font-medium">
                    {quote.low.toFixed(2)} - {quote.high.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">Industry</div>
                  <div className="text-sm font-medium truncate">
                    {profile.finnhubIndustry || 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              {profile.weburl && (
                <Button variant="outline" size="sm" onClick={() => window.open(profile.weburl, '_blank')}>
                  <ExternalLinkIcon className="mr-2 h-4 w-4" />
                  Website
                </Button>
              )}
              <Button variant="default" size="sm">
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Add to Watchlist
              </Button>
              <Button variant="default" size="sm">
                <TrendingUpIcon className="mr-2 h-4 w-4" />
                Trade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Price Chart</CardTitle>
              <div className="flex items-center space-x-2">
                {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={activeTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTimeframe(timeframe)}
                    className="h-8 px-3"
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StockChart 
              symbol={symbol}
              timeframe={activeTimeframe}
              className="h-[350px] w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="peers">Peer Comparison</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <CompanyProfilePanel profile={stockData.profile} />
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <FinancialMetricsPanel 
            financials={stockData.financials} 
            earnings={stockData.earnings}
          />
        </TabsContent>

        {/* News Tab */}
        <TabsContent value="news">
          <StockNewsPanel news={stockData.news} />
        </TabsContent>

        {/* Peers Tab */}
        <TabsContent value="peers">
          <PeerComparisonPanel 
            peers={stockData.peers}
            currentCompany={{
              symbol,
              name: profile.name || symbol,
              price: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
              marketCap: profile.marketCapitalization || 0
            }}
          />
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations">
          <CompanyMapPanel 
            locations={stockData.locations} 
            companyName={profile.name || symbol}
          />
        </TabsContent>
      </Tabs>

      {/* Last updated indicator */}
      <div className="text-xs text-muted-foreground text-right">
        Data updated: {stockData.lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default StockDetail;
