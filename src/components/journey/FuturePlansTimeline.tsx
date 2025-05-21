
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, BrainCircuit, Globe, BarChart4, LineChart } from "lucide-react";

const FuturePlansTimeline = () => {
  const plans = [
    {
      id: 1,
      title: "AI-Powered Portfolio Builder",
      description:
        "Build intelligent, personalized portfolios using Sonar API's market insights. The system will analyze real-time news, trends, and sentiment data to recommend asset allocations tailored to user risk profiles.",
      icon: BrainCircuit,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      id: 2,
      title: "Sentiment Heatmap",
      description:
        "Visualize market sentiment across countries and sectors. Sonar API will extract and classify news sentiment in real time, powering a dynamic Mapbox heatmap to show mood shifts geographically and thematically.",
      icon: Globe,
      color: "bg-teal/10 text-teal border-teal/20",
    },
    {
      id: 3,
      title: "Earnings Calendar & Analyst Forecasts",
      description:
        "Integrate a real-time earnings tracker with forecast insights. Sonar API will summarize pre/post-earnings news, analyst outlooks, and highlight potential market movers, giving users actionable previews and recaps.",
      icon: CalendarClock,
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    {
      id: 4,
      title: "Local Investment Radar",
      description:
        "NeuroTicker surfaces emerging microeconomic activity and local growth signals across geographies—before institutional investors catch on.",
      icon: LineChart,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
  ];

  return (
    <div className="mt-24">
      <div className="text-center mb-16">
        <Badge
          variant="outline"
          className="border-teal/30 bg-teal/5 text-teal px-3 py-1 mb-4"
        >
          The Road Ahead
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          NeuroTicker Innovation Roadmap
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Our vision for the future of geospatial financial intelligence
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-card p-6 rounded-xl border border-white/10 hover:border-teal/20 transition-colors"
          >
            <div
              className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mb-4`}
            >
              <plan.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
            <p className="text-gray-400">{plan.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <span className="text-teal font-mono">
          Estimated completion: Q4 2025 - Q2 2026
        </span>
      </div>
    </div>
  );
};

export default FuturePlansTimeline;
