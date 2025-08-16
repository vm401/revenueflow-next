import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Key,
  Globe,
  Database,
  Zap,
  Activity,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const integrations = [
  {
    id: "adjust",
    name: "Adjust",
    description: "Mobile attribution and analytics platform",
    status: "available",
    category: "Attribution",
    icon: Activity,
    color: "bg-blue-500",
    features: ["Attribution tracking", "Fraud prevention", "Audience builder", "Cohort analysis"],
    setupRequired: true
  },
  {
    id: "appsflyer",
    name: "AppsFlyer", 
    description: "Mobile attribution and marketing analytics",
    status: "coming_soon",
    category: "Attribution",
    icon: Zap,
    color: "bg-purple-500",
    features: ["Attribution", "Deep linking", "Fraud protection", "Audience segmentation"],
    setupRequired: true
  },
  {
    id: "facebook",
    name: "Facebook Ads",
    description: "Social media advertising platform",
    status: "connected",
    category: "Ad Networks",
    icon: Globe,
    color: "bg-blue-600",
    features: ["Campaign management", "Audience insights", "Creative testing", "Attribution"],
    setupRequired: false
  },
  {
    id: "google",
    name: "Google Ads",
    description: "Search and display advertising platform", 
    status: "connected",
    category: "Ad Networks",
    icon: Database,
    color: "bg-green-500",
    features: ["Search ads", "Display ads", "YouTube ads", "App campaigns"],
    setupRequired: false
  }
];

export default function Integrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = (integrationId: string) => {
    toast({
      title: "Integration Setup",
      description: `Setting up ${integrations.find(i => i.id === integrationId)?.name} integration...`,
    });
  };

  const handleDisconnect = (integrationId: string) => {
    toast({
      title: "Integration Disconnected", 
      description: `${integrations.find(i => i.id === integrationId)?.name} has been disconnected.`,
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>;
      case "available":
        return <Badge variant="outline">Available</Badge>;
      case "coming_soon":
        return <Badge variant="secondary">Coming Soon</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">
              Connect your marketing tools and attribution platforms
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Integration
          </Button>
        </div>

        {/* Featured Integration - Adjust */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Adjust Integration</CardTitle>
                  <CardDescription className="text-base">
                    Premium mobile attribution and analytics platform
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Featured
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Real-time</div>
                <div className="text-sm text-muted-foreground">Attribution</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Fraud</div>
                <div className="text-sm text-muted-foreground">Prevention</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Global</div>
                <div className="text-sm text-muted-foreground">Coverage</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">API Key required</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button size="sm" onClick={() => handleConnect('adjust')}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect Adjust
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Categories */}
        <div className="grid gap-6">
          {["Attribution", "Ad Networks"].map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category} Platforms</CardTitle>
                <CardDescription>
                  {category === "Attribution" 
                    ? "Track and analyze user acquisition across all channels"
                    : "Manage your advertising campaigns across different networks"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {integrations
                    .filter(integration => integration.category === category)
                    .map((integration) => {
                      const Icon = integration.icon;
                      return (
                        <div key={integration.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{integration.name}</h3>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                              </div>
                            </div>
                            {getStatusBadge(integration.status)}
                          </div>

                          <div className="mt-4">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {integration.features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {integration.setupRequired && (
                                  <>
                                    <Key className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Setup required</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                {integration.status === "connected" ? (
                                  <>
                                    <Button variant="outline" size="sm">
                                      <Settings className="h-4 w-4 mr-2" />
                                      Configure
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleDisconnect(integration.id)}
                                    >
                                      Disconnect
                                    </Button>
                                  </>
                                ) : integration.status === "available" ? (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleConnect(integration.id)}
                                  >
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Connect
                                  </Button>
                                ) : (
                                  <Button size="sm" disabled>
                                    Coming Soon
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Setup Guide</CardTitle>
            <CardDescription>
              Follow these steps to connect your attribution and advertising platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Select the attribution or advertising platform you want to connect
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 dark:text-green-300 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Configure API</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your API credentials and configure the connection settings
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 dark:text-purple-300 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Start Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Begin receiving attribution data and campaign performance metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
