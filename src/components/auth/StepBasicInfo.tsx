
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  AtSign, CircleUserRound, Eye, EyeOff, Lock
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface StepBasicInfoProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
  passwordStrength: number;
  setPasswordStrength: (value: number) => void;
  isLoading: boolean;
}

const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  termsAccepted,
  setTermsAccepted,
  passwordStrength,
  setPasswordStrength,
  isLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    
    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <CircleUserRound className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="pl-10 bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
            required
            disabled={isLoading}
          />
        </div>
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <AtSign className="h-5 w-5" />
        </div>
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10 bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
          required
          disabled={isLoading}
        />
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Lock className="h-5 w-5" />
        </div>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Create password"
          value={password}
          onChange={handlePasswordChange}
          className="pl-10 pr-10 bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
          required
          disabled={isLoading}
        />
        <div 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-300"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </div>
      </div>

      {/* Password strength meter */}
      {password.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Password strength</span>
            <span className="text-xs font-semibold" 
              style={{ color: passwordStrength < 50 ? '#f87171' : passwordStrength < 75 ? '#facc15' : '#4ade80' }}>
              {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Moderate' : 'Strong'}
            </span>
          </div>
          <Progress value={passwordStrength} className="h-1 bg-gray-700" />
        </div>
      )}

      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="terms" 
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          disabled={isLoading}
        />
        <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
          I agree to the <Link to="/terms" className="text-teal hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>
        </label>
      </div>
    </div>
  );
};

export default StepBasicInfo;
