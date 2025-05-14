
import React from 'react';
import { Link } from 'react-router-dom';
import { CircleUser, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-[#0f1628]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-600 rounded-md flex items-center justify-center text-white font-bold">
            G
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-teal-400 to-blue-600 bg-clip-text text-transparent">
            GeoFinance
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/dashboard" className="text-white font-medium hover:text-teal-400 transition">
            Dashboard
          </Link>
          <Link to="/trading-dashboard" className="text-gray-400 hover:text-teal-400 transition">
            Trading
          </Link>
          <Link to="/chat-research" className="text-gray-400 hover:text-teal-400 transition">
            Research
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <CircleUser className="h-6 w-6 text-gray-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="font-normal text-gray-400">Signed in as</div>
                <div className="font-medium text-white">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account-settings" className="cursor-pointer">
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="flex items-center cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
