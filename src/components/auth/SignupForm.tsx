
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import FormStepper from "./FormStepper";
import StepBasicInfo from "./StepBasicInfo";
import StepProfessional from "./StepProfessional";
import StepPreferences from "./StepPreferences";

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 3;

  // Step 1 - Basic Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2 - Professional Info
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");

  // Step 3 - Preferences
  const [markets, setMarkets] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(false);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!firstName || !lastName || !email || !password || !termsAccepted) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields and accept the terms.",
          variant: "destructive",
        });
        return;
      }
      
      if (passwordStrength < 50) {
        toast({
          title: "Weak password",
          description: "Please create a stronger password for better security.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, {
        firstName, 
        lastName,
        industry,
        role,
        experience,
        markets,
        notifications
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Redirect on success
      toast({
        title: "Account created",
        description: "Welcome to GeoFinance! You've been signed in.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormStepper currentStep={currentStep} totalSteps={totalSteps} />

      {/* Step content */}
      {currentStep === 1 && (
        <StepBasicInfo
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          passwordStrength={passwordStrength}
          setPasswordStrength={setPasswordStrength}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          isLoading={isLoading}
        />
      )}
      
      {currentStep === 2 && (
        <StepProfessional
          industry={industry}
          setIndustry={setIndustry}
          role={role}
          setRole={setRole}
          experience={experience}
          setExperience={setExperience}
          isLoading={isLoading}
        />
      )}
      
      {currentStep === 3 && (
        <StepPreferences
          markets={markets}
          setMarkets={setMarkets}
          notifications={notifications}
          setNotifications={setNotifications}
          isLoading={isLoading}
        />
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1 || isLoading}
          variant="outline"
          className="border-white/20 hover:bg-white/10"
        >
          Back
        </Button>
        
        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="bg-teal hover:bg-teal/80"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSignup}
            disabled={isLoading}
            className="bg-teal hover:bg-teal/80"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SignupForm;
