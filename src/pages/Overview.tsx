import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { TrendingUp, TrendingDown, Activity, Target, DollarSign, Users, MousePointer, Smartphone } from "lucide-react";

export default function Overview() {
  const { data, getDashboardSummary } = useData();
  const summary = getDashboardSummary();
  
  // Calculate additional metrics
  const avgCTR = summary.avgCTR;
  const avgCPC = summary.avgCPC;
  const conversionRate = summary.totalImpressions > 0 ? (summary.totalInstalls / summary.totalImpressions) * 100 : 0;
  const roi = summary.totalSpend > 0 ? ((summary.totalInstalls * 5 - summary.totalSpend) / summary.totalSpend) * 100 : 0; // Assuming $5 LTV per install
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Overview</h1>
            <p className="text-muted-foreground font-sans">
              Comprehensive overview of your advertising campaigns and performance metrics.
            </p>
          </div>
          {data && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              CSV Data Active
            </Badge>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">Active campaigns running</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalSpend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalInstalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">User acquisitions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CPI</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.avgCPI.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <p className="text-xs text-muted-foreground">Cost per install</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCTR.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                {avgCTR > 1 ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Above average
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Below average
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CPC</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgCPC.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <p className="text-xs text-muted-foreground">Cost per click</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Impressions to installs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {roi > 0 ? (
                  <span className="text-green-600">Profitable</span>
                ) : (
                  <span className="text-red-600">Loss making</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Distribution</CardTitle>
              <CardDescription>
                Breakdown of your campaign portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Campaigns</span>
                <span className="font-semibold">{summary.totalCampaigns}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Creatives</span>
                <span className="font-semibold">{summary.totalCreatives}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ad Exchanges</span>
                <span className="font-semibold">{summary.totalExchanges}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inventory Sources</span>
                <span className="font-semibold">{summary.totalInventory}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Countries</span>
                <span className="font-semibold">{summary.activeCountries}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Key performance indicators from your CSV data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Impressions</span>
                <span className="font-semibold">{summary.totalImpressions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Clicks</span>
                <span className="font-semibold">{summary.totalClicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Install Rate</span>
                <span className="font-semibold">{conversionRate.toFixed(3)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. CTR</span>
                <span className="font-semibold">{avgCTR.toFixed(3)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Source</span>
                <Badge variant="secondary" className="text-xs">
                  {data ? 'CSV Files' : 'Demo Data'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {!data && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">No CSV Data Loaded</CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Upload your CSV files to see real campaign data and analytics.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </Layout>
  );
}