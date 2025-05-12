
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <Card className="glass-card card-hover border-white/5 bg-black/30">
      <CardHeader>
        <div className="bg-teal-gradient inline-flex h-12 w-12 items-center justify-center rounded-full mb-4">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-white text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-300">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
