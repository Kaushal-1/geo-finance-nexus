import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, AtSign, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Globe from "@/components/Globe";
import ParticleField from "@/components/ParticleField";
import { useAuth } from "@/contexts/AuthContext";
const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    signIn,
    user
  } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        error
      } = await signIn(email, password);
      if (!error) {
        // Redirect happens automatically through AuthContext
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-[#0a0e17] to-[#131b2e]">
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
            Global Financial Intelligence at Your Fingertips
          </h1>
          <p className="text-gray-300 text-xl mb-12">
            Analyze markets through a geographic lens
          </p>

          {/* Testimonials */}
          <div className="mt-12 space-y-6">
            <div className="glass-card p-4 text-left animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              <p className="text-gray-300 italic">"GeoFinance revolutionizes how we visualize market opportunities across regions."</p>
              <p className="text-teal text-sm mt-2">
            </p>
            </div>
            <div className="glass-card p-4 text-left animate-fade-in" style={{
            animationDelay: "0.4s"
          }}>
              <p className="text-gray-300 italic">"The geospatial insights  helps identify emerging market trends months ahead of competitors."</p>
              <p className="text-teal text-sm mt-2">
            </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-4 md:p-8">
        <div className="glass-card w-full max-w-md p-8 rounded-xl border border-white/10 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-block">
              <div className="w-16 h-16 bg-teal-gradient rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 4V2M12 22V20M4 12H2M22 12H20M6.34 6.34L4.93 4.93M19.07 19.07L17.66 17.66M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 12L10 14L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Sign In</h2>
              <p className="text-gray-400 mt-2">Access your GeoFinance dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <AtSign className="h-5 w-5" />
              </div>
              <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20" required disabled={isLoading} />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10 bg-black/30 border-white/10 focus:border-teal focus:ring focus:ring-teal/20" required disabled={isLoading} />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-300" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked === true)} disabled={isLoading} />
                <label htmlFor="remember-me" className="text-sm text-gray-300 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-teal hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-12 text-white bg-teal-gradient button-glow hover:brightness-110 transition-all" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative flex items-center mt-8">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="flex space-x-4">
              <button type="button" className="flex-1 flex items-center justify-center h-11 rounded-md border border-white/10 bg-black/20 hover:bg-black/40 transition-colors" disabled={isLoading}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
              <button type="button" className="flex-1 flex items-center justify-center h-11 rounded-md border border-white/10 bg-black/20 hover:bg-black/40 transition-colors" disabled={isLoading}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </button>
              <button type="button" className="flex-1 flex items-center justify-center h-11 rounded-md border border-white/10 bg-black/20 hover:bg-black/40 transition-colors" disabled={isLoading}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400">
                New to GeoFinance?{" "}
                <Link to="/signup" className="text-teal hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>;
};
export default SignIn;