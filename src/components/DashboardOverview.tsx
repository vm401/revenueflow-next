import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, BarChart, RefreshCw, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
  // Fetch real data from API
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: api.getDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  });

  const { 
    data: campaignsData, 
    isLoading: isCampaignsLoading,
    error: campaignsError 
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.getCampaigns({ limit: 5 }),
    refetchInterval: 30000,
    retry: 2,
  });

  // Use real data if available, fallback to mock data
  const metrics = dashboardData?.data?.data?.summary || mockMetrics;
  const campaigns = campaignsData?.data?.data || mockCampaigns;
  
  // Helper function to safely get metric values
  const getMetricValue = (key: string) => {
    return (metrics as any)[key] || 0;
  };
  
  const isLoading = isDashboardLoading || isCampaignsLoading;
  const hasError = dashboardError || campaignsError;

  const handleRefresh = () => {
    refetchDashboard();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
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

      {/* Error Alert */}
      {hasError && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to load data. Using cached data. Please check your connection.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Spend */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${getMetricValue('total_spend') || getMetricValue('totalSpend') || 0}</div>
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
            <div className="text-2xl font-bold text-card-foreground">${(getMetricValue('average_cpi') || getMetricValue('averageCPI') || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Cost per install</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Active Apps */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Apps</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{getMetricValue('activeApps') || 0}</div>
            <p className="text-xs text-muted-foreground">In portfolio</p>
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
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCampaigns.map((campaign, index) => (
                <TableRow key={index} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">
                    <div className="max-w-[200px] truncate">
                      <span className="text-foreground">{campaign.campaignName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{campaign.appName}</TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{campaign.flag}</span>
                      <span>{campaign.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{campaign.date}</TableCell>
                  <TableCell className="text-foreground font-semibold">{campaign.spend}</TableCell>
                  <TableCell className="text-foreground">{campaign.installs.toLocaleString()}</TableCell>
                  <TableCell className="text-foreground">{campaign.cpi}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={
                        campaign.status === "ACTIVE" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        campaign.status === "PAUSED" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        campaign.status === "TESTING" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}