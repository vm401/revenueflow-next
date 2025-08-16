import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, FileSpreadsheet, Printer, Mail, Eye, Loader2, RefreshCw, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { api, type CampaignData } from "@/lib/api";
import { format } from "date-fns";

const mockCampaigns = [
  {
    id: 1,
    name: "Summer Mobile Game Campaign",
    app: "Puzzle Adventure",
    country: "US",
    date: "2024-01-15",
    spend: 1250.75,
    installs: 156,
    cpi: 8.02,
    status: "Active"
  },
  {
    id: 2,
    name: "Holiday Shopping App",
    app: "ShopEasy",
    country: "CA",
    date: "2024-01-14",
    spend: 890.50,
    installs: 98,
    cpi: 9.09,
    status: "Paused"
  },
  {
    id: 3,
    name: "Fitness Tracker Promo",
    app: "FitLife Pro",
    country: "UK",
    date: "2024-01-13",
    spend: 2150.25,
    installs: 245,
    cpi: 8.78,
    status: "Active"
  }
];

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedApp, setSelectedApp] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  // Fetch campaigns with filters
  const { 
    data: campaignsResponse, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['campaigns', searchTerm, selectedCountry, selectedApp, sortBy, sortOrder],
    queryFn: () => api.getCampaigns({
      search: searchTerm || undefined,
      country: selectedCountry !== "all" ? selectedCountry : undefined,
      app_name: selectedApp !== "all" ? selectedApp : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      limit: 100
    }),
    refetchInterval: 30000,
    retry: 2,
  });

  // Fetch available countries for filter
  const { data: countriesResponse } = useQuery({
    queryKey: ['available-countries'],
    queryFn: api.getAvailableCountries,
    retry: 2,
  });

  // Fetch available apps for filter
  const { data: appsResponse } = useQuery({
    queryKey: ['available-apps'],
    queryFn: api.getAvailableApps,
    retry: 2,
  });

  const campaigns = campaignsResponse?.data?.data || [];
  const countries = countriesResponse?.data?.data || [];
  const apps = appsResponse?.data?.data || [];

  // Fallback to mock data if API fails
  const displayCampaigns = campaigns.length > 0 ? campaigns : mockCampaigns;

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting campaigns to ${format.toUpperCase()}...`,
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleEmailReport = () => {
    toast({
      title: "Email Report",
      description: "Email functionality will be available soon",
    });
  };

  const handleRowClick = (campaign: CampaignData | any) => {
    setSelectedCampaign(campaign);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Data",
      description: "Updating campaign data...",
    });
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const formatNumber = (num: number) => num.toLocaleString('en-US');

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (statusLower === 'paused') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (statusLower === 'testing') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage and analyze your advertising campaigns
            </p>
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

        {/* Error Alert */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                Failed to load campaigns. Using cached data. Please check your connection.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter campaigns by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country: string) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger>
                  <SelectValue placeholder="Select app" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Apps</SelectItem>
                  {apps.map((app: string) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export & Reports</CardTitle>
            <CardDescription>Export filtered data and generate reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <Button variant="outline" onClick={handlePrintReport}>
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" onClick={handleEmailReport}>
                <Mail className="w-4 h-4 mr-2" />
                Email Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Data</CardTitle>
            <CardDescription>
              {displayCampaigns.length} campaigns found
              {isLoading && " (loading...)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('campaign_name')}
                  >
                    Campaign Name
                    {sortBy === 'campaign_name' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('app_name')}
                  >
                    App
                    {sortBy === 'app_name' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('country')}
                  >
                    Country
                    {sortBy === 'country' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('date')}
                  >
                    Date
                    {sortBy === 'date' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('spend')}
                  >
                    Spend
                    {sortBy === 'spend' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('installs')}
                  >
                    Installs
                    {sortBy === 'installs' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('cpi')}
                  >
                    CPI
                    {sortBy === 'cpi' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading campaigns...</p>
                    </TableCell>
                  </TableRow>
                ) : displayCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <p className="text-muted-foreground">No campaigns found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayCampaigns.map((campaign: any) => (
                    <TableRow 
                      key={campaign.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(campaign)}
                    >
                      <TableCell className="font-medium">
                        {campaign.campaign_name || campaign.name}
                      </TableCell>
                      <TableCell>{campaign.app_name || campaign.app}</TableCell>
                      <TableCell>{campaign.country}</TableCell>
                      <TableCell>
                        {campaign.date ? format(new Date(campaign.date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(campaign.spend)}
                      </TableCell>
                      <TableCell>{formatNumber(campaign.installs)}</TableCell>
                      <TableCell>{formatCurrency(campaign.cpi)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(campaign.status || 'Active')}>
                          {campaign.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Campaign Details Modal would go here */}
        {selectedCampaign && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details: {selectedCampaign.name}</CardTitle>
              <CardDescription>Detailed information about the selected campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p><strong>App:</strong> {selectedCampaign.app}</p>
                  <p><strong>Country:</strong> {selectedCampaign.country}</p>
                  <p><strong>Date:</strong> {selectedCampaign.date}</p>
                  <p><strong>Status:</strong> {selectedCampaign.status}</p>
                </div>
                <div>
                  <p><strong>Spend:</strong> ${selectedCampaign.spend.toFixed(2)}</p>
                  <p><strong>Installs:</strong> {selectedCampaign.installs}</p>
                  <p><strong>CPI:</strong> ${selectedCampaign.cpi.toFixed(2)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSelectedCampaign(null)}
              >
                Close Details
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}