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

const mockInventory = [
  {
    id: 1,
    source: "Premium Mobile Apps",
    type: "App",
    quality: "High",
    impressions: 1250000,
    clicks: 18750,
    ctr: 1.50,
    ecpm: 2.45,
    blacklisted: false,
    whitelisted: true
  },
  {
    id: 2,
    source: "Gaming Network",
    type: "App",
    quality: "Medium",
    impressions: 890000,
    clicks: 12460,
    ctr: 1.40,
    ecpm: 1.85,
    blacklisted: false,
    whitelisted: false
  },
  {
    id: 3,
    source: "Ad Exchange XYZ",
    type: "Website",
    quality: "Low",
    impressions: 2150000,
    clicks: 21500,
    ctr: 1.00,
    ecpm: 0.95,
    blacklisted: true,
    whitelisted: false
  },
  {
    id: 4,
    source: "Social Media Placements",
    type: "App",
    quality: "High",
    impressions: 1680000,
    clicks: 25200,
    ctr: 1.50,
    ecpm: 3.20,
    blacklisted: false,
    whitelisted: true
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

  const totalImpressions = inventory.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = inventory.reduce((sum, item) => sum + item.clicks, 0);
  const avgCTR = totalClicks / totalImpressions * 100;
  const avgECPM = inventory.reduce((sum, item) => sum + item.ecpm, 0) / inventory.length;

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
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalImpressions / 1000000).toFixed(1)}M</div>
              <p className="text-xs text-muted-foreground">Across all sources</p>
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
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average eCPM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgECPM.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Effective cost per mile</p>
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
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="font-semibold">{(source.impressions / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="font-semibold">{source.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CTR</p>
                        <p className="font-semibold">{source.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">eCPM</p>
                        <p className="font-semibold">${source.ecpm}</p>
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
                  <li>• CTR greater than 1.4%</li>
                  <li>• eCPM above $2.00</li>
                  <li>• Low fraud rate</li>
                  <li>• Good user engagement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-yellow-600">Medium Quality</h4>
                <ul className="text-sm space-y-1">
                  <li>• CTR 1.0% - 1.4%</li>
                  <li>• eCPM $1.00 - $2.00</li>
                  <li>• Moderate fraud rate</li>
                  <li>• Average engagement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Low Quality</h4>
                <ul className="text-sm space-y-1">
                  <li>• CTR below 1.0%</li>
                  <li>• eCPM under $1.00</li>
                  <li>• High fraud rate</li>
                  <li>• Poor user engagement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}