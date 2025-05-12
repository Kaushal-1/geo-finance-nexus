
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Welcome to GeoFinance",
    description: "Discover a new way to visualize and analyze financial data with geospatial intelligence.",
  },
  {
    title: "Powerful Visualization",
    description: "Interact with our 3D globe to explore financial hotspots and market connections worldwide.",
  },
  {
    title: "AI-Driven Analytics",
    description: "Leverage advanced machine learning models to uncover hidden patterns in global financial markets.",
  },
  {
    title: "Get Started",
    description: "Ready to transform your financial analysis with geospatial intelligence? Start exploring now.",
  },
];

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-white/10 bg-black/80 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-4">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                  index === currentStep ? "bg-teal-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="default"
            onClick={handleNext}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white button-glow"
          >
            {currentStep < steps.length - 1 ? "Next" : "Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
