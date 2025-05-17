
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";

const SecuritySettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call 
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-400" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Update your password and secure your account
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handlePasswordChange}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300" htmlFor="current-password">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-black/30 border-white/20 text-white pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300" htmlFor="new-password">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-black/30 border-white/20 text-white pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300" htmlFor="confirm-password">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-black/30 border-white/20 text-white pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-400">
            <p>Password must:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Be at least 8 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SecuritySettings;
