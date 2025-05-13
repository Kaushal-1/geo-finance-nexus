
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown, Briefcase } from "lucide-react";

const mockStockData = [
  { name: "Jan", AAPL: 4000, MSFT: 2400, AMZN: 2400 },
  { name: "Feb", AAPL: 3000, MSFT: 1398, AMZN: 2210 },
  { name: "Mar", AAPL: 2000, MSFT: 9800, AMZN: 2290 },
  { name: "Apr", AAPL: 2780, MSFT: 3908, AMZN: 2000 },
  { name: "May", AAPL: 1890, MSFT: 4800, AMZN: 2181 },
  { name: "Jun", AAPL: 2390, MSFT: 3800, AMZN: 2500 },
  { name: "Jul", AAPL: 3490, MSFT: 4300, AMZN: 2100 },
];

const mockTrades = [
  { id: 1, symbol: "AAPL", type: "buy", price: 187.42, quantity: 10, date: "2025-05-10" },
  { id: 2, symbol: "MSFT", type: "sell", price: 401.78, quantity: 5, date: "2025-05-11" },
  { id: 3, symbol: "TSLA", type: "buy", price: 177.09, quantity: 8, date: "2025-05-12" },
];

const mockWatchlist = [
  { symbol: "AAPL", name: "Apple Inc.", price: 187.42, change: 1.42, changePercent: 0.76 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 401.78, change: -2.33, changePercent: -0.58 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 177.09, change: 3.21, changePercent: 1.85 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 180.47, change: 0.48, changePercent: 0.27 },
  { symbol: "GOOG", name: "Alphabet Inc.", price: 175.92, change: -0.87, changePercent: -0.49 },
];

const TradingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] to-[#131b2e]">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Trading Dashboard</h1>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
            <TabsTrigger value="watchlist" className="text-base">Watchlist</TabsTrigger>
            <TabsTrigger value="trades" className="text-base">Recent Trades</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Market Overview</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockStockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip contentStyle={{ backgroundColor: "#1A1F2C", borderColor: "#333" }} />
                      <Legend />
                      <Line type="monotone" dataKey="AAPL" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="MSFT" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="AMZN" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">Portfolio Value</h3>
                  <div className="text-2xl font-bold text-teal-400">$142,568.32</div>
                  <div className="flex items-center mt-2 text-green-500">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+2.4% today</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">Open Positions</h3>
                  <div className="text-2xl font-bold text-teal-400">12</div>
                  <div className="text-gray-400 mt-2">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    <span>5 profitable</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">Today's P/L</h3>
                  <div className="text-2xl font-bold text-green-500">+$3,241.87</div>
                  <div className="flex items-center mt-2 text-green-500">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+1.2%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="watchlist">
            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 text-gray-400">Symbol</th>
                        <th className="pb-3 text-gray-400">Company</th>
                        <th className="pb-3 text-gray-400 text-right">Price</th>
                        <th className="pb-3 text-gray-400 text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockWatchlist.map((stock) => (
                        <tr key={stock.symbol} className="border-b border-white/10">
                          <td className="py-4 font-semibold text-teal-400">{stock.symbol}</td>
                          <td className="py-4 text-white">{stock.name}</td>
                          <td className="py-4 text-right text-white">${stock.price.toFixed(2)}</td>
                          <td className={`py-4 text-right flex justify-end items-center ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trades">
            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 text-gray-400">Symbol</th>
                        <th className="pb-3 text-gray-400">Type</th>
                        <th className="pb-3 text-gray-400 text-right">Price</th>
                        <th className="pb-3 text-gray-400 text-right">Quantity</th>
                        <th className="pb-3 text-gray-400 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTrades.map((trade) => (
                        <tr key={trade.id} className="border-b border-white/10">
                          <td className="py-4 font-semibold text-teal-400">{trade.symbol}</td>
                          <td className={`py-4 ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.type.toUpperCase()}
                          </td>
                          <td className="py-4 text-right text-white">${trade.price.toFixed(2)}</td>
                          <td className="py-4 text-right text-white">{trade.quantity}</td>
                          <td className="py-4 text-right text-gray-300">{trade.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TradingDashboard;
