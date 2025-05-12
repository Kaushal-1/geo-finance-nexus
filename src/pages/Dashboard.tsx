
import React from "react";
import { Layout } from "@/components/dashboard/Layout";
import MapVisualization from "@/components/dashboard/MapVisualization";
import MarketPerformancePanel from "@/components/dashboard/MarketPerformancePanel";
import NewsAnalysisPanel from "@/components/dashboard/NewsAnalysisPanel";
import TimelineControl from "@/components/dashboard/TimelineControl";
import { DashboardProvider } from "@/context/DashboardContext";

const Dashboard = () => {
  return (
    <DashboardProvider>
      <Layout>
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <MapVisualization />
          <MarketPerformancePanel />
          <NewsAnalysisPanel />
          <TimelineControl />
        </div>
      </Layout>
    </DashboardProvider>
  );
};

export default Dashboard;
