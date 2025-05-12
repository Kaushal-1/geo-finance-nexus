import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot, Globe, LogOut, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
const DashboardHeader = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
      duration: 3000
    });
    navigate("/signin");
  };
  return <div className="border-b border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between sm:flex-row">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Globe className="h-6 w-6 text-teal-400" />
          <h1 className="text-xl font-bold">GeoFinance</h1>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-4 md:gap-6">
          
          
          
        </div>
      </div>
    </div>;
};
export default DashboardHeader;