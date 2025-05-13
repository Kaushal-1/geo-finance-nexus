
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ArrowUp, ArrowDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getPositions } from "@/services/alpacaService";
import { useToast } from "@/components/ui/use-toast";

const PositionsTable = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const data = await getPositions();
      setPositions(data);
    } catch (error) {
      toast({
        title: "Error fetching positions",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(fetchPositions, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(value);
  };

  // Filter positions based on search term
  const filteredPositions = positions.filter(position => 
    position.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg font-medium">Positions</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search symbol..."
              className="h-8 pl-8 w-36 md:w-auto bg-black/20 border-white/5 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchPositions}
            className="p-1 rounded-full hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-gray-400 font-medium">Symbol</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Quantity</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Current</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Market Value</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Cost Basis</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={6} className="p-2">
                      <Skeleton className="h-6 w-full bg-white/5" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredPositions.length > 0 ? (
                filteredPositions.map((position) => {
                  const unrealizedPL = parseFloat(position.unrealized_pl);
                  const unrealizedPLPercent = parseFloat(position.unrealized_plpc) * 100;
                  const isProfit = unrealizedPL >= 0;

                  return (
                    <TableRow key={position.asset_id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{position.symbol}</TableCell>
                      <TableCell className="text-right font-mono text-white">
                        {formatNumber(parseFloat(position.qty))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-white">
                        {formatCurrency(parseFloat(position.current_price))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-white">
                        {formatCurrency(parseFloat(position.market_value))}
                      </TableCell>
                      <TableCell className="text-right font-mono text-white">
                        {formatCurrency(parseFloat(position.cost_basis))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className={`font-mono ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                            {isProfit ? '+' : ''}{formatCurrency(unrealizedPL)}
                          </span>
                          <span className={`text-xs ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                            ({isProfit ? '+' : ''}{unrealizedPLPercent.toFixed(2)}%)
                          </span>
                          {isProfit ? 
                            <ArrowUp className="h-3 w-3 text-green-500" /> : 
                            <ArrowDown className="h-3 w-3 text-red-500" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="border-white/5">
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    {searchTerm ? "No matching positions found." : "No positions in your portfolio."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionsTable;
