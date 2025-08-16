import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCreatives = [
  {
    id: 1,
    name: "Summer Banner",
    type: "Image",
    size: "320x50",
    format: "JPG",
    spend: 1250.75,
    installs: 185,
    cpi: 6.76,
    campaignName: "Summer Mobile Game",
    uploadDate: "2024-01-15",
    tags: ["summer", "banner", "mobile"]
  },
  {
    id: 2,
    name: "Game Video Ad",
    type: "Video", 
    size: "1280x720",
    format: "MP4",
    spend: 2840.50,
    installs: 342,
    cpi: 8.31,
    campaignName: "Holiday Shopping App",
    uploadDate: "2024-01-14",
    tags: ["video", "game", "interactive"]
  },
  {
    id: 3,
    name: "App Icon Variant",
    type: "Image",
    size: "512x512",
    format: "PNG",
    spend: 890.25,
    installs: 124,
    cpi: 7.18,
    campaignName: "Fitness Tracker Promo",
    uploadDate: "2024-01-13",
    tags: ["icon", "app", "variant"]
  }
];

export default function Creatives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const { toast } = useToast();

  const handleExportCreatives = () => {
    toast({
      title: "Export Started",
      description: "Exporting creative performance report...",
    });
  };

  const filteredCreatives = mockCreatives.filter(creative => {
    const matchesSearch = creative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || creative.type.toLowerCase() === selectedType;
    const matchesFormat = selectedFormat === "all" || creative.format === selectedFormat;
    
    return matchesSearch && matchesType && matchesFormat;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Creatives</h1>
            <p className="text-muted-foreground">
              Analyze performance of your advertising creatives
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCreatives}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find creatives by name, tags, type, or format</CardDescription>
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
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                  <SelectItem value="MP4">MP4</SelectItem>
                  <SelectItem value="GIF">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Creative Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCreatives.map((creative) => (
            <Card key={creative.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{creative.name}</CardTitle>
                  <Badge variant={creative.type === "Video" ? "default" : "secondary"}>
                    {creative.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Creative Preview */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <FileImage className="w-12 h-12 text-muted-foreground" />
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Campaign:</span>
                    <span className="font-medium">{creative.campaignName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Spend:</span>
                    <span className="font-medium">${creative.spend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Installs:</span>
                    <span className="font-medium">{creative.installs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPI:</span>
                    <span className="font-medium">${creative.cpi.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{creative.size}</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {creative.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Creative Performance Summary</CardTitle>
            <CardDescription>Overview of all creative advertising metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{mockCreatives.length}</p>
                <p className="text-sm text-muted-foreground">Total Creatives</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${mockCreatives.reduce((sum, creative) => sum + creative.spend, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Spend</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {mockCreatives.reduce((sum, creative) => sum + creative.installs, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Installs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${(mockCreatives.reduce((sum, creative) => sum + creative.cpi, 0) / mockCreatives.length).toFixed(2)}
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