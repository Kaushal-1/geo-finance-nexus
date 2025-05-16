
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search } from "lucide-react";
import { alpacaService } from "@/services/alpacaService";
import { AlpacaAsset } from "@/types/alpaca";

interface StockSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const StockSelector: React.FC<StockSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AlpacaAsset[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search for stocks when search term changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchStocks(searchTerm);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Function to search stocks
  const searchStocks = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await alpacaService.searchAssets(query);
      if (response && Array.isArray(response)) {
        setSearchResults(response.slice(0, 10)); // Limit to 10 results
        setShowResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Failed to search stocks:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle stock selection
  const selectStock = (symbol: string) => {
    onChange(symbol);
    setSearchTerm("");
    setShowResults(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        <Input
          value={value}
          onClick={() => setShowResults(true)}
          className="bg-gray-900 border-gray-700"
          readOnly
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowResults(!showResults)}
          disabled={disabled}
          className="border-gray-700 ml-2"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative mt-2">
        {showResults && (
          <div className="absolute top-0 left-0 w-full z-50">
            <div className="p-2 bg-gray-900 border border-gray-700 rounded-md shadow-lg">
              <div className="mb-2">
                <div className="relative">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stocks..."
                    className="bg-gray-800 border-gray-700 pr-8"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {isLoading ? (
                <div className="py-2 text-sm text-gray-400">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul className="max-h-[200px] overflow-y-auto">
                  {searchResults.map((result) => (
                    <li
                      key={result.id}
                      className="p-2 hover:bg-gray-800 cursor-pointer text-sm"
                      onClick={() => selectStock(result.symbol)}
                    >
                      <span className="font-bold text-teal-400">{result.symbol}</span>
                      <span className="ml-2 text-gray-300">{result.name}</span>
                    </li>
                  ))}
                </ul>
              ) : searchTerm.length > 1 ? (
                <div className="py-2 text-sm text-gray-400">No results found</div>
              ) : (
                <div className="py-2 text-sm text-gray-400">
                  Type at least 2 characters to search
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSelector;
