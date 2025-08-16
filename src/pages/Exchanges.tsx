import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, RefreshCw, TrendingUp, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockExchanges = [
  {
    id: 1,
    name: "Google Ads",
    status: "Active",
    integration: "Connected",
    spend: 15420.75,
    impressions: 2450000,
    clicks: 34580,
    ctr: 1.41,
    lastSync: "2024-01-15 10:30"
  },
  {
    id: 2,
    name: "Facebook Ads",
    status: "Active", 
    integration: "Connected",
    spend: 12850.25,
    impressions: 1980000,
    clicks: 28450,
    ctr: 1.44,
    lastSync: "2024-01-15 10:25"
  },
  {
    id: 3,
    name: "Unity Ads",
    status: "Paused",
    integration: "Connected",
    spend: 8750.50,
    impressions: 1250000,
    clicks: 18750,
    ctr: 1.50,
    lastSync: "2024-01-14 15:20"
  },
  {
    id: 4,
    name: "AdMob",
    status: "Active",
    integration: "Error",
    spend: 5230.00,
    impressions: 890000,
    clicks: 12340,
    ctr: 1.39,
    lastSync: "2024-01-13 09:15"
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
  const totalImpressions = exchanges.reduce((sum, ex) => sum + ex.impressions, 0);
  const totalClicks = exchanges.reduce((sum, ex) => sum + ex.clicks, 0);
  const avgCTR = totalClicks / totalImpressions * 100;

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
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalImpressions / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Total ad impressions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total ad clicks</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCTR.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Click-through rate</p>
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
                    <p className="text-sm text-muted-foreground">Impressions</p>
                    <p className="text-lg font-semibold">{(exchange.impressions / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clicks</p>
                    <p className="text-lg font-semibold">{exchange.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CTR</p>
                    <p className="text-lg font-semibold">{exchange.ctr}%</p>
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
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium">{exchange.ctr}%</p>
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