import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Download, Link2, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCreatives = [
  {
    id: 1,
    name: "Summer Banner",
    type: "Image",
    size: "320x50",
    format: "JPG",
    performance: 8.5,
    uploadDate: "2024-01-15",
    tags: ["summer", "banner", "mobile"]
  },
  {
    id: 2,
    name: "Game Video Ad",
    type: "Video",
    size: "1280x720",
    format: "MP4",
    performance: 9.2,
    uploadDate: "2024-01-14",
    tags: ["video", "game", "interactive"]
  },
  {
    id: 3,
    name: "App Icon Variant",
    type: "Image",
    size: "512x512",
    format: "PNG",
    performance: 7.8,
    uploadDate: "2024-01-13",
    tags: ["icon", "app", "variant"]
  }
];

export default function Creatives() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const { toast } = useToast();

  const handleUploadCreative = () => {
    toast({
      title: "Upload Creative",
      description: "Creative upload functionality will be available soon",
    });
  };

  const handleMatchCreatives = () => {
    toast({
      title: "Match Creatives",
      description: "Matching creatives with campaigns...",
    });
  };

  const handleExportCreatives = () => {
    toast({
      title: "Export Started",
      description: "Downloading all creatives...",
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
              Manage and organize your creative assets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMatchCreatives}>
              <Link2 className="w-4 h-4 mr-2" />
              Match
            </Button>
            <Button variant="outline" onClick={handleExportCreatives}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleUploadCreative}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Creative
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
                
                {/* Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{creative.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span>{creative.format}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Performance:</span>
                    <span className="font-medium">{creative.performance}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span>{creative.uploadDate}</span>
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
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
            <CardDescription>Supported formats and best practices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Supported Formats</h4>
                <ul className="text-sm space-y-1">
                  <li>• Images: JPG, PNG, GIF</li>
                  <li>• Videos: MP4, MOV</li>
                  <li>• Maximum file size: 50MB</li>
                  <li>• Recommended dimensions: 1280x720 for videos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Best Practices</h4>
                <ul className="text-sm space-y-1">
                  <li>• Use descriptive file names</li>
                  <li>• Add relevant tags for easy searching</li>
                  <li>• Optimize file sizes for faster loading</li>
                  <li>• Include multiple size variants</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}