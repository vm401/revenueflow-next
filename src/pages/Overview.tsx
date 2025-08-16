import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUltraData } from "@/contexts/UltraDataContext";
import { TrendingUp, TrendingDown, Activity, Target, DollarSign, Users, MousePointer, Smartphone, Calendar } from "lucide-react";
import { AnimatedCard } from "@/components/AnimatedCard";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { AnimatedButton } from "@/components/AnimatedButton";

export default function Overview() {
  const { data, getUltraSummary, getFilteredCampaigns } = useUltraData();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Get filtered summary based on date range
  const filteredCampaigns = getFilteredCampaigns({
    dateFrom,
    dateTo,
    limit: 1000 // Get all campaigns for summary calculation
  });
  
  // Calculate summary from filtered data
  const summary = useMemo(() => {
    if (!data || filteredCampaigns.length === 0) {
      return getUltraSummary();
    }
    
    // Calculate summary from filtered campaigns
    const totalSpend = filteredCampaigns.reduce((sum, c) => sum + c.totalSpend, 0);
    const totalInstalls = filteredCampaigns.reduce((sum, c) => sum + c.totalInstalls, 0);
    const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + c.totalImpressions, 0);
    const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.totalClicks, 0);
    
    return {
      totalSpend,
      totalInstalls,
      totalImpressions,
      totalClicks,
      totalCampaigns: filteredCampaigns.length,
      totalCreatives: data.creatives.length,
      totalExchanges: data.exchanges.length,
      totalInventory: data.inventory.length,
      activeApps: new Set(filteredCampaigns.map(c => c.targetApp)).size,
      activeCountries: new Set(filteredCampaigns.flatMap(c => c.countries)).size,
      avgCPI: totalInstalls > 0 ? totalSpend / totalInstalls : 0,
      avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0
    };
  }, [data, filteredCampaigns, getUltraSummary]);
  
  // Calculate additional metrics
  const avgCTR = summary.avgCTR;
  const avgCPC = summary.avgCPC;
  const conversionRate = summary.totalImpressions > 0 ? (summary.totalInstalls / summary.totalImpressions) * 100 : 0;
  const avgIPM = summary.totalImpressions > 0 ? (summary.totalInstalls / summary.totalImpressions) * 1000 : 0; // IPM = Installs per Mille
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
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
          
          {/* Date Filter */}
          <AnimatedCard variant="mint" animation="slide" className="p-4">
            <div className="flex items-center gap-4">
              <AnimatedIcon icon={Calendar} variant="mint" animation="pulse" />
              <span className="text-sm font-medium">Date Range:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-auto filter-slide"
                  placeholder="From"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-auto filter-slide"
                  placeholder="To"
                />
                <AnimatedButton 
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  size="sm"
                  animation="bounce"
                >
                  Clear
                </AnimatedButton>
                <AnimatedButton 
                  onClick={() => {
                    // Date filtering is now automatic via useMemo
                    // Just log for debugging
                    console.log('Filtering by dates:', dateFrom, dateTo);
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  animation="pulse"
                >
                  Apply
                </AnimatedButton>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedCard variant="royal" animation="lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <AnimatedIcon icon={Activity} variant="royal" animation="pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">Active campaigns running</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard variant="mint" animation="lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <AnimatedIcon icon={DollarSign} variant="mint" animation="glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalSpend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard variant="lilac" animation="lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <AnimatedIcon icon={Smartphone} variant="lilac" animation="bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalInstalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">User acquisitions</p>
            </CardContent>
          </AnimatedCard>
          
          <AnimatedCard variant="peach" animation="lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CPI</CardTitle>
              <AnimatedIcon icon={Target} variant="peach" animation="rotate" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.avgCPI.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <p className="text-xs text-muted-foreground">Cost per install</p>
            </CardContent>
          </AnimatedCard>
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
              <CardTitle className="text-sm font-medium">Average IPM</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgIPM.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {avgIPM > 2 ? (
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimatedCard variant="royal" animation="slide">
            <CardHeader>
              <CardTitle>Campaign Distribution</CardTitle>
              <CardDescription>
                Breakdown of your campaign portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Creatives</span>
                <span className="font-semibold">{summary.totalCreatives}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Campaigns</span>
                <span className="font-semibold">{summary.totalCampaigns}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ad Exchanges</span>
                <span className="font-semibold">{summary.totalExchanges}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Countries</span>
                <span className="font-semibold">{summary.activeCountries || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Source</span>
                <Badge variant="secondary" className="text-xs">
                  {data ? 'CSV Files' : 'Demo Data'}
                </Badge>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard variant="mint" animation="slide">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Key performance indicators from your CSV data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Impressions</span>
                <span className="font-semibold">
                  {summary.totalImpressions >= 1000000 
                    ? (summary.totalImpressions / 1000000).toFixed(2) + 'm'
                    : summary.totalImpressions >= 1000 
                    ? (summary.totalImpressions / 1000).toFixed(2) + 'k'
                    : summary.totalImpressions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Clicks</span>
                <span className="font-semibold">
                  {summary.totalClicks >= 1000000 
                    ? (summary.totalClicks / 1000000).toFixed(2) + 'k'
                    : summary.totalClicks.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Install Rate</span>
                <span className="font-semibold">{conversionRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. CTR</span>
                <span className="font-semibold">{avgCTR.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Data Source</span>
                <Badge variant="secondary" className="text-xs">
                  {data ? 'CSV Files' : 'Demo Data'}
                </Badge>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {!data && (
          <AnimatedCard variant="peach" animation="glow" className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">No CSV Data Loaded</CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Upload your CSV files to see real campaign data and analytics.
              </CardDescription>
            </CardHeader>
          </AnimatedCard>
        )}
      </div>
    </Layout>
  );
}