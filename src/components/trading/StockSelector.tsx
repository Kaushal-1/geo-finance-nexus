
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, CheckIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { alpacaService } from '@/services/alpacaService';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  class: string;
}

interface StockSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const StockSelector: React.FC<StockSelectorProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Select a stock..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch asset details on initial load
  useEffect(() => {
    if (value) {
      const fetchAssetDetails = async () => {
        try {
          const assets = await alpacaService.searchAssets(value);
          if (assets && assets.length > 0) {
            const asset = assets.find(a => a.symbol === value) || assets[0];
            setSelectedName(asset.name || value);
          }
        } catch (error) {
          console.error("Error fetching asset details:", error);
        }
      };
      
      fetchAssetDetails();
    }
  }, [value]);

  // Handle click outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for stocks
  const searchStocks = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const assets = await alpacaService.searchAssets(query);
      setResults(assets?.slice(0, 10) || []);
    } catch (error) {
      console.error("Error searching for stocks:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchStocks(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle stock selection
  const handleSelectStock = (stock: Asset) => {
    onChange(stock.symbol);
    setSelectedName(stock.name);
    setSearchTerm("");
    setIsOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected stock display / trigger button */}
      <div 
        className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
          disabled ? 'bg-gray-800 border-gray-700 cursor-not-allowed' : 'bg-gray-900 border-gray-700 hover:border-gray-600'
        }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <span className={`font-medium ${value ? 'text-white' : 'text-gray-400'}`}>
            {value ? `${value} - ${selectedName}`.substring(0, 30) : placeholder}
          </span>
        </div>
        <div>
          {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full z-50 mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg">
          <div className="p-2">
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search symbols or companies..."
                className="pr-8 bg-gray-800 border-gray-700"
                autoFocus
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {isLoading ? (
              <div className="p-2 text-center text-sm text-gray-400">Loading...</div>
            ) : results.length === 0 ? (
              searchTerm.length >= 2 ? (
                <div className="p-2 text-center text-sm text-gray-400">No results found</div>
              ) : (
                <div className="p-2 text-center text-sm text-gray-400">Type at least 2 characters to search</div>
              )
            ) : (
              results.map((stock) => (
                <div
                  key={stock.id || stock.symbol}
                  className={`p-2 flex items-center cursor-pointer hover:bg-gray-800 ${
                    value === stock.symbol ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => handleSelectStock(stock)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-teal-400">{stock.symbol}</div>
                    <div className="text-xs text-gray-300">{stock.name}</div>
                  </div>
                  {value === stock.symbol && (
                    <CheckIcon className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Common stocks */}
          {!searchTerm && (
            <>
              <div className="px-2 py-1 text-xs text-gray-400">Popular stocks</div>
              {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].map((symbol) => (
                <div
                  key={symbol}
                  className={`p-2 flex items-center cursor-pointer hover:bg-gray-800 ${
                    value === symbol ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => {
                    onChange(symbol);
                    setSelectedName(symbol);
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium">{symbol}</div>
                  {value === symbol && (
                    <CheckIcon className="ml-auto h-4 w-4 text-blue-500" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSelector;
