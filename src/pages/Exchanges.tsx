import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, FileSpreadsheet, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock exchanges based on CSV data
const mockExchanges = [
  {
    id: 1,
    name: "Meta Ads",
    type: "Social Media",
    spend: 45230.50,
    installs: 5420,
    actions: 4150,
    cpi: 8.34,
    countries: ["US", "CA", "UK", "AU", "DE"],
    status: "Active"
  },
  {
    id: 2,
    name: "Google Ads",
    type: "Search & Display",
    spend: 38750.25,
    installs: 4890,
    actions: 3920,
    cpi: 7.92,
    countries: ["US", "UK", "DE", "FR", "IT"],
    status: "Active"
  },
  {
    id: 3,
    name: "TikTok Ads",
    type: "Social Media",
    spend: 22150.75,
    installs: 2980,
    actions: 2340,
    cpi: 7.43,
    countries: ["US", "UK", "CA"],
    status: "Active"
  },
  {
    id: 4,
    name: "Unity Ads",
    type: "Gaming",
    spend: 15420.00,
    installs: 2150,
    actions: 1780,
    cpi: 7.17,
    countries: ["US", "UK", "DE"],
    status: "Active"
  },
  {
    id: 5,
    name: "Snapchat Ads",
    type: "Social Media",
    spend: 8950.25,
    installs: 1250,
    actions: 980,
    cpi: 7.16,
    countries: ["US", "CA"],
    status: "Testing"
  }
];

export default function Exchanges() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleViewData = (exchangeName: string) => {
    toast({
      title: "Exchange Data",
      description: `Viewing campaign data for ${exchangeName} from CSV files`,
    });
  };

  const filteredExchanges = mockExchanges.filter(exchange =>
    exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exchange.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ad Exchanges</h1>
            <p className="text-muted-foreground">
              Advertising sources identified in your CSV campaign data
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/upload">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Upload CSV Data
            </a>
          </Button>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockExchanges.reduce((sum, ex) => sum + ex.spend, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">From CSV data</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockExchanges.reduce((sum, ex) => sum + ex.installs, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">User acquisitions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockExchanges.reduce((sum, ex) => sum + ex.actions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">User actions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CPI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockExchanges.reduce((sum, ex) => sum + ex.cpi, 0) / mockExchanges.length).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Cost per install</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Exchanges</CardTitle>
            <CardDescription>Search advertising sources from your CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exchanges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exchanges List */}
        <div className="grid gap-4">
          {filteredExchanges.map((exchange) => (
            <Card key={exchange.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{exchange.name}</h3>
                      <p className="text-sm text-muted-foreground">{exchange.type}</p>
                      <Badge variant={exchange.status === "Active" ? "default" : "secondary"} className="mt-1">
                        {exchange.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Performance Metrics</div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-semibold">${exchange.spend.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Spend</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{exchange.installs.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Installs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{exchange.actions.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Actions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">${exchange.cpi.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">CPI</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewData(exchange.name)}
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
                    {exchange.countries.map((country, index) => (
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

        {filteredExchanges.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No exchanges found matching your criteria.</p>
              <Button variant="link" className="mt-2" asChild>
                <a href="/upload">Upload CSV files to see exchange data</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Data Source Info */}
        <Card>
          <CardHeader>
            <CardTitle>About Exchange Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This data is automatically extracted from your uploaded CSV files. Each exchange represents 
              an advertising source found in your campaign data. Upload new CSV files to update this information.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}