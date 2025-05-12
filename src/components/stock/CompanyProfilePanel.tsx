
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface CompanyProfilePanelProps {
  profile: {
    name?: string;
    description?: string;
    finnhubIndustry?: string;
    exchange?: string;
    ipo?: string;
    weburl?: string;
    country?: string;
    currency?: string;
    marketCapitalization?: number;
    phone?: string;
  };
}

const CompanyProfilePanel: React.FC<CompanyProfilePanelProps> = ({ profile }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No company data available.</p>
        </CardContent>
      </Card>
    );
  }

  const description = profile.description || 'No company description available.';
  const shouldTruncateDescription = description.length > 400 && !showFullDescription;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Description */}
        <div>
          <h3 className="text-lg font-medium mb-2">About</h3>
          <div className="text-sm text-muted-foreground">
            {shouldTruncateDescription ? (
              <>
                <p>{description.substring(0, 400)}...</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFullDescription(true)}
                  className="mt-2 flex items-center gap-1"
                >
                  Read More <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <p>{description}</p>
                {description.length > 400 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFullDescription(false)}
                    className="mt-2 flex items-center gap-1"
                  >
                    Read Less <ChevronUpIcon className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Company Details */}
        <div>
          <h3 className="text-lg font-medium mb-2">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Industry</dt>
                  <dd className="text-sm font-medium">{profile.finnhubIndustry || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Exchange</dt>
                  <dd className="text-sm font-medium">{profile.exchange || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">IPO Date</dt>
                  <dd className="text-sm font-medium">{profile.ipo || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Website</dt>
                  <dd className="text-sm font-medium">
                    {profile.weburl ? (
                      <a 
                        href={profile.weburl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        Visit <ExternalLinkIcon className="ml-1 h-3 w-3" />
                      </a>
                    ) : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Country</dt>
                  <dd className="text-sm font-medium">{profile.country || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Currency</dt>
                  <dd className="text-sm font-medium">{profile.currency || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Market Cap</dt>
                  <dd className="text-sm font-medium font-mono">
                    {profile.marketCapitalization ? 
                      formatMarketCap(profile.marketCapitalization) : 
                      'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="text-sm font-medium">{profile.phone || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format market cap
function formatMarketCap(marketCap: number) {
  if (!marketCap) return 'N/A';
  
  if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(2)}T`;
  } else {
    return `$${marketCap.toFixed(2)}B`;
  }
}

export default CompanyProfilePanel;
