
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlpacaOrder } from "@/types/alpaca";
import { RefreshCcw, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OrdersTableProps {
  orders: AlpacaOrder[];
  isLoading: boolean;
  onRefresh: () => void;
  onCancelOrder: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isLoading, onRefresh, onCancelOrder }) => {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "N/A";
    try {
      return formatDistanceToNow(new Date(timeStr), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Recent Orders</CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled className="text-gray-400">
            <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
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
                      <div className="h-5 w-10 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-16 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-20 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-5 w-24 bg-white/20 rounded"></div>
                    </TableCell>
                    <TableCell className="animate-pulse">
                      <div className="h-8 w-8 bg-white/20 rounded"></div>
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

  if (!orders || orders.length === 0) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Recent Orders</CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh} className="text-gray-400">
            <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-400">
            {!orders ? "Unable to load orders." : "No recent orders found."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-white">Recent Orders</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} className="text-gray-400 hover:text-white">
          <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Symbol</TableHead>
                <TableHead className="text-gray-400">Side</TableHead>
                <TableHead className="text-gray-400">Qty</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Submitted</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-white/5">
                  <TableCell className="font-medium text-teal-400">{order.symbol}</TableCell>
                  <TableCell className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {order.side.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-white">{parseFloat(order.qty).toLocaleString('en-US')}</TableCell>
                  <TableCell className="text-white capitalize">
                    {order.type.replace('_', ' ')}
                    {order.limit_price ? ` @ $${order.limit_price}` : ''}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'filled' ? 'bg-green-900/50 text-green-400' :
                      order.status === 'canceled' ? 'bg-red-900/50 text-red-400' :
                      order.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                      'bg-blue-900/50 text-blue-400'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-300">{formatTime(order.submitted_at)}</TableCell>
                  <TableCell>
                    {['new', 'accepted', 'pending_new'].includes(order.status) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => onCancelOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
