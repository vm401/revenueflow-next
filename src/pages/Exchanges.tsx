import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, RefreshCw, TrendingUp, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock exchanges based on real CSV data structure
const mockExchanges = [
  {
    id: 1,
    name: "Meta Ads (Facebook)",
    status: "Active",
    integration: "Connected",
    spend: 24850.75,
    installs: 3120,
    cpi: 7.96,
    actions: 2340,
    countries: ["US", "CA", "UK"],
    lastSync: "2025-01-15 10:30"
  },
  {
    id: 2,
    name: "Google Ads",
    status: "Active", 
    integration: "Connected",
    spend: 18750.25,
    installs: 2245,
    cpi: 8.35,
    actions: 1890,
    countries: ["US", "AU", "DE"],
    lastSync: "2025-01-15 10:25"
  },
  {
    id: 3,
    name: "Unity Ads",
    status: "Paused",
    integration: "Connected",
    spend: 12230.50,
    installs: 1520,
    cpi: 8.04,
    actions: 1120,
    countries: ["US", "JP", "KR"],
    lastSync: "2025-01-14 15:20"
  },
  {
    id: 4,
    name: "TikTok Ads",
    status: "Active",
    integration: "Connected",
    spend: 9450.00,
    installs: 1180,
    cpi: 8.01,
    actions: 890,
    countries: ["US", "UK", "FR"],
    lastSync: "2025-01-15 09:15"
  },
  {
    id: 5,
    name: "Snapchat Ads",
    status: "Testing",
    integration: "Connected",
    spend: 3250.00,
    installs: 420,
    cpi: 7.74,
    actions: 315,
    countries: ["US", "CA"],
    lastSync: "2025-01-15 08:45"
  }
];

export default function Exchanges() {
  const [exchanges, setExchanges] = useState(mockExchanges);
  const { toast } = useToast();

  const handleAddExchange = () => {
    toast({
      title: "Add Exchange",
      description: "Exchange addition functionality will be available soon",
    });
  };

  const handleConfigure = (exchangeName: string) => {
    toast({
      title: "Configure Integration",
      description: `Opening configuration for ${exchangeName}`,
    });
  };

  const handleSync = (exchangeName: string) => {
    toast({
      title: "Syncing Data",
      description: `Synchronizing data from ${exchangeName}...`,
    });
  };

  const handleStatusToggle = (id: number) => {
    setExchanges(prev => prev.map(exchange => 
      exchange.id === id 
        ? { ...exchange, status: exchange.status === "Active" ? "Paused" : "Active" }
        : exchange
    ));
    
    const exchange = exchanges.find(ex => ex.id === id);
    toast({
      title: "Status Updated",
      description: `${exchange?.name} is now ${exchange?.status === "Active" ? "Paused" : "Active"}`,
    });
  };

  const getIntegrationBadgeVariant = (integration: string) => {
    switch (integration) {
      case "Connected": return "default";
      case "Error": return "destructive";
      default: return "secondary";
    }
  };

  const totalSpend = exchanges.reduce((sum, ex) => sum + ex.spend, 0);
  const totalInstalls = exchanges.reduce((sum, ex) => sum + ex.installs, 0);
  const totalActions = exchanges.reduce((sum, ex) => sum + ex.actions, 0);
  const avgCPI = totalSpend / totalInstalls;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ad Exchanges</h1>
            <p className="text-muted-foreground">
              Monitor performance across different advertising exchanges
            </p>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpend.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all exchanges</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInstalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total app installs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Post-install actions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgCPI.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Cost per install</p>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {exchanges.map((exchange) => (
            <Card key={exchange.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{exchange.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Last sync: {exchange.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getIntegrationBadgeVariant(exchange.integration)}>
                      {exchange.integration}
                    </Badge>
                    <Switch 
                      checked={exchange.status === "Active"}
                      onCheckedChange={() => handleStatusToggle(exchange.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Spend</p>
                    <p className="text-lg font-semibold">${exchange.spend.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Installs</p>
                    <p className="text-lg font-semibold">{exchange.installs.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actions</p>
                    <p className="text-lg font-semibold">{exchange.actions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPI</p>
                    <p className="text-lg font-semibold">${exchange.cpi.toFixed(2)}</p>
                  </div>
                </div>
                
                {/* Countries */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Active Countries</p>
                  <div className="flex flex-wrap gap-1">
                    {exchange.countries.map((country) => (
                      <Badge key={country} variant="outline" className="text-xs">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleConfigure(exchange.name)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSync(exchange.name)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Sources Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Information about advertising exchange data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Available Exchanges</h4>
                <ul className="text-sm space-y-1">
                  <li>• Google Ads - Search & Display campaigns</li>
                  <li>• Facebook Ads - Social media advertising</li>
                  <li>• Unity Ads - Mobile game advertising</li>
                  <li>• AdMob - Mobile app monetization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Updates</h4>
                <ul className="text-sm space-y-1">
                  <li>• Data refreshed every 4 hours</li>
                  <li>• Manual sync available anytime</li>
                  <li>• Historical data up to 90 days</li>
                  <li>• Real-time spend monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Compare metrics across different ad exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exchanges.map((exchange) => (
                <div key={exchange.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{exchange.name}</span>
                    <Badge variant={exchange.status === "Active" ? "default" : "secondary"}>
                      {exchange.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Spend</p>
                      <p className="font-medium">${exchange.spend.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">CPI</p>
                      <p className="font-medium">${exchange.cpi.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Installs</p>
                      <p className="font-medium">{exchange.installs.toLocaleString()}</p>
                    </div>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(exchange.spend / totalSpend) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}