
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { placeOrder } from "@/services/alpacaService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const TradePanel = ({ onOrderPlaced }: { onOrderPlaced?: () => void }) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    if (!symbol) {
      toast({ title: "Symbol is required", variant: "destructive" });
      return false;
    }
    
    if (!quantity || parseInt(quantity) <= 0) {
      toast({ title: "Valid quantity is required", variant: "destructive" });
      return false;
    }
    
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({ title: "Valid limit price is required", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const orderData: any = {
        symbol: symbol.toUpperCase(),
        qty: parseInt(quantity),
        side,
        type: orderType,
        time_in_force: 'day'
      };
      
      if (orderType === 'limit') {
        orderData.limit_price = parseFloat(limitPrice);
      }
      
      await placeOrder(orderData);
      
      toast({
        title: "Order placed successfully",
        description: `${side.toUpperCase()} order for ${quantity} ${symbol.toUpperCase()}`,
      });
      
      // Reset form
      setSymbol('');
      setQuantity('');
      setLimitPrice('');
      
      // Call the callback if provided
      if (onOrderPlaced) onOrderPlaced();
      
    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg font-medium">New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" onValueChange={(value) => setSide(value as 'buy' | 'sell')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Sell</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input 
                id="symbol"
                placeholder="Enter stock symbol (e.g. AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity"
                type="number"
                placeholder="Number of shares"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Order Type</Label>
              <RadioGroup 
                defaultValue="market" 
                value={orderType}
                onValueChange={(value) => setOrderType(value as 'market' | 'limit')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="market" id="market" disabled={loading} />
                  <Label htmlFor="market">Market</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limit" id="limit" disabled={loading} />
                  <Label htmlFor="limit">Limit</Label>
                </div>
              </RadioGroup>
            </div>
            
            {orderType === 'limit' && (
              <div className="space-y-2">
                <Label htmlFor="limitPrice">Limit Price ($)</Label>
                <Input 
                  id="limitPrice"
                  type="number"
                  placeholder="Price per share"
                  step="0.01"
                  min="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
                  disabled={loading}
                />
              </div>
            )}
            
            <Button
              type="submit"
              className={`w-full ${
                side === 'buy' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol ? symbol.toUpperCase() : 'Shares'}`
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TradePanel;
