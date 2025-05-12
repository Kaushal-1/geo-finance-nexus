
export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  impact: 'high' | 'medium' | 'low';
  description?: string;
}

// Timeline controller with events
export const timelineEvents: TimelineEvent[] = [
  {
    id: 'evt1',
    title: 'Fed Rate Decision',
    timestamp: '2025-05-09T14:30:00Z',
    impact: 'high',
    description: 'Federal Reserve announces decision on interest rates following FOMC meeting'
  },
  {
    id: 'evt2',
    title: 'US Jobs Report',
    timestamp: '2025-05-08T12:30:00Z',
    impact: 'medium',
    description: 'Monthly employment situation report showing non-farm payrolls and unemployment rate'
  },
  {
    id: 'evt3',
    title: 'Tech Earnings',
    timestamp: '2025-05-07T20:00:00Z',
    impact: 'high',
    description: 'Major technology companies report quarterly earnings results'
  },
  {
    id: 'evt4',
    title: 'Oil Price Jump',
    timestamp: '2025-05-06T09:15:00Z',
    impact: 'medium',
    description: 'Crude oil prices surge on supply concerns and increased global demand'
  },
  {
    id: 'evt5',
    title: 'Market Open',
    timestamp: '2025-05-12T13:30:00Z',
    impact: 'low',
    description: 'US stock market opens for trading'
  },
  {
    id: 'evt6',
    title: 'ECB Statement',
    timestamp: '2025-05-12T09:45:00Z',
    impact: 'medium',
    description: 'European Central Bank releases monetary policy statement'
  }
];

export function getTimelineEventForPosition(position: number): TimelineEvent | null {
  if (position < 0 || position > 100) return null;
  
  const index = Math.floor(position / (100 / timelineEvents.length));
  return timelineEvents[index >= timelineEvents.length ? timelineEvents.length - 1 : index];
}
