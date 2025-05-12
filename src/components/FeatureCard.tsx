
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <Card className="glass-card card-hover border-white/5 bg-black/30">
      <CardHeader>
        <div className="bg-teal-gradient inline-flex h-12 w-12 items-center justify-center rounded-full mb-4">
          {icon}
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
