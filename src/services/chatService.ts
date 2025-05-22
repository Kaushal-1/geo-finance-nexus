import { ChatMessage, Visualization, SourceCitation } from '@/types/chat';
import { fetchFinancialNews } from '@/services/newsService';
import { finnhubService } from '@/services/finnhubService';

// Use the API key from environment variables
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

// Always return the API key from environment variables
export const getPerplexityApiKey = () => {
  return PERPLEXITY_API_KEY;
};

// This function is no longer needed as the API key comes from environment variables
export const setPerplexityApiKey = (key: string) => {
  // No-op - the key is now loaded from environment variables
  console.log('API key is loaded from environment variables, this function is deprecated');
};

// Helper function to generate a response with the Perplexity API, now with portfolio context
async function fetchPerplexityResponse(query: string, portfolioContext: any = null) {
  try {
    // Prepare system message with portfolio context if available
    let systemMessage = 'You are a financial analyst assistant that provides accurate, helpful information about markets, stocks, and economic events. Include relevant facts, data, and context in your answers. Format your responses in a clean, scannable style with clear section headers, bold for important points, and properly attributed sources.';
    
    if (portfolioContext) {
      systemMessage += `\n\nThe user has the following portfolio information from Alpaca:
      - Total Equity: $${portfolioContext.totalEquity?.toLocaleString() || 'N/A'}
      - Portfolio Change: ${portfolioContext.portfolioChange}%
      - Number of Positions: ${portfolioContext.totalPositions}
      - Largest Position: ${portfolioContext.largestPosition}
      
      Consider this portfolio context when providing financial advice and insights. Personalize your response based on their holdings when relevant.`;
    }
    
    // Using newer chat completions API for better responses
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error response:', errorData);
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching from Perplexity:', error);
    throw error;
  }
}

// Analyze message for visualization needs
function analyzeForVisualization(content: string): {
  needsVisualization: boolean;
  type: 'chart' | 'map' | 'both' | null;
  focus: string | null;
} {
  const lowerContent = content.toLowerCase();
  let needsVisualization = false;
  let type = null;
  let focus = null;

  // Check if visualization is explicitly requested
  if (lowerContent.includes('chart') || 
      lowerContent.includes('graph') || 
      lowerContent.includes('plot') || 
      lowerContent.includes('visualize') || 
      lowerContent.includes('show') || 
      lowerContent.includes('compare')) {
    
    needsVisualization = true;
    
    // Determine visualization type
    if (lowerContent.includes('map') || 
        lowerContent.includes('region') || 
        lowerContent.includes('country') || 
        lowerContent.includes('geographic') || 
        lowerContent.includes('global')) {
      type = 'map';
    } else {
      type = 'chart';
    }

    // Extract focus
    if (lowerContent.includes('stock')) {
      const stockMatch = content.match(/[A-Z]{1,5}/);
      focus = stockMatch ? stockMatch[0] : 'stocks';
    } else if (lowerContent.includes('sector')) {
      focus = 'sector';
    } else if (lowerContent.includes('interest rate')) {
      focus = 'interest rates';
    } else if (lowerContent.includes('inflation')) {
      focus = 'inflation';
    }
  }

  return {
    needsVisualization,
    type,
    focus
  };
}

