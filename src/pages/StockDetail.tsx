
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GlobalNavbar from "@/components/shared/GlobalNavbar";
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchStockHistoricalData, 
  fetchStockProfile, 
  generateStockAnalysis, 
  mockStockData 
} from '@/services/stockDetailService';
import {
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface StockParams {
  symbol: string;
}

interface StockData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockProfile {
  name: string;
  logo?: string;
  exchange?: string;
  currency?: string;
  country?: string;
  sector?: string;
  industry?: string;
  marketCapitalization?: number;
  [key: string]: any;
}

const StockDetail = () => {
  const { symbol } = useParams<keyof StockParams>() as StockParams;
  const decodedSymbol = decodeURIComponent(symbol);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [profile, setProfile] = useState<StockProfile>({ name: decodedSymbol });
  const [analysis, setAnalysis] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate performance metrics
  const performanceMetrics = React.useMemo(() => {
    if (!stockData.length) return null;
    
    const firstPrice = stockData[0].close;
    const lastPrice = stockData[stockData.length - 1].close;
    const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    const isPositive = percentChange >= 0;
    
    return {
      startPrice: firstPrice.toFixed(2),
      endPrice: lastPrice.toFixed(2),
      change: (lastPrice - firstPrice).toFixed(2),
      percentChange: percentChange.toFixed(2),
      isPositive
    };
  }, [stockData]);

  // Format data for chart
  const chartData = React.useMemo(() => {
    return stockData.map(item => ({
      date: item.timestamp.toLocaleDateString(),
      close: item.close,
      open: item.open,
      high: item.high,
      low: item.low
    }));
  }, [stockData]);

  // Load stock data
  useEffect(() => {
    async function loadStockData() {
      setLoading(true);
      try {
        // Fetch historical data and profile in parallel
        const [historicalData, profileData] = await Promise.all([
          fetchStockHistoricalData(decodedSymbol),
          fetchStockProfile(decodedSymbol)
        ]);
        
        setStockData(historicalData);
        setProfile({
          name: profileData.name || decodedSymbol,
          logo: profileData.logo,
          exchange: profileData.exchange,
          currency: profileData.currency,
          country: profileData.country,
          sector: profileData.sector,
          industry: profileData.industry,
          marketCapitalization: profileData.marketCapitalization
        });

        toast({
          title: "Stock Data Loaded",
          description: `Successfully loaded data for ${decodedSymbol}`,
        });
      } catch (error) {
        console.error('Error loading stock data:', error);
        toast({
          title: "Error Loading Data",
          description: `Using mock data for ${decodedSymbol}`,
          variant: "destructive"
        });
        // Use mock data as fallback
        setStockData(mockStockData);
      } finally {
        setLoading(false);
      }
    }
    
    loadStockData();
  }, [decodedSymbol, toast]);

  // Generate analysis once stock data is loaded
  useEffect(() => {
    async function generateAnalysis() {
      if (!stockData.length) return;
      
      setAnalysisLoading(true);
      try {
        const analysisText = await generateStockAnalysis(decodedSymbol, stockData);
        setAnalysis(analysisText);
      } catch (error) {
        console.error('Error generating analysis:', error);
        setAnalysis("Unable to generate analysis at this time. Please try again later.");
      } finally {
        setAnalysisLoading(false);
      }
    }
    
    generateAnalysis();
  }, [stockData, decodedSymbol]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-[#f5f7fa] overflow-hidden">
      <GlobalNavbar />
      
      <div className="container mx-auto p-4 pt-6">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        
        {/* Stock Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {profile.logo && (
              <img 
                src={profile.logo} 
                alt={profile.name} 
                className="h-12 w-12 rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.name || decodedSymbol}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{decodedSymbol}</span>
                {profile.exchange && <span>• {profile.exchange}</span>}
                {profile.sector && <span>• {profile.sector}</span>}
              </div>
            </div>
          </div>
          
          {performanceMetrics && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">15-Day Change</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {performanceMetrics.endPrice}
                  </span>
                  <div className={`flex items-center ${performanceMetrics.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {performanceMetrics.isPositive ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{performanceMetrics.isPositive ? '+' : ''}{performanceMetrics.percentChange}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Chart */}
          <Card className="lg:col-span-2 bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle>15-Day Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="w-full h-[400px] flex items-center justify-center">
                  <Skeleton className="w-full h-full bg-white/5" />
                </div>
              ) : (
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3253" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#a0aec0' }} 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tick={{ fill: '#a0aec0' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a2035', 
                          borderColor: '#333f66',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        name="Close Price"
                        stroke="#7b61ff" 
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="open" 
                        name="Open Price"
                        stroke="#00b8d4" 
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Analysis Card */}
          <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-full h-4 bg-white/5" />
                  <Skeleton className="w-full h-4 bg-white/5" />
                  <Skeleton className="w-full h-4 bg-white/5" />
                  <Skeleton className="w-3/4 h-4 bg-white/5" />
                  <Skeleton className="w-full h-4 bg-white/5" />
                  <Skeleton className="w-5/6 h-4 bg-white/5" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-line text-gray-300">
                    {analysis}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Stock Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Open</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-20 bg-white/5" />
              ) : (
                <p className="text-xl font-mono">
                  {stockData.length ? stockData[stockData.length - 1].open.toFixed(2) : 'N/A'}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">High</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-20 bg-white/5" />
              ) : (
                <p className="text-xl font-mono">
                  {stockData.length ? stockData[stockData.length - 1].high.toFixed(2) : 'N/A'}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Low</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-20 bg-white/5" />
              ) : (
                <p className="text-xl font-mono">
                  {stockData.length ? stockData[stockData.length - 1].low.toFixed(2) : 'N/A'}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2035]/80 backdrop-blur-sm border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-20 bg-white/5" />
              ) : (
                <p className="text-xl font-mono">
                  {stockData.length ? stockData[stockData.length - 1].volume.toLocaleString() : 'N/A'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
