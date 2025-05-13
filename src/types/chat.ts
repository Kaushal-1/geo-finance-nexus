
export interface SourceCitation {
  url: string;
  title: string;
  publisher: string;
  date: string;
}

export interface Chart {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  data?: any;
  insights?: string;
}

export interface MapData {
  title: string;
  regions?: any[];
  data?: any;
}

export interface RegionImpact {
  name: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface GlobalImpactData {
  summary: string;
  regions: RegionImpact[];
}

export interface Visualization {
  id: string;
  title: string;
  description?: string;
  loading?: boolean;
  chart?: Chart;
  map?: MapData;
  globalImpact?: GlobalImpactData;
  type?: 'bar' | 'line' | 'pie' | 'map';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: SourceCitation[];
  visualizationId?: string;
  charts?: Chart[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  activeVisualization: Visualization | null;
  suggestedQuestions: string[];
}
