import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Smartphone, TrendingUp, FileSpreadsheet, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock apps based on CSV campaign data
const mockApps = [
  {
    id: 1,
    name: "Puzzle Adventure Pro",
    bundleId: "com.gamedev.puzzle",
    platform: "iOS",
    category: "Games",
    totalSpend: 24850.75,
    totalInstalls: 3120,
    totalActions: 2340,
    avgCPI: 7.96,
    activeCampaigns: 12,
    countries: ["US", "CA", "UK", "AU"],
    status: "Active"
  },
  {
    id: 2,
    name: "ShopEasy Mobile",
    bundleId: "com.retail.shopeasy",
    platform: "Android", 
    category: "Shopping",
    totalSpend: 18750.25,
    totalInstalls: 2245,
    totalActions: 1890,
    avgCPI: 8.35,
    activeCampaigns: 8,
    countries: ["US", "UK", "DE", "FR"],
    status: "Active"
  },
  {
    id: 3,
    name: "FitLife Tracker",
    bundleId: "com.health.fitlife",
    platform: "iOS",
    category: "Health & Fitness",
    totalSpend: 31230.50,
    totalInstalls: 3890,
    totalActions: 2950,
    avgCPI: 8.03,
    activeCampaigns: 5,
    countries: ["US", "CA", "UK"],
    status: "Active"
  },
  {
    id: 4,
    name: "TravelGuide Plus",
    bundleId: "com.travel.guide",
    platform: "Android",
    category: "Travel",
    totalSpend: 12450.00,
    totalInstalls: 1580,
    totalActions: 1120,
    avgCPI: 7.88,
    activeCampaigns: 6,
    countries: ["US", "UK", "IT", "ES"],
    status: "Active"
  }
];

export default function Apps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const { toast } = useToast();

  const handleViewCampaigns = (appName: string) => {
    toast({
      title: "App Campaigns",
      description: `Viewing campaigns for ${appName} from CSV data`,
    });
  };

  const filteredApps = mockApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.bundleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || app.platform.toLowerCase() === selectedPlatform;
    
    return matchesSearch && matchesPlatform;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Apps</h1>
            <p className="text-muted-foreground">
              Mobile applications found in your CSV campaign data
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/upload">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Upload CSV Data
            </a>
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Apps in Data</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockApps.length}</div>
              <p className="text-xs text-muted-foreground">From CSV files</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockApps.reduce((sum, app) => sum + app.totalSpend, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockApps.reduce((sum, app) => sum + app.activeCampaigns, 0)}
              </div>
              <p className="text-xs text-muted-foreground">From CSV data</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Apps</CardTitle>
            <CardDescription>Search and filter apps from your CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Apps List */}
        <div className="grid gap-4">
          {filteredApps.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{app.name}</h3>
                      <p className="text-sm text-muted-foreground">{app.bundleId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{app.platform}</Badge>
                        <Badge variant={app.status === "Active" ? "default" : "secondary"}>
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Campaign Performance</div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold">${app.totalSpend.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Spend</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{app.totalInstalls.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Installs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${app.avgCPI.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Avg CPI</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{app.activeCampaigns}</div>
                        <div className="text-xs text-muted-foreground">Campaigns</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCampaigns(app.name)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Campaigns
                    </Button>
                  </div>
                </div>

                {/* Countries */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active Countries:</span>
                    {app.countries.map((country, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No apps found matching your criteria.</p>
              <Button variant="link" className="mt-2" asChild>
                <a href="/upload">Upload CSV files to see app data</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}