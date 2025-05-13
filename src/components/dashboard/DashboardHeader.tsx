
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, Globe, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div className="border-b border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between sm:flex-row">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Globe className="h-6 w-6 text-teal-400" />
          <h1 className="text-xl font-bold">GeoFinance</h1>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-black/40">
            <Bot className="h-5 w-5 mr-2" />
            AI Assist
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full flex items-center justify-center bg-teal-900/20 hover:bg-teal-900/40">
                <User className="h-5 w-5 text-teal-400" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900 border border-white/10">
              <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-gray-300 hover:bg-black/40 focus:bg-black/40" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:bg-black/40 focus:bg-black/40" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 hover:bg-black/40 focus:bg-black/40" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
