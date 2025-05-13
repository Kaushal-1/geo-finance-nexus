
import React from "react";

interface FormStepperProps {
  currentStep: number;
  totalSteps: number;
}

const FormStepper: React.FC<FormStepperProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          {/* Step circle */}
          <div 
            className={`h-8 w-8 rounded-full flex items-center justify-center
              ${index + 1 <= currentStep 
                ? "bg-teal text-white" 
                : "bg-white/10 text-white/50"}`}
          >
            <span>{index + 1}</span>
          </div>
          
          {/* Connector line */}
          {index < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-1 
              ${index + 1 < currentStep ? "bg-teal" : "bg-white/10"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FormStepper;
