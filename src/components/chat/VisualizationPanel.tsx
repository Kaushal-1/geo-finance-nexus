import React from 'react';
import { X, BarChart, LineChart, PieChart, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VisualizationPanelProps {
  onClose: () => void;
  title?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'map';
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ 
  onClose, 
  title = 'Financial Visualization',
  chartType = 'bar' 
}) => {
  return (
    <div className="border border-white/10 rounded-xl bg-black/40 backdrop-blur-md p-4 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue={chartType} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="bar" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Bar</span>
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span>Line</span>
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-1">
              <PieChart className="h-4 w-4" />
              <span>Pie</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span>Map</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar">
            <BarChartVisualization />
          </TabsContent>
          
          <TabsContent value="line">
            <LineChartVisualization />
          </TabsContent>
          
          <TabsContent value="pie">
            <PieChartVisualization />
          </TabsContent>
          
          <TabsContent value="map">
            <MapVisualization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const BarChartVisualization: React.FC = () => {
  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700">
      <h4 className="text-sm font-medium mb-2">Stock Performance Comparison</h4>
      <div className="h-64 flex items-end justify-between gap-2 pt-5">
        {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'].map((stock, index) => {
          const height = Math.floor(Math.random() * 80) + 20;
          return (
            <div key={stock} className="flex flex-col items-center">
              <div 
                className={`w-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm`}
                style={{ height: `${height}%` }}
              />
              <span className="text-xs mt-2">{stock}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const LineChartVisualization: React.FC = () => {
  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700">
      <h4 className="text-sm font-medium mb-2">Market Trends (Last 6 Months)</h4>
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 300 200">
          <polyline
            points="0,180 50,120 100,160 150,60 200,80 250,40 300,100"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <polyline
            points="0,150 50,170 100,130 150,140 200,120 250,90 300,110"
            fill="none"
            stroke="#fb7185"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </Card>
  );
};

const PieChartVisualization: React.FC = () => {
  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700">
      <h4 className="text-sm font-medium mb-2">Sector Allocation</h4>
      <div className="h-64 flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
            <path d="M50,50 L50,10 A40,40 0 0,1 85,65 z" fill="#fb7185" stroke="#0f172a" strokeWidth="1" />
            <path d="M50,50 L85,65 A40,40 0 0,1 20,75 z" fill="#a3e635" stroke="#0f172a" strokeWidth="1" />
            <path d="M50,50 L20,75 A40,40 0 0,1 50,10 z" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
          </svg>
        </div>
      </div>
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#38bdf8] rounded-full"></div>
          <span>Tech</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#fb7185] rounded-full"></div>
          <span>Finance</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#a3e635] rounded-full"></div>
          <span>Energy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#fbbf24] rounded-full"></div>
          <span>Healthcare</span>
        </div>
      </div>
    </Card>
  );
};

const MapVisualization: React.FC = () => {
  return (
    <Card className="p-4 bg-gray-800/50 border-gray-700">
      <h4 className="text-sm font-medium mb-2">Global Market Impact</h4>
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <Map className="h-32 w-32 mx-auto text-blue-400 opacity-50" />
          <p className="text-sm mt-2">Interactive map visualization will appear here</p>
        </div>
      </div>
    </Card>
  );
};

export default VisualizationPanel;
