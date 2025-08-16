import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, DollarSign, Users, BarChart, RefreshCw, Loader2, AlertTriangle, CheckCircle, ExternalLink, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useState, useEffect } from "react";

// Mock data based on Moloco CRM specification
const mockMetrics = {
  totalSpend: 125840,
  totalInstalls: 45200,
  totalCampaigns: 342,
  averageCPI: 2.78,
  activeApps: 28,
  activeCountries: 15
};

const mockChartData = [
  { date: "May 19", value: 1000 },
  { date: "Jun 08", value: 1200 },
  { date: "Jun 28", value: 1150 },
  { date: "Jul 18", value: 1350 },
  { date: "Aug 07", value: 1580 },
];

const mockCampaigns = [
  {
    campaignId: "camp_5f4b8a2e059040799f172ee913ccbfda",
    campaignName: "iOS Premium - Gaming Campaign",
    appName: "SuperGame Pro",
    country: "US",
    date: "2025-01-15",
    spend: "2,450.00 $",
    installs: 1250,
    cpi: "1.96 $",
    status: "ACTIVE",
    flag: "🇺🇸"
  },
  {
    campaignId: "camp_cf2af784cd2447409e3f7981edf083c6",
    campaignName: "Android Acquisition - Tier 1",
    appName: "MegaApp",
    country: "DE",
    date: "2025-01-15",
    spend: "1,890.00 $",
    installs: 850,
    cpi: "2.22 $",
    status: "ACTIVE",
    flag: "🇩🇪"
  },
  {
    campaignId: "camp_a79a27ebf74445c299aca9a96cce660e",
    campaignName: "Retargeting - High Value Users",
    appName: "FinanceApp",
    country: "UK",
    date: "2025-01-14",
    spend: "3,200.00 $",
    installs: 950,
    cpi: "3.37 $",
    status: "PAUSED",
    flag: "🇬🇧"
  },
  {
    campaignId: "camp_3822a3e2feff4558aaffec4c06841f6d",
    campaignName: "Lookalike - Premium Segment",
    appName: "TravelBooking",
    country: "CA",
    date: "2025-01-14",
    spend: "1,750.00 $",
    installs: 620,
    cpi: "2.82 $",
    status: "ACTIVE",
    flag: "🇨🇦"
  },
  {
    campaignId: "camp_f99fdfec74e44fcab6addf9fdd2bf3",
    campaignName: "Video Creative Test",
    appName: "SocialMedia+",
    country: "AU",
    date: "2025-01-13",
    spend: "980.00 $",
    installs: 420,
    cpi: "2.33 $",
    status: "TESTING",
    flag: "🇦🇺"
  }
];

