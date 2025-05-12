
// Function to fetch relevant news using Perplexity Sonar API
export async function fetchFinancialNews(region = 'global', topic = 'financial markets') {
  try {
    const response = await fetch('https://api.perplexity.ai/sonar/search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `Latest financial news affecting ${region} ${topic}`,
        max_results: 5
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
      timestamp: item.published_date || new Date().toISOString(),
      // Add computed fields
      impact: calculateImpact(item.title, item.snippet),
      sentiment: calculateSentiment(item.title, item.snippet),
      category: determineCategory(item.title, item.snippet)
    }));
  } catch (error) {
    console.error('Error fetching financial news:', error);
    return [];
  }
}

// Helper function to calculate impact (simplified version)
export function calculateImpact(title: string, content: string = '') {
  const impactTerms = {
    high: ['significant', 'major', 'breaking', 'crash', 'surge', 'crisis', 'federal reserve'],
    medium: ['rise', 'fall', 'increase', 'decrease', 'announce', 'report', 'quarterly'],
    low: ['minor', 'small', 'slight', 'update', 'consider', 'plan']
  };
  
  const text = (title + ' ' + content).toLowerCase();
  
  if (impactTerms.high.some(term => text.includes(term))) return 'High';
  if (impactTerms.medium.some(term => text.includes(term))) return 'Medium';
  return 'Low';
}

// Helper function to calculate sentiment (simplified version)
export function calculateSentiment(title: string, content: string = '') {
  const positiveTerms = ['rise', 'gain', 'grow', 'positive', 'up', 'surge', 'rally', 'recovery'];
  const negativeTerms = ['fall', 'drop', 'decline', 'negative', 'down', 'crash', 'loss', 'crisis'];
  
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
    Markets: ['stock', 'market', 'index', 'equities', 'shares', 'securities'],
    Commodities: ['oil', 'gold', 'commodity', 'natural gas', 'metals', 'agriculture'],
    Earnings: ['earnings', 'profit', 'revenue', 'quarterly results', 'financial results'],
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

// Mock news data in case API fails
export const mockNewsData = [
  {
    id: '1',
    title: "Fed signals potential rate cuts in coming months",
    summary: "Federal Reserve Chair Jerome Powell indicated the central bank could begin reducing interest rates as early as March if inflation continues to ease.",
    source: "Financial Times",
    sourceUrl: "https://ft.com",
    timestamp: "2025-05-10T14:30:00Z",
    impact: "High",
    impactColor: "#ff5252", // red for high impact
    category: "Policy",
    sentiment: "positive"
  },
  {
    id: '2',
    title: "Tech sector rally continues with AI-driven momentum",
    summary: "Technology stocks extend their gains as artificial intelligence investments continue to drive market enthusiasm despite valuation concerns.",
    source: "Market Watch",
    sourceUrl: "https://marketwatch.com",
    timestamp: "2025-05-10T10:15:00Z",
    impact: "Medium",
    impactColor: "#7b61ff", // purple for medium impact
    category: "Markets",
    sentiment: "positive"
  },
  {
    id: '3',
    title: "Oil prices stabilize after Middle East tensions ease",
    summary: "Crude oil futures find support at key technical levels as diplomatic efforts reduce concerns about supply disruptions in the region.",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    timestamp: "2025-05-10T08:45:00Z",
    impact: "Low",
    impactColor: "#00b8d4", // teal for low impact
    category: "Commodities",
    sentiment: "neutral"
  },
  {
    id: '4',
    title: "European banks exceed profit expectations in Q4",
    summary: "Major European financial institutions report stronger-than-anticipated earnings, boosted by higher interest rates and effective cost management strategies.",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    timestamp: "2025-05-09T16:20:00Z",
    impact: "Medium",
    impactColor: "#7b61ff",
    category: "Earnings",
    sentiment: "positive"
  },
  {
    id: '5',
    title: "Asia-Pacific markets mixed as investors assess economic data",
    summary: "Regional equities show divergent performance with Japanese stocks declining while Chinese markets advance on manufacturing activity improvement.",
    source: "CNBC",
    sourceUrl: "https://cnbc.com",
    timestamp: "2025-05-09T03:10:00Z",
    impact: "Low",
    impactColor: "#00b8d4",
    category: "Markets",
    sentiment: "neutral"
  }
];
