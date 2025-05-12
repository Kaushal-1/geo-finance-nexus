
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// List of popular stocks for quick selection
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
];

interface CompanySearchProps {
  onClose?: () => void;
  className?: string;
}

const CompanySearch: React.FC<CompanySearchProps> = ({ onClose, className }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle clicks outside the search component to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stock/${searchQuery.toUpperCase()}`);
      if (onClose) onClose();
      setIsSearchFocused(false);
    }
  };

  const handleQuickSelect = (symbol: string) => {
    navigate(`/stock/${symbol}`);
    if (onClose) onClose();
    setIsSearchFocused(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Search company (e.g., AAPL, MSFT)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {isSearchFocused && (
        <Card className="absolute z-10 mt-2 w-full p-2 shadow-lg">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Popular Stocks</div>
          <div className="space-y-1">
            {popularStocks.map((stock) => (
              <Button
                key={stock.symbol}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => handleQuickSelect(stock.symbol)}
              >
                <div>
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CompanySearch;
