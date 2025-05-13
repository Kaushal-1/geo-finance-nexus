
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
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOrders, cancelOrder } from "@/services/alpacaService";
import { useToast } from "@/components/ui/use-toast";

const OrdersTable = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error fetching orders",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      toast({
        title: "Order cancelled successfully",
      });
      fetchOrders(); // Refresh orders after cancellation
    } catch (error) {
      toast({
        title: "Failed to cancel order",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'canceled':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'pending_new':
      case 'accepted':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg font-medium">Recent Orders</CardTitle>
        <button 
          onClick={fetchOrders}
          className="p-1 rounded-full hover:bg-white/10"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-gray-400 font-medium">Date</TableHead>
                <TableHead className="text-gray-400 font-medium">Symbol</TableHead>
                <TableHead className="text-gray-400 font-medium">Side</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Quantity</TableHead>
                <TableHead className="text-gray-400 font-medium text-right">Price</TableHead>
                <TableHead className="text-gray-400 font-medium">Status</TableHead>
                <TableHead className="text-gray-400 font-medium w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={7} className="p-2">
                      <Skeleton className="h-6 w-full bg-white/5" />
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="text-white text-xs">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="font-medium text-white">{order.symbol}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded ${order.side === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {order.side.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-white">
                      {parseInt(order.qty)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-white">
                      {order.filled_avg_price ? `$${parseFloat(order.filled_avg_price).toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {['new', 'accepted', 'pending_new'].includes(order.status) && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-500/10" 
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/5">
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No recent orders.
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

export default OrdersTable;
