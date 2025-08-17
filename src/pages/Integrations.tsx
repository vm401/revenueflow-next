import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/AnimatedCard";
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

        {/* Adjust Integration - Coming Soon */}
        <AnimatedCard className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Adjust Integration</CardTitle>
                  <CardDescription className="text-base">
                    Mobile attribution and analytics platform integration
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Coming Soon
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-lg font-medium">Integration in Development</p>
                <p className="text-sm">We're working on bringing Adjust integration to enhance your attribution tracking.</p>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>


      </div>
    </Layout>
  );
}
