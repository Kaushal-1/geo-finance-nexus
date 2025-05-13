
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Plus, X, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getWatchlists,
  createWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from "@/services/alpacaService";
import { useToast } from "@/components/ui/use-toast";

const WatchlistManager = () => {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWatchlist, setActiveWatchlist] = useState<string | null>(null);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistSymbols, setNewWatchlistSymbols] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchWatchlists = async () => {
    setLoading(true);
    try {
      const data = await getWatchlists();
      setWatchlists(data);
      if (data.length > 0 && !activeWatchlist) {
        setActiveWatchlist(data[0].id);
      }
    } catch (error) {
      toast({
        title: "Error fetching watchlists",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName) {
      toast({
        title: "Watchlist name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const symbols = newWatchlistSymbols
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(s => s);

      const response = await createWatchlist(newWatchlistName, symbols);
      
      toast({
        title: "Watchlist created successfully",
      });
      
      setNewWatchlistName("");
      setNewWatchlistSymbols("");
      setDialogOpen(false);
      
      // Refresh watchlists
      fetchWatchlists();
    } catch (error) {
      toast({
        title: "Failed to create watchlist",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleAddSymbol = async () => {
    if (!newSymbol || !activeWatchlist) return;

    try {
      await addToWatchlist(activeWatchlist, newSymbol.toUpperCase());
      
      toast({
        title: `${newSymbol.toUpperCase()} added to watchlist`,
      });
      
      setNewSymbol("");
      
      // Refresh watchlists
      fetchWatchlists();
    } catch (error) {
      toast({
        title: "Failed to add symbol",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSymbol = async (watchlistId: string, symbol: string) => {
    try {
      await removeFromWatchlist(watchlistId, symbol);
      
      toast({
        title: `${symbol} removed from watchlist`,
      });
      
      // Refresh watchlists
      fetchWatchlists();
    } catch (error) {
      toast({
        title: "Failed to remove symbol",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const activeWatchlistData = activeWatchlist
    ? watchlists.find(w => w.id === activeWatchlist)
    : null;

  return (
    <Card className="bg-[#1a2035]/80 backdrop-blur-sm border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg font-medium">Watchlists</CardTitle>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchWatchlists}
            className="p-1 rounded-full hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-teal/50 text-teal hover:bg-teal/10">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a2035] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create Watchlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Watchlist Name</label>
                  <Input
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    placeholder="E.g. Tech Stocks"
                    className="bg-black/30 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Symbols (comma-separated)</label>
                  <Input
                    value={newWatchlistSymbols}
                    onChange={(e) => setNewWatchlistSymbols(e.target.value)}
                    placeholder="E.g. AAPL, MSFT, GOOGL"
                    className="bg-black/30 border-white/10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional. You can add symbols later.</p>
                </div>
                <Button 
                  onClick={handleCreateWatchlist} 
                  className="w-full bg-teal hover:bg-teal/90"
                >
                  Create Watchlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 text-center">
            <p className="text-gray-400">Loading watchlists...</p>
          </div>
        ) : watchlists.length > 0 ? (
          <Tabs 
            value={activeWatchlist || watchlists[0]?.id || ""}
            onValueChange={setActiveWatchlist}
            className="px-1"
          >
            <div className="border-b border-white/10 overflow-x-auto scrollbar-none">
              <TabsList className="bg-transparent p-0 h-auto">
                {watchlists.map((watchlist) => (
                  <TabsTrigger
                    key={watchlist.id}
                    value={watchlist.id}
                    className="data-[state=active]:bg-transparent data-[state=active]:text-teal data-[state=active]:border-b-2 data-[state=active]:border-teal rounded-none py-2 px-4 text-sm"
                  >
                    {watchlist.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {watchlists.map((watchlist) => (
              <TabsContent key={watchlist.id} value={watchlist.id} className="mt-0 p-3">
                <div className="mb-3 flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Add symbol..."
                      className="h-8 pl-8 bg-black/20 border-white/5 text-sm"
                      value={newSymbol}
                      onChange={(e) => setNewSymbol(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSymbol) {
                          e.preventDefault();
                          handleAddSymbol();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-teal/50 text-teal hover:bg-teal/10 h-8"
                    onClick={handleAddSymbol}
                    disabled={!newSymbol}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                  {watchlist.assets && watchlist.assets.length > 0 ? (
                    watchlist.assets.map((asset: any) => (
                      <div 
                        key={asset.id || asset.symbol} 
                        className="flex items-center justify-between py-2 px-3 rounded-md bg-white/5 hover:bg-white/10"
                      >
                        <div className="font-medium text-white">{asset.symbol}</div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-500/10" 
                          onClick={() => handleRemoveSymbol(watchlist.id, asset.symbol)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No symbols in this watchlist.</p>
                      <p className="text-xs mt-1">Add your first symbol above.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-400 mb-4">You don't have any watchlists yet.</p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-teal hover:bg-teal/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Watchlist
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchlistManager;
