
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlaceOrderRequest } from "@/types/alpaca";
import { AlertCircle } from "lucide-react";

interface TradePanelProps {
  onPlaceOrder: (order: PlaceOrderRequest) => Promise<any>;
  isProcessing: boolean;
}

const TradePanel: React.FC<TradePanelProps> = ({ onPlaceOrder, isProcessing }) => {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!symbol) {
      setError("Symbol is required");
      return;
    }

    if (!qty || parseFloat(qty) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setError("Limit price must be greater than 0");
      return;
    }

    const orderData: PlaceOrderRequest = {
      symbol: symbol.toUpperCase(),
      qty: parseFloat(qty),
      side,
      type: orderType,
      time_in_force: "day",
    };

    if (orderType === "limit") {
      orderData.limit_price = parseFloat(limitPrice);
    }

    try {
      await onPlaceOrder(orderData);
      // Reset form on success
      setSymbol("");
      setQty("");
      setOrderType("market");
      setLimitPrice("");
    } catch (err) {
      console.error("Error placing order:", err);
      // Error is already handled in the service layer
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-white">Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-gray-400">Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g. AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qty" className="text-gray-400">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 10"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="side" className="text-gray-400">Side</Label>
              <Select value={side} onValueChange={(value: "buy" | "sell") => setSide(value)}>
                <SelectTrigger id="side" className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2833] border-white/10 text-white">
                  <SelectItem value="buy" className="text-green-500">Buy</SelectItem>
                  <SelectItem value="sell" className="text-red-500">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orderType" className="text-gray-400">Order Type</Label>
              <Select value={orderType} onValueChange={(value: "market" | "limit") => setOrderType(value)}>
                <SelectTrigger id="orderType" className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2833] border-white/10 text-white">
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {orderType === "limit" && (
            <div className="space-y-2">
              <Label htmlFor="limitPrice" className="text-gray-400">Limit Price ($)</Label>
              <Input
                id="limitPrice"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 150.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-2 rounded flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={isProcessing}
              className={`px-8 ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isProcessing ? "Processing..." : side === 'buy' ? 'Buy' : 'Sell'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TradePanel;
