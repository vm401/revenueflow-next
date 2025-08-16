import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, BarChart3, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock inventory based on real advertising exchange data
const mockInventory = [
  {
    id: 1,
    source: "Meta Audience Network",
    type: "Mobile Apps",
    quality: "High",
    spend: 15420.75,
    installs: 1950,
    actions: 1460,
    cpi: 7.91,
    countries: ["US", "CA", "UK"],
    blacklisted: false,
    whitelisted: true
  },
  {
    id: 2,
    source: "Google AdMob",
    type: "Mobile Apps",
    quality: "High",
    spend: 12850.25,
    installs: 1580,
    actions: 1220,
    cpi: 8.13,
    countries: ["US", "AU", "DE"],
    blacklisted: false,
    whitelisted: true
  },
  {
    id: 3,
    source: "Unity Ads Network",
    type: "Gaming Apps",
    quality: "Medium",
    spend: 8750.50,
    installs: 1120,
    actions: 850,
    cpi: 7.81,
    countries: ["US", "JP", "KR"],
    blacklisted: false,
    whitelisted: false
  },
  {
    id: 4,
    source: "TikTok For Business",
    type: "Social Media",
    quality: "High",
    spend: 9450.00,
    installs: 1180,
    actions: 890,
    cpi: 8.01,
    countries: ["US", "UK", "FR"],
    blacklisted: false,
    whitelisted: true
  },
  {
    id: 5,
    source: "Low Quality Exchange",
    type: "Web Traffic",
    quality: "Low",
    spend: 2150.00,
    installs: 280,
    actions: 120,
    cpi: 7.68,
    countries: ["Various"],
    blacklisted: true,
    whitelisted: false
  }
];

export default function Inventory() {
  const [inventory, setInventory] = useState(mockInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const { toast } = useToast();



  const handleAnalyze = (sourceName: string) => {
    toast({
      title: "Analyzing Traffic",
      description: `Analyzing traffic quality for ${sourceName}...`,
    });
  };

  const handleBlacklistToggle = (id: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id 
        ? { ...item, blacklisted: !item.blacklisted, whitelisted: item.blacklisted ? item.whitelisted : false }
        : item
    ));
    
    const item = inventory.find(inv => inv.id === id);
    toast({
      title: "List Updated",
      description: `${item?.source} ${item?.blacklisted ? "removed from" : "added to"} blacklist`,
    });
  };

  const handleWhitelistToggle = (id: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id 
        ? { ...item, whitelisted: !item.whitelisted, blacklisted: item.whitelisted ? item.blacklisted : false }
        : item
    ));
    
    const item = inventory.find(inv => inv.id === id);
    toast({
      title: "List Updated",
      description: `${item?.source} ${item?.whitelisted ? "removed from" : "added to"} whitelist`,
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQuality = selectedQuality === "all" || item.quality.toLowerCase() === selectedQuality;
    const matchesType = selectedType === "all" || item.type.toLowerCase() === selectedType;
    
    return matchesSearch && matchesQuality && matchesType;
  });

  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case "High": return "default";
      case "Medium": return "secondary";
      case "Low": return "destructive";
      default: return "outline";
    }
  };

  const totalSpend = inventory.reduce((sum, item) => sum + item.spend, 0);
  const totalInstalls = inventory.reduce((sum, item) => sum + item.installs, 0);
  const totalActions = inventory.reduce((sum, item) => sum + item.actions, 0);
  const avgCPI = totalSpend / totalInstalls;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground">
              Monitor traffic sources and analyze inventory quality
            </p>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
              <p className="text-xs text-muted-foreground">Active traffic sources</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpend.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all sources</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInstalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">App installations</p>
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Filter inventory by quality, type, or search by name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualities</SelectItem>
                  <SelectItem value="high">High Quality</SelectItem>
                  <SelectItem value="medium">Medium Quality</SelectItem>
                  <SelectItem value="low">Low Quality</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="app">Apps</SelectItem>
                  <SelectItem value="website">Websites</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Sources */}
        <div className="space-y-4">
          {filteredInventory.map((source) => (
            <Card key={source.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{source.source}</h3>
                      <p className="text-sm text-muted-foreground">{source.type}</p>
                    </div>
                    <Badge variant={getQualityBadgeVariant(source.quality)}>
                      {source.quality} Quality
                    </Badge>
                    {source.blacklisted && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Blacklisted
                      </Badge>
                    )}
                    {source.whitelisted && (
                      <Badge variant="default">
                        <Shield className="w-3 h-3 mr-1" />
                        Whitelisted
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Spend</p>
                        <p className="font-semibold">${source.spend.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Installs</p>
                        <p className="font-semibold">{source.installs.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Actions</p>
                        <p className="font-semibold">{source.actions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CPI</p>
                        <p className="font-semibold">${source.cpi.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {/* Countries */}
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Active Countries</p>
                      <div className="flex flex-wrap gap-1">
                        {source.countries.map((country) => (
                          <Badge key={country} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAnalyze(source.source)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* List Controls */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={source.blacklisted}
                      onCheckedChange={() => handleBlacklistToggle(source.id)}
                    />
                    <span className="text-sm">Blacklist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={source.whitelisted}
                      onCheckedChange={() => handleWhitelistToggle(source.id)}
                    />
                    <span className="text-sm">Whitelist</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quality Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Analysis</CardTitle>
            <CardDescription>Automated traffic quality assessment criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">High Quality</h4>
                <ul className="text-sm space-y-1">
                  <li>• CPI below $8.50</li>
                  <li>• High action rate (60%+)</li>
                  <li>• Low fraud rate</li>
                  <li>• Premium app inventory</li>
                  <li>• Tier 1 countries</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-yellow-600">Medium Quality</h4>
                <ul className="text-sm space-y-1">
                  <li>• CPI $8.50 - $12.00</li>
                  <li>• Moderate action rate (40-60%)</li>
                  <li>• Some fraud detection</li>
                  <li>• Mixed inventory quality</li>
                  <li>• Tier 2 countries</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Low Quality</h4>
                <ul className="text-sm space-y-1">
                  <li>• CPI above $12.00</li>
                  <li>• Low action rate (below 40%)</li>
                  <li>• High fraud rate</li>
                  <li>• Poor inventory quality</li>
                  <li>• Tier 3+ countries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}