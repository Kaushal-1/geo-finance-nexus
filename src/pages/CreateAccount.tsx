
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import SignupForm from "@/components/auth/SignupForm";

const CreateAccount: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-hero-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-teal mb-8">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" stroke="#00B8D4" strokeWidth="2.5" strokeMiterlimit="10" />
              <path d="M16 8V24" stroke="#00B8D4" strokeWidth="2.5" strokeMiterlimit="10" />
              <path d="M8 16H24" stroke="#00B8D4" strokeWidth="2.5" strokeMiterlimit="10" />
            </svg>
            <span className="text-xl font-bold tracking-tight">GeoFinance</span>
          </Link>
          
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account? <Link to="/signin" className="text-teal hover:underline">Sign in</Link>
          </p>
        </div>
        
        {/* Card with signup form */}
        <Card className="bg-[#151b2d]/80 border-white/10 backdrop-blur-sm text-white shadow-xl">
          <CardContent className="pt-6">
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAccount;
