
import React, { useState } from 'react';
import { Search, Filter, Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DashboardHeader = () => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="w-full bg-[#1a2035]/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="rounded-lg bg-teal p-1 mr-2">
              <div className="h-6 w-6 rounded-md bg-teal text-white flex items-center justify-center font-bold">
                G
              </div>
            </div>
            <span className="text-white text-xl font-bold">GeoFinance</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className={cn(
              "relative w-full flex items-center transition-all duration-300",
              searchFocused ? "scale-[1.02]" : ""
            )}>
              <Input
                className={cn(
                  "flex-1 bg-white/5 border-white/10 rounded-md py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-teal",
                  searchFocused ? "shadow-[0_0_15px_rgba(0,184,212,0.2)] border-teal/50" : ""
                )}
                placeholder="Search markets, regions, or news..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-teal rounded-full"></span>
            </Button>
            <div className="h-8 w-8 rounded-full bg-teal/20 border border-teal/30 flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
