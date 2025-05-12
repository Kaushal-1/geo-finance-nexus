
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface FinancialMetricsPanelProps {
  financials: {
    metric?: {
      peBasicExcl?: number;
      epsBasicExcl?: number;
      dividendYieldIndicatedAnnual?: number;
      roe?: number;
      totalDebtToEquityQuarterly?: number;
      grossMarginTTM?: number;
      [key: string]: any;
    };
    series?: {
      quarterly?: {
        revenue?: Record<string, number>;
        [key: string]: any;
      };
    };
  };
  earnings: Array<{
    period: string;
    actual: number;
    estimate: number;
    surprise?: number;
    surprisePercent?: number;
  }>;
}

const FinancialMetricsPanel: React.FC<FinancialMetricsPanelProps> = ({ financials, earnings }) => {
  if (!financials || !financials.metric) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No financial data available.</p>
        </CardContent>
      </Card>
    );
  }

  const { metric } = financials;

  // Format quarterly metrics if available
  const hasQuarterlyData = financials.series && financials.series.quarterly;
  const hasEarningsData = earnings && earnings.length > 0;

  let revenueData = null;
  if (hasQuarterlyData && financials.series?.quarterly?.revenue) {
    const revenueQuarterly = financials.series.quarterly.revenue;
    const quarters = Object.keys(revenueQuarterly).sort();
    
    revenueData = quarters.map(quarter => {
      const [year, q] = quarter.split('Q');
      return {
        quarter: `Q${q} ${year}`,
        revenue: revenueQuarterly[quarter] / 1000000 // Convert to millions
      };
    });
  }

  // Format earnings data for the chart
  const earningsChartData = hasEarningsData 
    ? earnings.map(quarter => ({
        period: quarter.period,
        actual: quarter.actual,
        estimate: quarter.estimate,
        surprise: quarter.surprise || 0,
        surprisePercent: quarter.surprisePercent || 0
      })).reverse().slice(0, 8)
    : [];

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Metric 
              title="P/E Ratio" 
              value={metric.peBasicExcl} 
              format={val => val.toFixed(2)}
            />
            <Metric 
              title="EPS (TTM)" 
              value={metric.epsBasicExcl} 
              format={val => `$${val.toFixed(2)}`}
            />
            <Metric 
              title="Dividend Yield" 
              value={metric.dividendYieldIndicatedAnnual} 
              format={val => `${val.toFixed(2)}%`}
            />
            <Metric 
              title="ROE" 
              value={metric.roe} 
              format={val => `${val.toFixed(2)}%`}
            />
            <Metric 
              title="Debt-to-Equity" 
              value={metric.totalDebtToEquityQuarterly}
              format={val => val.toFixed(2)}
            />
            <Metric 
              title="Gross Margin (TTM)" 
              value={metric.grossMarginTTM} 
              format={val => `${val.toFixed(2)}%`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        {hasEarningsData && (
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={earningsChartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="period"
                      tick={{ fill: '#90a4ae', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis 
                      tickFormatter={value => `$${value.toFixed(2)}`}
                      tick={{ fill: '#90a4ae', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'EPS']}
                      contentStyle={{ 
                        backgroundColor: '#1a2035',
                        borderColor: '#455a64',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="actual" name="Actual EPS" fill="#00b8d4" />
                    <Bar dataKey="estimate" name="Estimated EPS" fill="#90a4ae" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Chart */}
        {revenueData && revenueData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="quarter"
                      tick={{ fill: '#90a4ae', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis 
                      tickFormatter={value => `$${Number(value).toFixed(0)}M`}
                      tick={{ fill: '#90a4ae', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}M`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: '#1a2035',
                        borderColor: '#455a64',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone"
                      dataKey="revenue" 
                      name="Revenue ($M)" 
                      stroke="#7b61ff"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!hasEarningsData && !revenueData && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center py-10">
              No detailed financial history data available for this company.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper component for displaying metrics
interface MetricProps {
  title: string;
  value?: number | null;
  format?: (val: number) => string;
}

const Metric: React.FC<MetricProps> = ({ title, value, format }) => (
  <div className="p-3 bg-muted/10 rounded-lg">
    <div className="text-xs text-muted-foreground">{title}</div>
    <div className="text-lg font-mono font-medium mt-1">
      {value !== undefined && value !== null ? 
        (format ? format(value) : value.toString()) : 
        'N/A'}
    </div>
  </div>
);

export default FinancialMetricsPanel;
