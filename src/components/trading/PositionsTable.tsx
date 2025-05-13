
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlpacaPosition } from "@/types/alpaca";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PositionsTableProps {
  positions: AlpacaPosition[];
  isLoading: boolean;
}

const PositionsTable: React.FC<PositionsTableProps> = ({ positions, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white">Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Market Value</TableHead>
                  <TableHead>Cost Basis</TableHead>
                  <TableHead>Unrealized P/L</TableHead>
                  <TableHead>Change Today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map(i => (
                  <TableRow key={i}>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-16 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-12 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-20 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-20 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-24 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-16 bg-white/20 rounded"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white">Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-400">
            {!positions ? "Unable to load positions." : "No positions found. Start trading to see your positions here."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-white">Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Symbol</TableHead>
                <TableHead className="text-gray-400">Qty</TableHead>
                <TableHead className="text-gray-400">Market Value</TableHead>
                <TableHead className="text-gray-400">Cost Basis</TableHead>
                <TableHead className="text-gray-400">Unrealized P/L</TableHead>
                <TableHead className="text-gray-400">Change Today</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => {
                const unrealizedPL = parseFloat(position.unrealized_pl);
                const unrealizedPLPercent = parseFloat(position.unrealized_plpc) * 100;
                const changeToday = parseFloat(position.change_today) * 100;
                
                return (
                  <TableRow key={position.asset_id} className="border-white/5">
                    <TableCell className="font-medium text-teal-400">{position.symbol}</TableCell>
                    <TableCell className="text-white">{parseFloat(position.qty).toLocaleString('en-US')}</TableCell>
                    <TableCell className="text-white">
                      ${parseFloat(position.market_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-white">
                      ${parseFloat(position.cost_basis).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`flex items-center ${unrealizedPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {unrealizedPL >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                      ${Math.abs(unrealizedPL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="ml-1">({unrealizedPLPercent.toFixed(2)}%)</span>
                    </TableCell>
                    <TableCell className={changeToday >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {changeToday >= 0 ? '+' : ''}{changeToday.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionsTable;
