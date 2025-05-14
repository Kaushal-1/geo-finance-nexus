
import { getPerplexityApiKey } from './chatService';

// Function to fetch relevant news using Perplexity Sonar API
export async function fetchFinancialNews(region = 'global', topic = 'financial markets') {
  try {
    const apiKey = getPerplexityApiKey();
    
    if (!apiKey) {
      throw new Error('Perplexity API key is not set');
    }
    
    const response = await fetch('https://api.perplexity.ai/sonar/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `Latest financial news affecting ${region} ${topic} in 2025`,
        max_results: 5,
        highlight: true,
        search_options: {
          include_domains: [
            "bloomberg.com",
            "ft.com",
            "wsj.com", 
            "reuters.com",
            "cnbc.com",
            "economist.com",
            "market-watch.com",
            "investing.com",
            "finance.yahoo.com"
          ]
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process results into a standardized format
    return data.results.map(item => ({
      id: Math.random().toString(36).substring(2),
      title: item.title || 'Financial News Update',
      summary: item.snippet || item.content?.substring(0, 150) || '',
      source: item.source_name || 'Financial Source',
      sourceUrl: item.url || '#',
      url: item.url || '#',
      timestamp: item.published_date || new Date().toISOString(),
      // Add computed fields
      impact: calculateImpact(item.title, item.snippet),
      sentiment: calculateSentiment(item.title, item.snippet),
      category: determineCategory(item.title, item.snippet),
      impactColor: getImpactColor(calculateImpact(item.title, item.snippet)),
      credibilityScore: calculateCredibilityScore(item.source_name || '')
    }));
  } catch (error) {
    console.error('Error fetching financial news:', error);
    return [];
  }
}

// Get impact color based on impact level
function getImpactColor(impact: string): string {
  switch(impact) {
    case 'High': return '#ff5252';
    case 'Medium': return '#7b61ff';
    default: return '#00b8d4';
  }
}

// Calculate credibility score based on source
function calculateCredibilityScore(source: string): number {
  const highCredibilitySources = [
    'Financial Times', 'Bloomberg', 'The Wall Street Journal', 
    'Reuters', 'The Economist', 'CNBC', 'Yahoo Finance'
  ];
  
  const mediumCredibilitySources = [
    'MarketWatch', 'Investing.com', 'Business Insider', 
    'Forbes', 'Nasdaq', 'Barron\'s'
  ];
  
  if (highCredibilitySources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
    return 90 + Math.floor(Math.random() * 8); // 90-97
  }
  
  if (mediumCredibilitySources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
    return 80 + Math.floor(Math.random() * 10); // 80-89
  }
  
  return 70 + Math.floor(Math.random() * 10); // Default 70-79
}

// Helper function to calculate impact (simplified version)
export function calculateImpact(title: string, content: string = '') {
  const impactTerms = {
    high: ['significant', 'major', 'breaking', 'crash', 'surge', 'crisis', 'federal reserve', 'collapse', 'recession'],
    medium: ['rise', 'fall', 'increase', 'decrease', 'announce', 'report', 'quarterly', 'growth', 'inflation'],
    low: ['minor', 'small', 'slight', 'update', 'consider', 'plan', 'potential', 'possible']
  };
  
  const text = (title + ' ' + content).toLowerCase();
  
  if (impactTerms.high.some(term => text.includes(term))) return 'High';
  if (impactTerms.medium.some(term => text.includes(term))) return 'Medium';
  return 'Low';
}

// Helper function to calculate sentiment (simplified version)
export function calculateSentiment(title: string, content: string = '') {
  const positiveTerms = ['rise', 'gain', 'grow', 'positive', 'up', 'surge', 'rally', 'recovery', 'boost'];
  const negativeTerms = ['fall', 'drop', 'decline', 'negative', 'down', 'crash', 'loss', 'crisis', 'concern'];
  
  const text = (title + ' ' + content).toLowerCase();
  
  let positiveCount = positiveTerms.filter(term => text.includes(term)).length;
  let negativeCount = negativeTerms.filter(term => text.includes(term)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Helper function to determine news category
export function determineCategory(title: string, content: string = '') {
  const categoryTerms = {
    Policy: ['policy', 'fed', 'federal reserve', 'central bank', 'interest rate', 'regulation'],
    Markets: ['stock', 'market', 'index', 'equities', 'shares', 'securities', 'trading'],
    Commodities: ['oil', 'gold', 'commodity', 'natural gas', 'metals', 'agriculture'],
    Technology: ['tech', 'technology', 'AI', 'artificial intelligence', 'software', 'startup'],
    Crypto: ['crypto', 'bitcoin', 'blockchain', 'ethereum', 'token', 'digital currency'],
    Economy: ['gdp', 'unemployment', 'inflation', 'economic', 'economy', 'growth']
  };
  
  const text = (title + ' ' + content).toLowerCase();
  
  for (const [category, terms] of Object.entries(categoryTerms)) {
    if (terms.some(term => text.includes(term))) {
      return category;
    }
  }
  
  return 'Markets'; // Default category
}

// Renamed to mockNewsData to avoid confusion with getMockNews function
export const mockNewsData = [
  {
    id: '1',
    title: "Fed signals potential rate cuts in coming months",
    summary: "Federal Reserve Chair Jerome Powell indicated the central bank could begin reducing interest rates as early as March if inflation continues to ease.",
    source: "Financial Times",
    sourceUrl: "https://ft.com",
    url: "https://ft.com",
    timestamp: "2025-05-10T14:30:00Z",
    impact: "High",
    impactColor: "#ff5252", // red for high impact
    category: "Policy",
    credibilityScore: 95,
  },
  {
    id: '2',
    title: "Tech sector rally continues with AI-driven momentum",
    summary: "Technology stocks extend their gains as artificial intelligence investments continue to drive market enthusiasm despite valuation concerns.",
    source: "Market Watch",
    sourceUrl: "https://marketwatch.com",
    url: "https://marketwatch.com",
    timestamp: "2025-05-10T10:15:00Z",
    impact: "Medium",
    impactColor: "#7b61ff", // purple for medium impact
    category: "Technology",
    credibilityScore: 88,
  },
  {
    id: '3',
    title: "Oil prices stabilize after Middle East tensions ease",
    summary: "Crude oil futures find support at key technical levels as diplomatic efforts reduce concerns about supply disruptions in the region.",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    url: "https://reuters.com",
    timestamp: "2025-05-10T08:45:00Z",
    impact: "Low",
    impactColor: "#00b8d4", // teal for low impact
    category: "Commodities",
    credibilityScore: 92,
  },
  {
    id: '4',
    title: "European banks exceed profit expectations in Q4",
    summary: "Major European financial institutions report stronger-than-anticipated earnings, boosted by higher interest rates and effective cost management strategies.",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    url: "https://bloomberg.com",
    timestamp: "2025-05-09T16:20:00Z",
    impact: "Medium",
    impactColor: "#7b61ff",
    category: "Markets",
    credibilityScore: 90,
  },
  {
    id: '5',
    title: "Bitcoin surpasses $90,000 as institutional adoption increases",
    summary: "The world's leading cryptocurrency reaches new all-time highs as more financial institutions add Bitcoin to their balance sheets.",
    source: "CNBC",
    sourceUrl: "https://cnbc.com",
    url: "https://cnbc.com",
    timestamp: "2025-05-09T03:10:00Z",
    impact: "High",
    impactColor: "#ff5252",
    category: "Crypto",
    credibilityScore: 85,
  }
];
