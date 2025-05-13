
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
import { AlpacaWatchlist } from "@/types/alpaca";
import { Plus, X, Star, PlusCircle, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WatchlistManagerProps {
  watchlists: AlpacaWatchlist[];
  isLoading: boolean;
  onCreateWatchlist: (name: string, symbols: string[]) => Promise<any>;
  onAddToWatchlist: (watchlistId: string, symbol: string) => Promise<any>;
  onRemoveFromWatchlist: (watchlistId: string, symbol: string) => Promise<any>;
  onDeleteWatchlist: (watchlistId: string) => Promise<any>;
  onRefreshWatchlists: () => Promise<void>;
}

const WatchlistManager: React.FC<WatchlistManagerProps> = ({ 
  watchlists, 
  isLoading,
  onCreateWatchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onDeleteWatchlist,
  onRefreshWatchlists
}) => {
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>("");
  const [newSymbol, setNewSymbol] = useState<string>("");
  const [newWatchlistName, setNewWatchlistName] = useState<string>("");
  const [initialSymbols, setInitialSymbols] = useState<string>("");
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleAddSymbol = async () => {
    if (!newSymbol || !selectedWatchlistId) {
      toast({
        title: "Error",
        description: "Please select a watchlist and enter a symbol",
        duration: 3000,
      });
      return;
    }

    const symbol = newSymbol.toUpperCase().trim();
    console.log(`Adding symbol ${symbol} to watchlist ${selectedWatchlistId}`);
    
    try {
      await onAddToWatchlist(selectedWatchlistId, symbol);
      setNewSymbol("");
    } catch (err) {
      console.error("Error adding symbol:", err);
      toast({
        title: "Error",
        description: "Failed to add symbol to watchlist",
        duration: 3000,
      });
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    if (!selectedWatchlistId) return;
    
    console.log(`Removing symbol ${symbol} from watchlist ${selectedWatchlistId}`);
    try {
      await onRemoveFromWatchlist(selectedWatchlistId, symbol);
    } catch (err) {
      console.error("Error removing symbol:", err);
      toast({
        title: "Error",
        description: "Failed to remove symbol from watchlist",
        duration: 3000,
      });
    }
  };

  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a watchlist name",
        duration: 3000,
      });
      return;
    }

    setIsCreatingWatchlist(true);
    try {
      // Parse initial symbols if provided
      const symbols = initialSymbols
        ? initialSymbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
        : [];
      
      console.log(`Creating watchlist "${newWatchlistName}" with symbols:`, symbols);
      
      const result = await onCreateWatchlist(newWatchlistName.trim(), symbols);
      console.log("Create watchlist result:", result);
      
      if (result) {
        setNewWatchlistName("");
        setInitialSymbols("");
        setIsDialogOpen(false);
        
        // Set the newly created watchlist as selected
        if (result.id) {
          setSelectedWatchlistId(result.id);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create watchlist",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error creating watchlist:", err);
      toast({
        title: "Error",
        description: "Failed to create watchlist",
        duration: 3000,
      });
    } finally {
      setIsCreatingWatchlist(false);
    }
  };

  const handleDeleteWatchlist = async () => {
    if (!selectedWatchlistId) return;
    
    try {
      await onDeleteWatchlist(selectedWatchlistId);
      setSelectedWatchlistId("");
    } catch (err) {
      console.error("Error deleting watchlist:", err);
      toast({
        title: "Error",
        description: "Failed to delete watchlist",
        duration: 3000,
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshWatchlists();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Find the currently selected watchlist
  const selectedWatchlist = watchlists?.find(w => w.id === selectedWatchlistId);
  
  if (isLoading) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white">Watchlists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/20 rounded w-full"></div>
            <div className="h-20 bg-white/10 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Make sure watchlists is always an array, even if it's null or undefined
  const safeWatchlists = watchlists || [];

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-white">Watchlists</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-white hover:text-teal-300"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-teal-400 hover:text-teal-300">
                <PlusCircle className="h-4 w-4 mr-1" /> New Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1f2833] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Create Watchlist</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="watchlistName" className="text-sm text-gray-400">Watchlist Name</label>
                    <Input
                      id="watchlistName"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                      placeholder="e.g. My Tech Stocks"
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="initialSymbols" className="text-sm text-gray-400">
                      Initial Symbols (comma-separated, optional)
                    </label>
                    <Input
                      id="initialSymbols"
                      value={initialSymbols}
                      onChange={(e) => setInitialSymbols(e.target.value)}
                      placeholder="e.g. AAPL, MSFT, GOOGL"
                      className="bg-black/30 border-white/10 text-white"
                    />
                    <p className="text-xs text-gray-500 italic mt-1">
                      Add multiple symbols by separating them with commas
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateWatchlist} 
                  disabled={isCreatingWatchlist}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isCreatingWatchlist ? "Creating..." : "Create Watchlist"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="watchlist" className="text-sm text-gray-400">Select Watchlist</label>
            <div className="flex space-x-2">
              <Select value={selectedWatchlistId} onValueChange={setSelectedWatchlistId}>
                <SelectTrigger id="watchlist" className="bg-black/30 border-white/10 text-white flex-grow">
                  <SelectValue placeholder="Select a watchlist" />
                </SelectTrigger>
                <SelectContent className="bg-[#1f2833] border-white/10 text-white">
                  {safeWatchlists.length === 0 ? (
                    <SelectItem value="none" disabled>No watchlists available</SelectItem>
                  ) : (
                    safeWatchlists.map(watchlist => (
                      <SelectItem key={watchlist.id} value={watchlist.id}>
                        {watchlist.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedWatchlistId && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleDeleteWatchlist}
                  className="text-red-500 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {selectedWatchlistId && (
            <>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add symbol (e.g. AAPL)"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                  className="bg-black/30 border-white/10 text-white flex-grow"
                />
                <Button 
                  onClick={handleAddSymbol}
                  variant="outline"
                  className="text-teal-400 hover:text-teal-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-black/30 rounded-md p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                {selectedWatchlist && selectedWatchlist.assets && selectedWatchlist.assets.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    No symbols in watchlist. Add some above.
                  </div>
                ) : !selectedWatchlist || !selectedWatchlist.assets ? (
                  <div className="text-center text-gray-400 py-4">
                    Unable to load watchlist data. Try refreshing.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedWatchlist.assets.map(asset => (
                      <div 
                        key={asset.id} 
                        className="bg-[#1f2833] text-white px-3 py-1 rounded-full flex items-center"
                      >
                        <Star className="h-3 w-3 mr-1 text-yellow-400" />
                        {asset.symbol}
                        <button
                          onClick={() => handleRemoveSymbol(asset.symbol)}
                          className="ml-2 text-gray-400 hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchlistManager;
