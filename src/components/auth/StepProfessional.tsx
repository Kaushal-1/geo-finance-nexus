
import React from "react";
import { Building, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StepProfessionalProps {
  industry: string;
  setIndustry: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  experience: string;
  setExperience: (value: string) => void;
  isLoading: boolean;
}

const StepProfessional: React.FC<StepProfessionalProps> = ({
  industry,
  setIndustry,
  role,
  setRole,
  experience,
  setExperience,
  isLoading
}) => {
  return (
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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
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
  );
};

export default StepProfessional;
