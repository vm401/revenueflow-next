import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Smartphone, Tablet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockApps = [
  {
    id: 1,
    name: "Puzzle Adventure",
    bundleId: "com.moloco.puzzle",
    platform: "iOS",
    category: "Games",
    installs: 15420,
    revenue: 12450.75,
    retention: 85.5,
    status: "Active"
  },
  {
    id: 2,
    name: "ShopEasy",
    bundleId: "com.moloco.shop",
    platform: "Android",
    category: "Shopping",
    installs: 8930,
    revenue: 8750.25,
    retention: 72.3,
    status: "Active"
  },
  {
    id: 3,
    name: "FitLife Pro",
    bundleId: "com.moloco.fitness",
    platform: "iOS",
    category: "Health",
    installs: 12680,
    revenue: 15230.50,
    retention: 91.2,
    status: "Paused"
  }
];

export default function Apps() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const handleAddApp = () => {
    toast({
      title: "Add New App",
      description: "App addition functionality will be available soon",
    });
  };

  const handleAppClick = (app: any) => {
    toast({
      title: "App Details",
      description: `Viewing details for ${app.name}`,
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
              Manage your mobile applications and track their performance
            </p>
          </div>
          <Button onClick={handleAddApp}>
            <Plus className="w-4 h-4 mr-2" />
            Add App
          </Button>
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
                
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Installs</p>
                    <p className="text-lg font-semibold">{app.installs.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-semibold">${app.revenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Retention Rate</span>
                    <span>{app.retention}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${app.retention}%` }}
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Analytics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>App Performance Summary</CardTitle>
            <CardDescription>Overview of all app metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{mockApps.length}</p>
                <p className="text-sm text-muted-foreground">Total Apps</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {mockApps.reduce((sum, app) => sum + app.installs, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Installs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${mockApps.reduce((sum, app) => sum + app.revenue, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {(mockApps.reduce((sum, app) => sum + app.retention, 0) / mockApps.length).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Retention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add App Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Adding New Apps</CardTitle>
            <CardDescription>How to integrate new applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Required Information</h4>
                <ul className="text-sm space-y-1">
                  <li>• App name and description</li>
                  <li>• Bundle ID / Package name</li>
                  <li>• Platform (iOS/Android)</li>
                  <li>• App Store/Google Play URL</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Auto-Integration</h4>
                <ul className="text-sm space-y-1">
                  <li>• Automatic metadata retrieval</li>
                  <li>• App Store Connect integration</li>
                  <li>• Google Play Console sync</li>
                  <li>• Real-time performance tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}