// Helper function to determine sentiment
function determineSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveTerms = ['growth', 'increase', 'gain', 'positive', 'up', 'bullish', 'opportunity'];
  const negativeTerms = ['decline', 'decrease', 'loss', 'negative', 'down', 'bearish', 'risk'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveTerms.forEach(term => {
    if (lowerText.includes(term)) positiveScore++;
  });
  
  negativeTerms.forEach(term => {
    if (lowerText.includes(term)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

// Function to generate related questions
function generateSuggestedQuestions(message: string, history: ChatMessage[]): string[] {
  const lowerMessage = message.toLowerCase();
  const questions = [];
  
  // If discussing a specific stock
  if (lowerMessage.includes('stock') || /[A-Z]{1,5}/.test(message)) {
    questions.push('How might this stock perform in an economic downturn?');
    questions.push('What are the key risks for this company?');
  }
  
  // If discussing interest rates
  if (lowerMessage.includes('interest rate') || lowerMessage.includes('fed')) {
    questions.push('How do interest rate changes impact different market sectors?');
    questions.push('What historical patterns exist for markets after rate changes?');
  }
  
  // If discussing market trends
  if (lowerMessage.includes('trend') || lowerMessage.includes('market')) {
    questions.push('Which sectors are currently outperforming the broader market?');
    questions.push('How does this trend compare to similar historical periods?');
  }
  
  // Visualization follow-up
  if (lowerMessage.includes('chart') || lowerMessage.includes('visualization')) {
    questions.push('Can you show this data geographically on a map?');
    questions.push('How does this compare to last year\'s data?');
  }
  
  // If discussing economic factors
  if (lowerMessage.includes('economy') || lowerMessage.includes('inflation')) {
    questions.push('Which sectors typically perform best during high inflation?');
    questions.push('How do current conditions compare to previous economic cycles?');
  }
  
  // Keep only 3-4 questions
  return questions.slice(0, Math.min(4, questions.length));
}

// Helper to create source citations from Perplexity results
function createSourceCitations(responseJson: any): SourceCitation[] {
  try {
    // Extract sources from the new Perplexity chat completions API format
    if (responseJson?.search_results && Array.isArray(responseJson.search_results)) {
      return responseJson.search_results.map(result => ({
        url: result.url || '#',
        title: result.title || 'Financial Source',
        publisher: result.source_name || 'Financial Publication',
        date: result.published_date || new Date().toLocaleDateString()
      })).slice(0, 3); // Limit to 3 citations
    }
    return [];
  } catch (error) {
    console.error('Error creating source citations:', error);
    return [];
  }
}

// New function to generate portfolio-specific suggested questions
function generatePortfolioQuestions(message: string, history: ChatMessage[], portfolioContext: any): string[] {
  if (!portfolioContext) {
    return generateSuggestedQuestions(message, history);
  }
  
  const questions = [];
  const lowerMessage = message.toLowerCase();
  
  // If they have a largest position, suggest a question about it
  if (portfolioContext.largestPosition) {
    questions.push(`What's the latest news on ${portfolioContext.largestPosition}?`);
    questions.push(`What is the outlook for ${portfolioContext.largestPosition} in the next quarter?`);
  }
  
  // Portfolio analysis suggestions
  questions.push("How is my portfolio performing compared to the broader market?");
  questions.push("What's my sector exposure and should I be concerned about concentration risk?");
  questions.push("How would a 0.25% Fed rate change impact my current holdings?");
  
  // Keep only unique questions
  const uniqueQuestions = Array.from(new Set(questions));
  
  // Return at most 4 questions
  return uniqueQuestions.slice(0, 4);
}

// Main function to generate AI responses
export async function generateResponse(
  message: string, 
  history: ChatMessage[],
  portfolioContext: any = null
): Promise<{
  message: ChatMessage;
  visualization: Visualization | null;
  suggestedQuestions: string[];
}> {
  try {
    // Analyze if visualization is needed
    const visualizationAnalysis = analyzeForVisualization(message);
    
    // Fetch data from Perplexity with portfolio context
    const perplexityResponse = await fetchPerplexityResponse(message, portfolioContext);
    console.log('Perplexity API response:', perplexityResponse);
    
    // Extract content from response
    const responseContent = perplexityResponse?.choices?.[0]?.message?.content || '';
    
    // Create a simplified response if Perplexity doesn't provide good data
    const fallbackResponse = 
      "**Key Insight**: Based on recent financial data and market analysis, this question relates to important market dynamics.\n\n" +
      "## Market context\n\n" +
      "Several factors are currently influencing this situation, including " +
      "**interest rate policies**, global trade conditions, and sector-specific trends.\n\n" +
      "## Portfolio implications\n\n" +
      "Would you like me to analyze a specific aspect in more detail?";
    
    const aiResponseContent = responseContent || fallbackResponse;
    
    // Determine sentiment
    const sentiment = determineSentiment(aiResponseContent);
    
    // Create source citations
    const sources = createSourceCitations(perplexityResponse);
    
    // Generate AI message
    const aiMessage: ChatMessage = {
      id: '',
      sender: 'ai',
      content: aiResponseContent,
      timestamp: new Date(),
      sentiment,
      sources,
    };
    
    // Generate visualization if needed
    let visualization: Visualization | null = null;
    
    if (visualizationAnalysis.needsVisualization) {
      visualization = {
        id: '',
        title: `${visualizationAnalysis.focus || 'Market'} ${visualizationAnalysis.type === 'chart' ? 'Analysis' : 'Impact'}`,
        description: 'Data visualization based on recent market information',
        loading: false
      };
      
      if (visualizationAnalysis.type === 'chart' || visualizationAnalysis.type === 'both') {
        visualization.chart = {
          title: `${visualizationAnalysis.focus || 'Market'} Performance`,
          type: 'line',
          subtitle: 'Based on recent financial data',
          insights: 'Key patterns suggest market volatility with potential for growth in specific sectors.'
        };
      }
      
      if (visualizationAnalysis.type === 'map' || visualizationAnalysis.type === 'both') {
        visualization.map = {
          title: 'Geographic Market Impact',
          regions: []
        };
        
        visualization.globalImpact = {
          summary: 'Analysis of global market impact',
          regions: [
            {
              name: 'North America',
              impact: 'Medium',
              description: 'Moderate market fluctuations with tech sector leading recovery.'
            },
            {
              name: 'Europe',
              impact: 'High',
              description: 'Significant volatility due to energy concerns and policy shifts.'
            },
            {
              name: 'Asia-Pacific',
              impact: 'Medium',
              description: 'Mixed performance with strong manufacturing offset by trade tensions.'
            },
            {
              name: 'Emerging Markets',
              impact: 'Low',
              description: 'Relatively stable with selective growth opportunities in key markets.'
            }
          ]
        };
      }
    }
    
    // Generate portfolio-aware suggested follow-up questions
    let suggestedQuestions: string[] = [];
    
    if (portfolioContext) {
      suggestedQuestions = generatePortfolioQuestions(message, history, portfolioContext);
    } else {
      suggestedQuestions = generateSuggestedQuestions(message, history);
    }
    
    return {
      message: aiMessage,
      visualization,
      suggestedQuestions
    };
    
  } catch (error) {
    console.error('Error generating response:', error);
    
    // Create fallback response
    return {
      message: {
        id: '',
        sender: 'ai',
        content: "I apologize, but I'm having trouble analyzing this financial query right now. Could you try rephrasing your question or asking about a different financial topic?",
        timestamp: new Date(),
        sentiment: 'neutral'
      },
      visualization: null,
      suggestedQuestions: [
        'How did the S&P 500 perform last quarter?',
        'What factors influence interest rates?',
        'Explain market volatility in simple terms'
      ]
    };
  }
}
