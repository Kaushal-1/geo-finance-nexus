
import React from "react";
import { Visualization } from "@/types/chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface VisualizationPanelProps {
  visualization: Visualization;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ visualization }) => {
  if (!visualization) return null;

  return (
    <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 mb-4">
      <h3 className="text-lg font-medium text-white mb-2">{visualization.title}</h3>
      {visualization.description && <p className="text-sm text-gray-300 mb-4">{visualization.description}</p>}
      
      {visualization.chart && (
        <div className="mb-4">
          <h4 className="font-medium text-white">{visualization.chart.title}</h4>
          {visualization.chart.subtitle && <p className="text-sm text-gray-400">{visualization.chart.subtitle}</p>}
          <div className="h-60 w-full mt-3 flex items-center justify-center border border-gray-700 rounded">
            {visualization.chart.imageUrl ? (
              <img src={visualization.chart.imageUrl} alt={visualization.chart.title} className="max-h-full" />
            ) : (
              <div className="text-gray-500 text-center">
                <p>Chart visualization would appear here</p>
                <p className="text-xs">Based on market data analysis</p>
              </div>
            )}
          </div>
          {visualization.chart.insights && (
            <p className="text-sm text-gray-300 mt-2">{visualization.chart.insights}</p>
          )}
        </div>
      )}
      
      {visualization.map && (
        <div className="mt-4">
          <h4 className="font-medium text-white">{visualization.map.title}</h4>
          <div className="h-60 w-full mt-3 flex items-center justify-center border border-gray-700 rounded bg-gray-900/50">
            <div className="text-gray-500 text-center">
              <p>Map visualization would appear here</p>
              <p className="text-xs">Based on geographic market impact</p>
            </div>
          </div>
        </div>
      )}
      
      {visualization.globalImpact && (
        <div className="mt-4">
          <h4 className="font-medium text-white mb-2">Global Market Impact</h4>
          <p className="text-sm text-gray-300 mb-3">{visualization.globalImpact.summary}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visualization.globalImpact.regions.map((region, index) => (
              <div key={index} className="p-3 rounded border border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-white">{region.name}</h5>
                  <span className={`text-xs px-2 py-1 rounded ${
                    region.impact === 'High' ? 'bg-red-900/50 text-red-300' :
                    region.impact === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-green-900/50 text-green-300'
                  }`}>
                    {region.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{region.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizationPanel;
