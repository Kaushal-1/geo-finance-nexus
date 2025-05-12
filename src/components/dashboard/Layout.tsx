
import React, { ReactNode, useState } from "react";
import { Globe, ChevronLeft, ChevronRight, Search, Filter, Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/context/DashboardContext";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#0a0e17] to-[#131b2e] text-white">
      {/* Header */}
      <header className="w-full bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="rounded-lg bg-teal p-1 mr-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold hidden md:block">GeoFinance</span>
            </div>
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="hidden md:flex items-center max-w-md w-full bg-white/5 rounded-full px-3 border border-white/10">
            <Search className="h-4 w-4 text-white/50 mr-2" />
            <Input 
              type="text" 
              placeholder="Search markets, companies, regions..." 
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/50 h-9"
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <Filter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile search - shown when menu is open */}
        <div className={`md:hidden mt-3 ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="flex items-center bg-white/5 rounded-full px-3 border border-white/10">
            <Search className="h-4 w-4 text-white/50 mr-2" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/50 h-9"
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
