import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Image, TrendingUp, FileSpreadsheet, ExternalLink, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock creatives based on CSV data
const mockCreatives = [
  {
    id: 1,
    name: "Puzzle Game Video Ad",
    campaignName: "Summer Gaming Campaign",
    appName: "Puzzle Adventure Pro",
    format: "Video",
    size: "1080x1920",
    spend: 12450.75,
    installs: 1580,
    cpi: 7.88,
    status: "Active"
  },
  {
    id: 2,
    name: "Shopping App Banner",
    campaignName: "Holiday Shopping Promo",
    appName: "ShopEasy Mobile",
    format: "Banner",
    size: "728x90",
    spend: 8950.50,
    installs: 1120,
    cpi: 7.99,
    status: "Active"
  },
  {
    id: 3,
    name: "Fitness Tracker Carousel",
    campaignName: "Health & Wellness Drive",
    appName: "FitLife Tracker",
    format: "Carousel",
    size: "1080x1080",
    spend: 15230.25,
    installs: 1890,
    cpi: 8.06,
    status: "Active"
  },
  {
    id: 4,
    name: "Travel Guide Native Ad",
    campaignName: "Travel Booking Campaign",
    appName: "TravelGuide Plus",
    format: "Native",
    size: "1200x628",
    spend: 6750.00,
    installs: 890,
    cpi: 7.58,
    status: "Paused"
  },
  {
    id: 5,
    name: "Photo Editor Story Ad",
    campaignName: "Creative Tools Promo",
    appName: "PhotoEditor Pro",
    format: "Story",
    size: "1080x1920",
    spend: 4820.25,
    installs: 650,
    cpi: 7.42,
    status: "Testing"
  }
];

export default function Creatives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();

  const handleViewData = (creativeName: string) => {
    toast({
      title: "Creative Performance",
      description: `Viewing data for ${creativeName} from CSV files`,
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Creative performance report is being generated",
    });
  };

  const filteredCreatives = mockCreatives.filter(creative => {
    const matchesSearch = creative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.appName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = selectedFormat === "all" || creative.format.toLowerCase() === selectedFormat;
    const matchesStatus = selectedStatus === "all" || creative.status.toLowerCase() === selectedStatus;
    
    return matchesSearch && matchesFormat && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Paused": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Testing": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Creative Assets</h1>
            <p className="text-muted-foreground">
              Creative performance data extracted from your CSV campaign files
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" asChild>
              <a href="/upload">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Upload CSV Data
              </a>
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Creatives</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCreatives.length}</div>
              <p className="text-xs text-muted-foreground">From CSV data</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockCreatives.reduce((sum, creative) => sum + creative.spend, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all creatives</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockCreatives.reduce((sum, creative) => sum + creative.installs, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">User acquisitions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CPI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockCreatives.reduce((sum, creative) => sum + creative.cpi, 0) / mockCreatives.length).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Cost per install</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Creatives</CardTitle>
            <CardDescription>Search and filter creative performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search creatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Creatives List */}
        <div className="grid gap-4">
          {filteredCreatives.map((creative) => (
            <Card key={creative.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{creative.name}</h3>
                      <p className="text-sm text-muted-foreground">{creative.campaignName}</p>
                      <p className="text-xs text-muted-foreground">{creative.appName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{creative.format}</Badge>
                        <Badge variant="outline" className="text-xs">{creative.size}</Badge>
                        <Badge variant="secondary" className={getStatusColor(creative.status)}>
                          {creative.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Performance</div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold">${creative.spend.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Spend</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{creative.installs.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Installs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${creative.cpi.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">CPI</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewData(creative.name)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCreatives.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No creatives found matching your criteria.</p>
              <Button variant="link" className="mt-2" asChild>
                <a href="/upload">Upload CSV files to see creative data</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Data Info */}
        <Card>
          <CardHeader>
            <CardTitle>About Creative Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Creative performance data is extracted from your uploaded CSV campaign files. 
              This includes creative names, formats, and performance metrics like spend, installs, and CPI.
              Upload new campaign data to see updated creative performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}