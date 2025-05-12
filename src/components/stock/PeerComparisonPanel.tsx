
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LabelList,
  ResponsiveContainer
} from 'recharts';

interface CompanyPeer {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
}

interface PeerComparisonPanelProps {
  peers: CompanyPeer[];
  currentCompany: CompanyPeer;
}

const PeerComparisonPanel: React.FC<PeerComparisonPanelProps> = ({ peers, currentCompany }) => {
  // Ensure we have valid peers and current company
  const validPeers = peers && Array.isArray(peers) ? peers.filter(peer => peer?.symbol) : [];
  
  if (!validPeers.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No peer comparison data available.</p>
        </CardContent>
      </Card>
    );
  }

  // Include current company in comparison
  const allCompanies = [currentCompany, ...validPeers]
    .filter(company => company !== null);
  
  // Remove duplicates by symbol
  const uniqueCompanies = allCompanies.filter((company, index, self) => 
    index === self.findIndex(c => c.symbol === company.symbol)
  );

  // Sort by market cap (descending)
  uniqueCompanies.sort((a, b) => b.marketCap - a.marketCap);

  // Prepare data for performance comparison chart
  const performanceData = uniqueCompanies.map(company => ({
    name: company.symbol,
    value: company.changePercent,
    fill: company.symbol === currentCompany.symbol
      ? (company.changePercent >= 0 ? '#00e676' : '#ff5252')
      : (company.changePercent >= 0 ? '#81c784' : '#e57373')
  }));

  // Prepare data for market cap comparison chart
  const marketCapData = uniqueCompanies.map(company => ({
    name: company.symbol,
    value: company.marketCap,
    fill: company.symbol === currentCompany.symbol ? '#00b8d4' : '#455a64'
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Peer Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Performance Comparison Chart */}
            <div>
              <h3 className="text-lg font-medium mb-4">Today's Performance (%)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis 
                      type="number" 
                      tickFormatter={value => `${value?.toFixed(1) || 0}%`}
                      tick={{ fill: '#90a4ae', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      tick={{ fill: '#f5f7fa', fontSize: 12, fontWeight: 'bold' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value)?.toFixed(2) || 0}%`, 'Change']}
                      contentStyle={{ 
                        backgroundColor: '#1a2035',
                        borderColor: '#455a64',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#00e676"
                      background={{ fill: 'transparent' }}
                      animationDuration={1000}
                    >
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        formatter={(value: number) => `${value?.toFixed(2) || 0}%`}
                        style={{ fill: '#f5f7fa', fontSize: '12px', fontFamily: 'Roboto Mono, monospace' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Market Cap Comparison Chart */}
            <div>
              <h3 className="text-lg font-medium mb-4">Market Cap Comparison ($B)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={marketCapData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: '#f5f7fa', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis 
                      tickFormatter={value => `$${Number(value)?.toFixed(0) || 0}B`}
                      tick={{ fill: '#90a4ae', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${Number(value)?.toFixed(2) || 0}B`, 'Market Cap']}
                      contentStyle={{ 
                        backgroundColor: '#1a2035',
                        borderColor: '#455a64',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#00b8d4"
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Peers Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Peer Companies</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left py-2 px-3 text-xs text-muted-foreground">Symbol</th>
                      <th className="text-left py-2 px-3 text-xs text-muted-foreground">Name</th>
                      <th className="text-right py-2 px-3 text-xs text-muted-foreground">Price</th>
                      <th className="text-right py-2 px-3 text-xs text-muted-foreground">Change</th>
                      <th className="text-right py-2 px-3 text-xs text-muted-foreground">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/30">
                    {uniqueCompanies.map(company => (
                      <tr 
                        key={company.symbol}
                        className={company.symbol === currentCompany.symbol ? 
                          "bg-primary/5" : ""}
                      >
                        <td className="py-2 px-3 font-medium">{company.symbol}</td>
                        <td className="py-2 px-3 truncate max-w-[200px]">{company.name}</td>
                        <td className="py-2 px-3 text-right font-mono">${(company.price || 0).toFixed(2)}</td>
                        <td className={`py-2 px-3 text-right font-mono flex items-center justify-end ${company.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {company.change >= 0 ? (
                            <ArrowUpIcon className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="mr-1 h-4 w-4" />
                          )}
                          {(company.changePercent || 0).toFixed(2)}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono">${formatMarketCap(company.marketCap || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to format market cap
function formatMarketCap(marketCap: number) {
  if (!marketCap) return 'N/A';
  
  if (marketCap >= 1000) {
    return `${(marketCap / 1000).toFixed(2)}T`;
  } else {
    return `${marketCap.toFixed(2)}B`;
  }
}

export default PeerComparisonPanel;
