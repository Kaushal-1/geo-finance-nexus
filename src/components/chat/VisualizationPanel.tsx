import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChartLine, Map, ChevronLeft, Download, RefreshCw, ZoomIn, ZoomOut, Globe } from "lucide-react";
import { Visualization } from "@/types/chat";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MapVisualization from "@/components/dashboard/MapVisualization";
interface VisualizationPanelProps {
  activeVisualization: Visualization | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
}
const LoadingPanel = () => <div className="flex h-full w-full items-center justify-center">
    <div className="text-center">
      <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-solid border-gray-400 border-t-teal-500"></div>
      <p className="mt-4 text-gray-400">Preparing visualization...</p>
    </div>
  </div>;
const PlaceholderPanel = () => {};
const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  activeVisualization,
  isExpanded,
  onToggleExpand
}) => {
  const [activeTab, setActiveTab] = useState("chart");
  const [is3DView, setIs3DView] = useState(true);
  const handleViewToggle = () => {
    setIs3DView(prev => !prev);
  };
  if (!activeVisualization) {
    return <PlaceholderPanel />;
  }
  if (activeVisualization.loading) {
    return <LoadingPanel />;
  }
  return <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleExpand}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">{activeVisualization.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
        {activeVisualization.description && <p className="mt-1 text-sm text-gray-400">{activeVisualization.description}</p>}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
          <TabsList className="m-2 bg-gray-800/90">
            <TabsTrigger value="chart">
              <ChartLine className="mr-1 h-4 w-4" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map className="mr-1 h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="global">
              <Globe className="mr-1 h-4 w-4" />
              Global Impact
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="chart" className="h-full">
            {activeVisualization.chart ? <div className="h-full p-4">
                {/* Chart Component */}
                <Card className="h-full border-gray-800 bg-gray-900/70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{activeVisualization.chart.title}</CardTitle>
                    {activeVisualization.chart.subtitle && <CardDescription>{activeVisualization.chart.subtitle}</CardDescription>}
                  </CardHeader>
                  <CardContent className="pb-6">
                    {/* This would be your actual chart component */}
                    <div className="flex h-64 items-center justify-center rounded-lg border border-gray-800 bg-gray-800/50">
                      <p className="text-gray-400">Chart visualization goes here</p>
                    </div>
                    
                    {activeVisualization.chart.insights && <div className="mt-4 rounded-lg border border-teal-900/30 bg-teal-900/10 p-3">
                        <h4 className="mb-1 font-medium text-teal-400">Key Insights</h4>
                        <p className="text-sm text-gray-300">{activeVisualization.chart.insights}</p>
                      </div>}
                  </CardContent>
                </Card>
              </div> : <div className="flex h-full items-center justify-center">
                <p className="text-gray-400">No chart data available</p>
              </div>}
          </TabsContent>
          
          <TabsContent value="map" className="h-full">
            {activeVisualization.map ? <div className="relative h-full">
                <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-gray-800/80">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-gray-800/80">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
                {/* Map Component */}
                <MapVisualization is3DView={is3DView} onViewToggle={handleViewToggle} />
              </div> : <div className="flex h-full items-center justify-center">
                <p className="text-gray-400">No map data available</p>
              </div>}
          </TabsContent>
          
          <TabsContent value="global" className="h-full">
            <div className="h-full p-4">
              <Card className="h-full border-gray-800 bg-gray-900/70">
                <CardHeader>
                  <CardTitle>Global Market Impact</CardTitle>
                  <CardDescription>
                    How this topic affects different markets worldwide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeVisualization.globalImpact ? activeVisualization.globalImpact.regions.map(region => <div key={region.name} className="rounded-lg border border-gray-800 bg-gray-800/30 p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{region.name}</h4>
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${region.impact === 'High' ? 'bg-red-900/30 text-red-400' : region.impact === 'Medium' ? 'bg-amber-900/30 text-amber-400' : 'bg-blue-900/30 text-blue-400'}`}>
                              {region.impact} Impact
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-400">{region.description}</p>
                        </div>) : <p className="text-gray-400">No global impact data available</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>;
};
export default VisualizationPanel;