export function DashboardOverview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const { data: csvData, getDashboardSummary, getFilteredCampaigns } = useData();

  // Fetch real data from API with enhanced error handling
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard,
    isStale: isDashboardStale,
    dataUpdatedAt: dashboardUpdatedAt
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      try {
        setConnectionStatus('checking');
        const result = await api.getDashboardData();
        setConnectionStatus('online');
        setLastUpdated(new Date());
        return result;
      } catch (error) {
        setConnectionStatus('offline');
        throw error;
      }
    },
    refetchInterval: () => {
      // Dynamic refetch interval based on connection status
      if (connectionStatus === 'offline') return 60000; // 1 minute when offline
      return 30000; // 30 seconds when online
    },
    retry: (failureCount, error: any) => {
      // Custom retry logic
      if (error?.response?.status === 401) return false; // Don't retry auth errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  const { 
    data: campaignsData, 
    isLoading: isCampaignsLoading,
    error: campaignsError 
  } = useQuery({
    queryKey: ['campaigns', 'recent'],
    queryFn: () => api.getCampaigns({ limit: 5, sort_by: 'date', sort_order: 'desc' }),
    refetchInterval: connectionStatus === 'offline' ? 60000 : 30000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    enabled: !!dashboardData, // Only fetch campaigns after dashboard data loads
  });

  // Data validation and processing
  const validateMetrics = (data: any) => {
    if (!data || typeof data !== 'object') return null;
    
    // Ensure all required fields exist and are numbers
    const requiredFields = ['total_spend', 'total_installs', 'total_campaigns', 'average_cpi'];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) return null;
    }
    
    return data;
  };

  // Use CSV data if available, fallback to API data, then mock data
  const csvSummary = getDashboardSummary();
  const recentCampaigns = getFilteredCampaigns({ 
    sortBy: 'spend', 
    sortOrder: 'desc', 
    limit: 5 
  });

  // Use CSV data if available, otherwise fallback to API or mock
  const metrics = csvData ? {
    totalSpend: csvSummary.totalSpend,
    totalInstalls: csvSummary.totalInstalls,
    totalCampaigns: csvSummary.totalCampaigns,
    averageCPI: csvSummary.avgCPI,
    activeApps: csvSummary.activeApps,
    activeCountries: csvSummary.activeCountries
  } : (validateMetrics((dashboardData as any)?.data?.data?.summary) || mockMetrics);
  
  const campaigns = csvData ? recentCampaigns : ((campaignsData as any)?.data?.data || mockCampaigns);
  
  // Helper function to safely get metric values with fallbacks
  const getMetricValue = (key: string) => {
    const value = (metrics as any)[key];
    if (typeof value === 'number' && !isNaN(value)) return value;
    
    // Fallback to alternative key names
    const alternativeKeys: { [key: string]: string[] } = {
      total_spend: ['totalSpend', 'spend'],
      total_installs: ['totalInstalls', 'installs'],
      total_campaigns: ['totalCampaigns', 'campaigns'],
      average_cpi: ['averageCPI', 'avgCPI', 'cpi']
    };
    
    const alternatives = alternativeKeys[key] || [];
    for (const altKey of alternatives) {
      const altValue = (metrics as any)[altKey];
      if (typeof altValue === 'number' && !isNaN(altValue)) return altValue;
    }
    
    return 0;
  };
  
  const isLoading = isDashboardLoading || isCampaignsLoading;
  const hasError = dashboardError || campaignsError;
  const isUsingCSVData = !!csvData;
  const isUsingFallbackData = !csvData && !validateMetrics(dashboardData?.data?.data?.summary);

  const handleRefresh = async () => {
    try {
      setConnectionStatus('checking');
      
      // Invalidate and refetch all dashboard queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] }),
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      ]);
      
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated successfully.",
      });
      
      setLastUpdated(new Date());
      setConnectionStatus('online');
    } catch (error) {
      setConnectionStatus('offline');
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  // Auto-refresh notification
  useEffect(() => {
    if (dashboardUpdatedAt && !isDashboardLoading && !hasError) {
      const timeSinceUpdate = Date.now() - dashboardUpdatedAt;
      if (timeSinceUpdate > 60000) { // Show notification if data is older than 1 minute
        toast({
          title: "Data Updated",
          description: "Dashboard metrics have been refreshed.",
        });
      }
    }
  }, [dashboardUpdatedAt, isDashboardLoading, hasError, toast]);

  return (
    <div className="space-y-6">
      {/* Page Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-2">
            {isUsingCSVData && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                CSV Data
              </Badge>
            )}
            {!isUsingCSVData && connectionStatus === 'online' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Live API
              </Badge>
            )}
            {!isUsingCSVData && connectionStatus === 'offline' && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            {!isUsingCSVData && connectionStatus === 'checking' && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Connecting
              </Badge>
            )}
            {isUsingFallbackData && (
              <Badge variant="outline" className="text-xs">
                Demo Data
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status Alerts */}
      {hasError && connectionStatus === 'offline' && (
        <Alert className="border-destructive/20 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            <strong>Connection Lost:</strong> Unable to fetch live data. Showing cached data from {lastUpdated.toLocaleString()}.
            <Button 
              variant="link" 
              className="p-0 h-auto text-destructive underline ml-2"
              onClick={handleRefresh}
            >
              Try reconnecting
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isUsingFallbackData && connectionStatus === 'online' && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Demo Mode:</strong> API returned invalid data. Showing demonstration data for preview purposes.
          </AlertDescription>
        </Alert>
      )}

      {isDashboardStale && connectionStatus === 'online' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Data may be outdated. 
            <Button 
              variant="link" 
              className="p-0 h-auto underline ml-1"
              onClick={handleRefresh}
            >
              Refresh now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Spend */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Spend</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Info className="h-3 w-3 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">Total Spend Breakdown</p>
                      <p>Media Spend: ${(getMetricValue('total_spend') || getMetricValue('totalSpend') || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      <p>Agency Commission (8%): ${((getMetricValue('total_spend') || getMetricValue('totalSpend') || 0) * 0.08).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      <p className="font-semibold border-t pt-1">Spend with Commission: ${((getMetricValue('total_spend') || getMetricValue('totalSpend') || 0) * 1.08).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${(getMetricValue('total_spend') || getMetricValue('totalSpend') || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Total Installs */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Installs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{(getMetricValue('total_installs') || getMetricValue('totalInstalls') || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Total Campaigns */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Campaigns</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{getMetricValue('total_campaigns') || getMetricValue('totalCampaigns') || 0}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-5/6 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Average CPI */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Average CPI</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${(getMetricValue('average_cpi') || getMetricValue('averageCPI') || getMetricValue('avgCPI') || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Cost per install</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Average IPM */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Average IPM</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Info className="h-3 w-3 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">Installs Per Mille (IPM)</p>
                      <p>Number of installs per 1000 impressions</p>
                      <p>Formula: (Installs / Impressions) × 1000</p>
                      <p>Current: {csvData ? (csvSummary.totalImpressions > 0 ? ((csvSummary.totalInstalls / csvSummary.totalImpressions) * 1000).toFixed(2) : '0.00') : '0.00'}‰</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {csvData ? (csvSummary.totalImpressions > 0 ? ((csvSummary.totalInstalls / csvSummary.totalImpressions) * 1000).toFixed(2) : '0.00') : '0.00'}‰
            </div>
            <p className="text-xs text-muted-foreground">Installs per 1000 impressions</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-primary rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Active Countries */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Countries</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{getMetricValue('activeCountries') || 0}</div>
            <p className="text-xs text-muted-foreground">Geographic reach</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Recent Campaigns</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              Live data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Campaign</TableHead>
                <TableHead className="text-muted-foreground">App</TableHead>
                <TableHead className="text-muted-foreground">Country</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Spend</TableHead>
                <TableHead className="text-muted-foreground">Installs</TableHead>
                <TableHead className="text-muted-foreground">CPI</TableHead>
                <TableHead className="text-muted-foreground">IPM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading recent campaigns...</p>
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">No recent campaigns found</p>
                    <Button variant="link" className="mt-2" asChild>
                      <a href="/upload">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Upload campaign data
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.slice(0, 5).map((campaign: any, index: number) => {
                  // Handle both API data format and mock data format
                  const campaignName = campaign.name || campaign.campaignName || 'Unknown Campaign';
                  const appName = campaign.targetApp || campaign.appName || 'Unknown App';
                  const country = campaign.countries?.[0] || campaign.country || 'Unknown';
                  const date = campaign.startDate || campaign.date || campaign.lastUpdated;
                  const spend = typeof campaign.totalSpend === 'number' 
                    ? `$${campaign.totalSpend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                    : typeof campaign.spend === 'number' 
                    ? `$${campaign.spend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                    : '$0.00';
                  const installs = typeof campaign.totalInstalls === 'number' 
                    ? campaign.totalInstalls 
                    : typeof campaign.installs === 'number' 
                    ? campaign.installs 
                    : 0;
                  const cpi = typeof campaign.cpi === 'number' 
                    ? `$${campaign.cpi.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` 
                    : '$0.00';
                  // Calculate IPM (Installs per Mille - installs per 1000 impressions)
                  const totalImpressions = campaign.totalImpressions || 0;
                  const ipm = totalImpressions > 0 ? ((installs / totalImpressions) * 1000).toFixed(2) : '0.00';

                  // Get country flag
                  const countryFlags: { [key: string]: string } = {
                    'US': '🇺🇸', 'UK': '🇬🇧', 'DE': '🇩🇪', 'CA': '🇨🇦', 'AU': '🇦🇺',
                    'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'JP': '🇯🇵', 'KR': '🇰🇷',
                    'FRA': '🇫🇷', 'GRC': '🇬🇷', 'GBR': '🇬🇧', 'USA': '🇺🇸', 'CAN': '🇨🇦',
                    'AUS': '🇦🇺', 'DEU': '🇩🇪', 'ITA': '🇮🇹', 'ESP': '🇪🇸'
                  };
                  const flag = countryFlags[country] || '🌍';

                  return (
                    <TableRow key={campaign.id || index} className="border-border hover:bg-muted/50 cursor-pointer group">
                      <TableCell className="font-medium text-sm">
                        <div className="max-w-[200px] truncate">
                          <span className="text-foreground group-hover:text-primary transition-colors">
                            {campaignName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{appName}</TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{flag}</span>
                          <span>{country}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {date ? new Date(date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">{spend}</TableCell>
                      <TableCell className="text-foreground">{installs.toLocaleString()}</TableCell>
                      <TableCell className="text-foreground">{cpi}</TableCell>
                      <TableCell className="text-foreground font-semibold">
                        {ipm}‰
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CSV Data Actions */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-card-foreground">CSV Data Management</h3>
              <p className="text-sm text-muted-foreground">Upload and analyze your campaign data</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <a href="/upload">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Upload CSV Files
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/campaigns">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Campaign Data
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}