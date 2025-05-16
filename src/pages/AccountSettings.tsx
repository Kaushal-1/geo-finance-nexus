import React, { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, User, Bell, MessageSquare, Key, Database } from "lucide-react";
import TelegramBotPanel from "@/components/trading/TelegramBotPanel";
import { Link } from "react-router-dom";

const AccountSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");

  return (
    <div className="bg-gradient-to-br from-[#0a0e17] to-[#131b2e] min-h-screen">
       <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <CardTitle className="text-white mt-2">{user?.email}</CardTitle>
                  <CardDescription className="text-gray-400">
                    Free Account
                  </CardDescription>
                </div>
              </CardHeader>

              <Separator className="bg-white/10" />

              <CardContent className="p-4">
                <div className="space-y-1">
                  <Button 
                    variant={activeTab === "profile" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  
                  <Button 
                    variant={activeTab === "notifications" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  
                  <Button 
                    variant={activeTab === "api" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("api")}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    API Keys
                  </Button>
                  
                  <Button 
                    variant={activeTab === "telegram" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("telegram")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Telegram Bot
                  </Button>
                  
                  <Button 
                    variant={activeTab === "data" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("data")}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Data & Privacy
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-400 mb-1">Upgrade to Pro</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Get access to advanced features and real-time trading
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="hidden">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="api">API Keys</TabsTrigger>
                <TabsTrigger value="telegram">Telegram Bot</TabsTrigger>
                <TabsTrigger value="data">Data & Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">User Profile</CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-400">User profile settings to be implemented.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive alerts and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-400">Notification settings to be implemented.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api">
                <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">API Keys</CardTitle>
                    <CardDescription>Manage API keys for third-party integrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-400">API key management to be implemented.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="telegram">
                <TelegramBotPanel />
              </TabsContent>

              <TabsContent value="data">
                <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Data & Privacy</CardTitle>
                    <CardDescription>Manage your data and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-400">Data & Privacy settings to be implemented.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
