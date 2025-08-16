import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, FileSpreadsheet, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock inventory based on CSV data
const mockInventory = [
  {
    id: 1,
    name: "Premium Gaming Inventory",
    source: "Meta Ads",
    type: "Social Media",
    spend: 28450.75,
    installs: 3420,
    actions: 2890,
    cpi: 8.32,
    countries: ["US", "CA", "UK"],
    quality: "High",
    fraudRate: 2.1
  },
  {
    id: 2,
    name: "Search Network Inventory",
    source: "Google Ads",
    type: "Search",
    spend: 22150.50,
    installs: 2890,
    actions: 2340,
    cpi: 7.66,
    countries: ["US", "UK", "DE", "FR"],
    quality: "High",
    fraudRate: 1.8
  },
  {
    id: 3,
    name: "Video Content Inventory",
    source: "TikTok Ads",
    type: "Video",
    spend: 18750.25,
    installs: 2450,
    actions: 1980,
    cpi: 7.65,
    countries: ["US", "UK", "CA"],
    quality: "Medium",
    fraudRate: 3.2
  },
  {
    id: 4,
    name: "In-App Gaming Inventory",
    source: "Unity Ads",
    type: "Gaming",
    spend: 15420.00,
    installs: 2150,
    actions: 1780,
    cpi: 7.17,
    countries: ["US", "UK", "DE"],
    quality: "High",
    fraudRate: 2.5
  },
  {
    id: 5,
    name: "Social Stories Inventory",
    source: "Snapchat Ads",
    type: "Social Media",
    spend: 8950.25,
    installs: 1250,
    actions: 980,
    cpi: 7.16,
    countries: ["US", "CA"],
    quality: "Medium",
    fraudRate: 4.1
  }
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleViewData = (inventoryName: string) => {
    toast({
      title: "Inventory Data",
      description: `Viewing data for ${inventoryName} from CSV files`,
    });
  };

  const filteredInventory = mockInventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "High": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory Sources</h1>
            <p className="text-muted-foreground">
              Traffic sources and inventory quality from your CSV campaign data
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/upload">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Upload CSV Data
            </a>
          </Button>
        </div>

        {/* Overview Metrics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockInventory.length}</div>
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
                ${mockInventory.reduce((sum, item) => sum + item.spend, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all sources</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockInventory.reduce((sum, item) => sum + item.installs, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">User acquisitions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CPI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockInventory.reduce((sum, item) => sum + item.cpi, 0) / mockInventory.length).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Cost per install</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Inventory</CardTitle>
            <CardDescription>Search traffic sources from your CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory List */}
        <div className="grid gap-4">
          {filteredInventory.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.source} • {item.type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getQualityColor(item.quality)}>
                          {item.quality} Quality
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.fraudRate}% Fraud Rate
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Performance Metrics</div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold">${item.spend.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Spend</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{item.installs.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Installs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{item.actions.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Actions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${item.cpi.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">CPI</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewData(item.name)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Data
                    </Button>
                  </div>
                </div>

                {/* Active Countries */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active Countries:</span>
                    {item.countries.map((country, index) => (
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

        {filteredInventory.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No inventory sources found matching your criteria.</p>
              <Button variant="link" className="mt-2" asChild>
                <a href="/upload">Upload CSV files to see inventory data</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quality Analysis Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Inventory Quality Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>High Quality:</strong> CPI below $8.00, action rate above 70%, fraud rate below 3%</p>
              <p><strong>Medium Quality:</strong> CPI $8.00-$10.00, action rate 50-70%, fraud rate 3-5%</p>
              <p><strong>Low Quality:</strong> CPI above $10.00, action rate below 50%, fraud rate above 5%</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Quality metrics are automatically calculated from your CSV campaign data.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}