import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/AnimatedCard";
import { AnimatedButton } from "@/components/AnimatedButton";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, FileSpreadsheet, Printer, Eye, Loader2, Calendar, ChevronDown, AlertTriangle, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUltraData } from "@/contexts/UltraDataContext";
import { format } from "date-fns";
import { CampaignsTable } from "@/components/CampaignsTable";

export default function Campaigns() {
  const { data, getFilteredCampaigns, exportData, getDateRange } = useUltraData();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedApp, setSelectedApp] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Get unique values for filters
  const countries = useMemo(() => {
    if (!data?.campaigns) return [];
    const uniqueCountries = new Set(data.campaigns.map(c => c.country).filter(Boolean));
    return Array.from(uniqueCountries).sort();
  }, [data?.campaigns]);

  const apps = useMemo(() => {
    if (!data?.apps) return [];
    return data.apps.map(a => a.name).sort();
  }, [data?.apps]);

  const exchanges = useMemo(() => {
    if (!data?.exchanges) return [];
    return data.exchanges.map(e => e.name).sort();
  }, [data?.exchanges]);

  // Get filtered campaigns with all metrics
  const filteredCampaigns = useMemo(() => {
    if (!data?.campaigns) return [];

    return getFilteredCampaigns(
      searchTerm,
      selectedCountry,
      selectedApp,
      dateFrom,
      dateTo,
      selectedExchange
    ).map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      app: campaign.app,
      exchange: campaign.exchange,
      status: campaign.status as 'active' | 'paused' | 'ended',
      spend: campaign.spend,
      installs: campaign.installs,
      actions: campaign.actions || 0,
      avgCPI: campaign.avgCPI,
      avgCPA: campaign.avgCPA || 0,
      avgCTR: campaign.avgCTR,
      avgCPC: campaign.avgCPC,
      creatives: campaign.creatives || 0,
    }));
  }, [data?.campaigns, getFilteredCampaigns, searchTerm, selectedCountry, selectedApp, dateFrom, dateTo, selectedExchange]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalSpend = filteredCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalInstalls = filteredCampaigns.reduce((sum, c) => sum + c.installs, 0);
    const totalActions = filteredCampaigns.reduce((sum, c) => sum + c.actions, 0);
    const avgCPI = totalInstalls > 0 ? totalSpend / totalInstalls : 0;
    const avgCPA = totalActions > 0 ? totalSpend / totalActions : 0;

    return {
      totalCampaigns: filteredCampaigns.length,
      totalSpend,
      totalInstalls,
      totalActions,
      avgCPI,
      avgCPA,
    };
  }, [filteredCampaigns]);

  const dateRange = getDateRange();

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      const success = await exportData('campaigns', format, {
        searchTerm,
        country: selectedCountry,
        app: selectedApp,
        dateFrom,
        dateTo,
        exchange: selectedExchange
      });
      
      if (success) {
        toast({
          title: "Export successful",
          description: `Campaigns data exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              🚀 Modern TanStack Table with CPA metrics
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AnimatedButton variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </AnimatedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <Printer className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <AnimatedButton>
              <Eye className="mr-2 h-4 w-4" />
              View Report
            </AnimatedButton>
          </div>
        </div>

        {/* Date Range Info */}
        {dateRange && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Data range: {format(new Date(dateRange.start), 'MMM dd, yyyy')} - {format(new Date(dateRange.end), 'MMM dd, yyyy')}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <AnimatedCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <AnimatedIcon>
                <Database className="h-4 w-4 text-muted-foreground" />
              </AnimatedIcon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns.toLocaleString()}</div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <AnimatedIcon>
                <Database className="h-4 w-4 text-muted-foreground" />
              </AnimatedIcon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${stats.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <AnimatedIcon>
                <Database className="h-4 w-4 text-muted-foreground" />
              </AnimatedIcon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalInstalls.toLocaleString()}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <AnimatedIcon>
                <Database className="h-4 w-4 text-muted-foreground" />
              </AnimatedIcon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalActions.toLocaleString()}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CPI</CardTitle>
              <AnimatedIcon>
                <Database className="h-4 w-4 text-muted-foreground" />
              </AnimatedIcon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.avgCPI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CPA</CardTitle>
              <AnimatedIcon>
                <Database className="h-4 w-4 text-muted-foreground" />
              </AnimatedIcon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.avgCPA.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Filters */}
        <AnimatedCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter campaigns by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">App</label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="All apps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Apps</SelectItem>
                    {apps.map((app) => (
                      <SelectItem key={app} value={app}>{app}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Exchange</label>
                <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All exchanges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exchanges</SelectItem>
                    {exchanges.map((exchange) => (
                      <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Data Status */}
        {!data?.campaigns?.length ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No campaign data available. Please upload CSV files to view campaigns.
            </AlertDescription>
          </Alert>
        ) : (
          /* Modern TanStack Table */
          <AnimatedCard>
            <CardHeader>
              <CardTitle>🚀 Modern Campaigns Table</CardTitle>
              <CardDescription>
                {filteredCampaigns.length} campaigns found • Powered by TanStack Table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignsTable data={filteredCampaigns} />
            </CardContent>
          </AnimatedCard>
        )}
      </div>
    </Layout>
  );
}
