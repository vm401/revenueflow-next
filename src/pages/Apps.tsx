import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Smartphone, Tablet, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock apps based on real CSV campaign data
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
    exchanges: ["Meta Ads", "Google Ads", "Unity Ads"],
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
    exchanges: ["Google Ads", "TikTok Ads"],
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
    exchanges: ["Meta Ads", "Snapchat Ads"],
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
    exchanges: ["Google Ads", "Meta Ads"],
    status: "Active"
  },
  {
    id: 5,
    name: "PhotoEditor Pro",
    bundleId: "com.photo.editor",
    platform: "iOS",
    category: "Photography",
    totalSpend: 8950.25,
    totalInstalls: 1150,
    totalActions: 890,
    avgCPI: 7.78,
    activeCampaigns: 3,
    countries: ["US", "CA"],
    exchanges: ["Meta Ads", "TikTok Ads"],
    status: "Testing"
  }
];

export default function Apps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const handleAppClick = (app: any) => {
    toast({
      title: "App Performance",
      description: `Viewing advertising performance for ${app.name}`,
    });
  };

  const filteredApps = mockApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.bundleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || app.platform.toLowerCase() === selectedPlatform;
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Apps</h1>
            <p className="text-muted-foreground">
              Track advertising performance across your mobile applications
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Filter apps by platform, category, or search by name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
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
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Games">Games</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Apps Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <Card 
              key={app.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleAppClick(app)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {app.platform === "iOS" ? (
                        <Smartphone className="w-6 h-6 text-primary" />
                      ) : (
                        <Tablet className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{app.bundleId}</p>
                    </div>
                  </div>
                  <Badge variant={app.status === "Active" ? "default" : "secondary"}>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{app.platform}</Badge>
                  <Badge variant="outline">{app.category}</Badge>
                </div>
                
                {/* Advertising Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spend</p>
                    <p className="text-lg font-semibold">${app.totalSpend.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Installs</p>
                    <p className="text-lg font-semibold">{app.totalInstalls.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Actions</p>
                    <p className="text-lg font-semibold">{app.totalActions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg CPI</p>
                    <p className="text-lg font-semibold">${app.avgCPI.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Countries & Exchanges */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Countries</p>
                    <div className="flex flex-wrap gap-1">
                      {app.countries.slice(0, 3).map((country) => (
                        <Badge key={country} variant="outline" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                      {app.countries.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{app.countries.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Exchanges</p>
                    <div className="flex flex-wrap gap-1">
                      {app.exchanges.map((exchange) => (
                        <Badge key={exchange} variant="secondary" className="text-xs">
                          {exchange}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Campaigns
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Advertising Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Advertising Performance Summary</CardTitle>
            <CardDescription>Overview of all app advertising metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{mockApps.length}</p>
                <p className="text-sm text-muted-foreground">Total Apps</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${mockApps.reduce((sum, app) => sum + app.totalSpend, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Spend</p>
              </div>
              <div className="text-center">
                  <p className="text-2xl font-bold">
                    {mockApps.reduce((sum, app) => sum + app.totalInstalls, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Installs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {mockApps.reduce((sum, app) => sum + app.totalActions, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    ${(mockApps.reduce((sum, app) => sum + app.avgCPI, 0) / mockApps.length).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg CPI</p>
                </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </Layout>
  );
}