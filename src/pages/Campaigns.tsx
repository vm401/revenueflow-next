import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, FileSpreadsheet, Printer, Mail, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCampaigns = [
  {
    id: 1,
    name: "Summer Mobile Game Campaign",
    app: "Puzzle Adventure",
    country: "US",
    date: "2024-01-15",
    spend: 1250.75,
    installs: 156,
    cpi: 8.02,
    status: "Active"
  },
  {
    id: 2,
    name: "Holiday Shopping App",
    app: "ShopEasy",
    country: "CA",
    date: "2024-01-14",
    spend: 890.50,
    installs: 98,
    cpi: 9.09,
    status: "Paused"
  },
  {
    id: 3,
    name: "Fitness Tracker Promo",
    app: "FitLife Pro",
    country: "UK",
    date: "2024-01-13",
    spend: 2150.25,
    installs: 245,
    cpi: 8.78,
    status: "Active"
  }
];

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedApp, setSelectedApp] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting campaigns to ${format.toUpperCase()}...`,
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleEmailReport = () => {
    toast({
      title: "Email Report",
      description: "Email functionality will be available soon",
    });
  };

  const handleRowClick = (campaign: any) => {
    setSelectedCampaign(campaign);
  };

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.app.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || campaign.country === selectedCountry;
    const matchesApp = selectedApp === "all" || campaign.app === selectedApp;
    
    return matchesSearch && matchesCountry && matchesApp;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage and analyze your advertising campaigns
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter campaigns by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger>
                  <SelectValue placeholder="Select app" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Apps</SelectItem>
                  <SelectItem value="Puzzle Adventure">Puzzle Adventure</SelectItem>
                  <SelectItem value="ShopEasy">ShopEasy</SelectItem>
                  <SelectItem value="FitLife Pro">FitLife Pro</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export & Reports</CardTitle>
            <CardDescription>Export filtered data and generate reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => handleExport("csv")}>
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <Button variant="outline" onClick={handlePrintReport}>
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" onClick={handleEmailReport}>
                <Mail className="w-4 h-4 mr-2" />
                Email Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Data</CardTitle>
            <CardDescription>
              {filteredCampaigns.length} campaigns found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Spend</TableHead>
                  <TableHead>Installs</TableHead>
                  <TableHead>CPI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow 
                    key={campaign.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(campaign)}
                  >
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.app}</TableCell>
                    <TableCell>{campaign.country}</TableCell>
                    <TableCell>{campaign.date}</TableCell>
                    <TableCell>${campaign.spend.toFixed(2)}</TableCell>
                    <TableCell>{campaign.installs}</TableCell>
                    <TableCell>${campaign.cpi.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Campaign Details Modal would go here */}
        {selectedCampaign && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details: {selectedCampaign.name}</CardTitle>
              <CardDescription>Detailed information about the selected campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p><strong>App:</strong> {selectedCampaign.app}</p>
                  <p><strong>Country:</strong> {selectedCampaign.country}</p>
                  <p><strong>Date:</strong> {selectedCampaign.date}</p>
                  <p><strong>Status:</strong> {selectedCampaign.status}</p>
                </div>
                <div>
                  <p><strong>Spend:</strong> ${selectedCampaign.spend.toFixed(2)}</p>
                  <p><strong>Installs:</strong> {selectedCampaign.installs}</p>
                  <p><strong>CPI:</strong> ${selectedCampaign.cpi.toFixed(2)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSelectedCampaign(null)}
              >
                Close Details
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}