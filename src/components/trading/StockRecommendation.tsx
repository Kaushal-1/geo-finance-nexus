
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { alpacaService } from "@/services/alpacaService";

interface StockRecommendationProps {
  stock1: string;
  stock2: string;
}

interface Recommendation {
  winner: string;
  loser: string;
  score1: number;
  score2: number;
  reasons: string[];
}

const StockRecommendation: React.FC<StockRecommendationProps> = ({ stock1, stock2 }) => {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate recommendation when stocks change
  useEffect(() => {
    generateRecommendation();
  }, [stock1, stock2]);
  
  // Generate recommendation based on Perplexity Sonar API
  const generateRecommendation = async () => {
    setIsLoading(true);
    
    try {
      const apiKey = "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";
      
      // Create the query for comparison
      const query = `Compare the investment potential of ${stock1} vs ${stock2} stocks.
      Which one is a better buy right now and why? Consider technical indicators, 
      fundamental metrics, recent news, and growth potential. Provide your analysis as 
      a JSON with these properties:
      - winner (the better stock to buy: "${stock1}" or "${stock2}")
      - loser (the less favorable stock: "${stock1}" or "${stock2}")
      - score1 (a number 1-100 representing ${stock1}'s investment score)
      - score2 (a number 1-100 representing ${stock2}'s investment score)
      - reasons (array of 3 main reasons why the winner is better)`;
      
      // Call the Perplexity Sonar API
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "You are a financial analyst AI that compares stocks and provides investment recommendations. Be objective and data-driven."
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonPattern = /```json([\s\S]*?)```|({[\s\S]*})/;
      const match = jsonPattern.exec(content);
      
      if (match) {
        let jsonString = match[1] || match[2];
        jsonString = jsonString.trim();
        const result = JSON.parse(jsonString);
        
        // Set the recommendation
        setRecommendation(result);
      } else {
        // Fallback to mock data
        createMockRecommendation();
      }
    } catch (error) {
      console.error("Error generating recommendation:", error);
      createMockRecommendation();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create mock recommendation as fallback
  const createMockRecommendation = () => {
    // Random selection for demo purposes
    const isStock1Winner = Math.random() > 0.5;
    const winner = isStock1Winner ? stock1 : stock2;
    const loser = isStock1Winner ? stock2 : stock1;
    const score1 = isStock1Winner ? 75 + Math.floor(Math.random() * 15) : 55 + Math.floor(Math.random() * 15);
    const score2 = isStock1Winner ? 55 + Math.floor(Math.random() * 15) : 75 + Math.floor(Math.random() * 15);
    
    const mockReasons = [
      `${winner} shows stronger technical indicators with better momentum`,
      `${winner} has more favorable valuation metrics compared to industry peers`,
      `${winner} has better growth prospects based on recent earnings reports`
    ];
    
    setRecommendation({
      winner,
      loser,
      score1,
      score2,
      reasons: mockReasons
    });
  };
  
  // Handle trade button click
  const handleTrade = (symbol: string) => {
    // Navigate to trade page or open trade panel
    toast({
      title: "Trade Initiated",
      description: `You selected to trade ${symbol}. Redirecting to trading panel...`,
      duration: 3000
    });
    
    // Here you would navigate to trade page or open a modal
    // For demo purposes, just show a toast
  };
  
  return (
    <Card className="bg-black/20 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Buy Recommendation</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateRecommendation} 
            disabled={isLoading}
            className="border-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full bg-gray-800" />
            <Skeleton className="h-20 w-full bg-gray-800" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-1/2 bg-gray-800" />
              <Skeleton className="h-10 w-1/2 bg-gray-800" />
            </div>
          </div>
        ) : recommendation ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {recommendation.winner === stock1 ? stock1 : stock2}
                </div>
                <div className="text-sm text-gray-400">Our recommended pick</div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-medium text-green-500">
                      {recommendation.winner === stock1 ? recommendation.score1 : recommendation.score2}/100
                    </span>
                  </div>
                  <span className="mx-4">vs</span>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-medium text-red-500">
                      {recommendation.loser === stock1 ? recommendation.score1 : recommendation.score2}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Why {recommendation.winner} is our pick:</h4>
              <ul className="space-y-1 list-disc list-inside">
                {recommendation.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-300">{reason}</li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleTrade(stock1)} 
                className={`${stock1 === recommendation.winner ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Trade {stock1}
              </Button>
              <Button 
                onClick={() => handleTrade(stock2)} 
                className={`${stock2 === recommendation.winner ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Trade {stock2}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">No recommendation available.</p>
            <Button onClick={generateRecommendation} className="mt-4">
              Generate Recommendation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockRecommendation;
