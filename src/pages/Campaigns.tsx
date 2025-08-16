import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, FileSpreadsheet, Printer, Mail, Eye, Loader2, RefreshCw, Calendar, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, AlertTriangle, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";

export default function Campaigns() {
  const { data, getFilteredCampaigns, exportData } = useData();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedApp, setSelectedApp] = useState("all");
  const [sortBy, setSortBy] = useState<'date' | 'spend' | 'installs' | 'cpi'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Get filtered campaigns
  const campaigns = useMemo(() => {
    return getFilteredCampaigns({
      search: searchTerm,
      country: selectedCountry,
      app: selectedApp,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize
    });
  }, [searchTerm, selectedCountry, selectedApp, sortBy, sortOrder, currentPage, getFilteredCampaigns]);

  // Get total count for pagination
  const totalCampaigns = data?.campaigns?.length || 0;
  const totalPages = Math.ceil(totalCampaigns / pageSize);

  // Get unique countries and apps for filters
  const countries = useMemo(() => {
    if (!data?.campaigns) return [];
    const uniqueCountries = new Set<string>();
    data.campaigns.forEach(campaign => {
      campaign.countries.forEach(country => uniqueCountries.add(country));
    });
    return Array.from(uniqueCountries).sort();
  }, [data?.campaigns]);

  const apps = useMemo(() => {
    if (!data?.campaigns) return [];
    const uniqueApps = new Set(data.campaigns.map(c => c.targetApp));
    return Array.from(uniqueApps).sort();
  }, [data?.campaigns]);

  // Handle sorting
  const handleSort = (column: 'date' | 'spend' | 'installs' | 'cpi') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    exportData(format);
    toast({
      title: "Export Started",
      description: `Exporting campaigns data as ${format.toUpperCase()}`,
    });
  };

  // Country flags
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸', 'UK': '🇬🇧', 'DE': '🇩🇪', 'CA': '🇨🇦', 'AU': '🇦🇺',
      'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'JP': '🇯🇵', 'KR': '🇰🇷',
      'FRA': '🇫🇷', 'GRC': '🇬🇷', 'GBR': '🇬🇧', 'USA': '🇺🇸', 'CAN': '🇨🇦',
      'AUS': '🇦🇺', 'DEU': '🇩🇪', 'ITA': '🇮🇹', 'ESP': '🇪🇸'
    };
    return flags[country] || '🌍';
  };

  // Render sort icon
  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage and analyze your advertising campaigns
            </p>
          </div>
          {data && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Database className="h-3 w-3 mr-1" />
              CSV Data Active
            </Badge>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter campaigns by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {getCountryFlag(country)} {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Apps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Apps</SelectItem>
                  {apps.map((app) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Export & Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Export & Reports</CardTitle>
            <CardDescription>Export filtered data and generate reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')}
                disabled={!data}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('json')}
                disabled={!data}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Data */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Data</CardTitle>
            <CardDescription>
              {data ? `${totalCampaigns} campaigns found` : 'No CSV data loaded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No CSV data loaded. Please upload your campaign files to see data here.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('date')}
                            className="h-auto p-0 font-semibold"
                          >
                            Campaign Name
                            <SortIcon column="name" />
                          </Button>
                        </TableHead>
                        <TableHead>Target App</TableHead>
                        <TableHead>Countries</TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('date')}
                            className="h-auto p-0 font-semibold"
                          >
                            Date
                            <SortIcon column="date" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('spend')}
                            className="h-auto p-0 font-semibold"
                          >
                            Spend
                            <SortIcon column="spend" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('installs')}
                            className="h-auto p-0 font-semibold"
                          >
                            Installs
                            <SortIcon column="installs" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort('cpi')}
                            className="h-auto p-0 font-semibold"
                          >
                            CPI
                            <SortIcon column="cpi" />
                          </Button>
                        </TableHead>
                        <TableHead>CTR</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            No campaigns found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        campaigns.map((campaign, index) => (
                          <TableRow key={campaign.id || index}>
                            <TableCell className="font-medium">
                              <div className="max-w-[200px] truncate">
                                {campaign.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                ID: {campaign.campaignId}
                              </div>
                            </TableCell>
                            <TableCell>{campaign.targetApp}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {campaign.countries.slice(0, 2).map(country => (
                                  <div key={country} className="flex items-center gap-1">
                                    <span>{getCountryFlag(country)}</span>
                                    <span className="text-xs">{country}</span>
                                  </div>
                                ))}
                                {campaign.countries.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{campaign.countries.length - 2} more
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {campaign.startDate ? format(new Date(campaign.startDate), 'MMM dd, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ${campaign.totalSpend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </TableCell>
                            <TableCell className="text-right">
                              {campaign.totalInstalls.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${campaign.cpi.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </TableCell>
                            <TableCell>
                              {campaign.ctr.toFixed(2)}%
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary" 
                                className={
                                  campaign.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                                  campaign.status === "paused" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                                  "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }
                              >
                                {campaign.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Creatives
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNumber)}
                                isActive={currentPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}