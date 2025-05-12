
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, AtSign, Check, CircleUserRound, 
  Eye, EyeOff, LineChart, Lock, Building, Briefcase
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Globe from "@/components/Globe";
import ParticleField from "@/components/ParticleField";

type FormStep = 1 | 2 | 3;

const CreateAccount = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Form fields states - Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Form fields states - Step 2
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");

  // Form fields states - Step 3
  const [notifications, setNotifications] = useState(true);
  const [markets, setMarkets] = useState<string[]>([]);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prevStep => (prevStep + 1) as FormStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prevStep => (prevStep - 1) as FormStep);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    calculatePasswordStrength(newPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Account creation form submitted with:", {
      firstName, lastName, email, password,
      industry, role, experience,
      notifications, markets
    });
    // Add actual registration logic here
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-[#0a0e17] to-[#131b2e]">
      {/* Left side - Visualization */}
      <div className="hidden md:flex md:w-3/5 relative flex-col items-center justify-center p-8">
        <ParticleField />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-3xl h-[500px]">
            <Globe className="opacity-70" />
          </div>
        </div>

        <div className="relative z-10 text-center max-w-xl">
          <h1 className="text-4xl font-bold text-white mb-4 text-gradient">
            Join the Future of Financial Analysis
          </h1>
          <p className="text-gray-300 text-xl mb-12">
            Make informed decisions with location-aware financial data
          </p>

          {/* Benefits */}
          <div className="mt-12 space-y-4">
            <div className="glass-card p-4 text-left flex items-start animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <LineChart className="mr-3 text-teal w-6 h-6 mt-1" />
              <p className="text-gray-300">Discover market correlations through geographic visualization</p>
            </div>
            <div className="glass-card p-4 text-left flex items-start animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Building className="mr-3 text-teal w-6 h-6 mt-1" />
              <p className="text-gray-300">Receive AI-powered insights with geospatial context</p>
            </div>
            <div className="glass-card p-4 text-left flex items-start animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <Briefcase className="mr-3 text-teal w-6 h-6 mt-1" />
              <p className="text-gray-300">Track market-moving events on an interactive timeline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-4 md:p-8">
        <div className="glass-card w-full max-w-md p-8 rounded-xl border border-white/10 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-block">
              <div className="w-16 h-16 bg-teal-gradient rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 4V2M12 22V20M4 12H2M22 12H20M6.34 6.34L4.93 4.93M19.07 19.07L17.66 17.66M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 12L10 14L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
              <p className="text-gray-400 mt-2">Join GeoFinance to unlock powerful financial insights</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between items-center mb-8">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`flex flex-col items-center ${currentStep === step ? 'opacity-100' : 'opacity-50'}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === step ? 'bg-teal text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {step}
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Professional' : 'Preferences'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
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
                    <Progress value={passwordStrength} className="h-1 bg-gray-700">
                      <div className={`h-full ${getStrengthColor()}`} style={{ width: `${passwordStrength}%` }} />
                    </Progress>
                  </div>
                )}

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                    I agree to the <Link to="/terms" className="text-teal hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Building className="h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="pl-10 bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Job Title / Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="pl-10 bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-400 mb-2">
                    Investment Experience
                  </label>
                  <select
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-md bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20 text-white p-2.5"
                  >
                    <option value="" className="bg-[#151b2d]">Select your experience level</option>
                    <option value="beginner" className="bg-[#151b2d]">Beginner (0-2 years)</option>
                    <option value="intermediate" className="bg-[#151b2d]">Intermediate (2-5 years)</option>
                    <option value="experienced" className="bg-[#151b2d]">Experienced (5-10 years)</option>
                    <option value="expert" className="bg-[#151b2d]">Expert (10+ years)</option>
                  </select>
                </div>

                <p className="text-sm text-gray-400 italic">
                  This information helps us tailor GeoFinance to your specific needs.
                  Your professional details are optional.
                </p>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Markets of Interest (Choose one or more)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['US Equities', 'European Markets', 'Asia Pacific', 'Emerging Markets', 'Commodities', 'Forex', 'Crypto', 'Real Estate'].map((market) => (
                      <div key={market} className="flex items-center space-x-2">
                        <Checkbox 
                          id={market.toLowerCase().replace(/\s/g, '-')}
                          checked={markets.includes(market)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMarkets([...markets, market]);
                            } else {
                              setMarkets(markets.filter(m => m !== market));
                            }
                          }}
                        />
                        <label htmlFor={market.toLowerCase().replace(/\s/g, '-')} className="text-sm text-gray-300 cursor-pointer">
                          {market}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="notifications" 
                    checked={notifications}
                    onCheckedChange={(checked) => setNotifications(checked === true)}
                  />
                  <label htmlFor="notifications" className="text-sm text-gray-300 cursor-pointer">
                    Receive email notifications for market insights and alerts
                  </label>
                </div>

                <p className="text-sm text-gray-400 italic">
                  Your preferences help us provide the most relevant information and alerts.
                  You can always change these settings later.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  onClick={handlePrevStep}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Back
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className="text-white bg-teal-gradient button-glow hover:brightness-110 transition-all"
                    disabled={
                      (currentStep === 1 && (!firstName || !lastName || !email || !password || !termsAccepted))
                    }
                  >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="text-white bg-teal-gradient button-glow hover:brightness-110 transition-all flex items-center"
                  >
                    Create Account <Check className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link to="/signin" className="text-teal hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
