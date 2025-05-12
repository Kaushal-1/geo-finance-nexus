
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisualizationPanelProps {
  onClose: () => void;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ onClose }) => {
  return (
    <div className="border border-white/10 rounded-xl bg-black/40 backdrop-blur-md p-4 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Visualization</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <PlaceholderPanel />
      </div>
    </div>
  );
};

// Fix: Return a React element instead of void
const PlaceholderPanel: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white/50">Visualization content will appear here</p>
    </div>
  );
};

export default VisualizationPanel;
