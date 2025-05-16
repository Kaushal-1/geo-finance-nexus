
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Settings, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Trading", path: "/trading" },
    { name: "Stock Compare", path: "/stock-compare" },
    { name: "Research", path: "/chat-research" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-[#0a0e17]/70 border-b border-b-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg w-10 h-10 flex items-center justify-center mr-2">
                G
              </div>
              <span className="text-white font-bold text-xl">GeoFinance</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="ml-8 hidden md:flex items-center space-x-1">
              {links.map((link) => (
                <Link key={link.path} to={link.path}>
                  <Button 
                    variant={location.pathname === link.path ? "default" : "ghost"} 
                    className={location.pathname === link.path 
                      ? "bg-white/10 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                    size="sm"
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1f2e] border border-white/10 text-gray-300">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="py-2 px-3 text-xs">No new notifications</div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                      {getInitials(user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1f2e] border border-white/10 text-gray-300">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{user?.email}</p>
                    <p className="text-xs text-gray-400">Free Account</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/account-settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#1a1f2e] border-l border-white/10 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                          {getInitials(user?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{user?.email}</p>
                        <p className="text-xs text-gray-400">Free Account</p>
                      </div>
                    </div>
                  </div>

                  <nav className="flex flex-col p-4">
                    {links.map((link) => (
                      <Link 
                        key={link.path} 
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button 
                          variant="ghost" 
                          className={`w-full justify-start mb-1 ${
                            location.pathname === link.path 
                              ? "bg-white/10 text-white" 
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {link.name}
                        </Button>
                      </Link>
                    ))}
                    
                    <Link 
                      to="/account-settings"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start mb-1 text-gray-400 hover:text-white"
                      >
                        Account Settings
                      </Button>
                    </Link>
                  </nav>

                  <div className="mt-auto p-4 border-t border-white/10">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
