import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, BarChart, RefreshCw } from "lucide-react";

// Mock data based on Moloco CRM specification
const mockMetrics = {
  activeTrials: 40,
  activeSubscriptions: 3084,
  mrr: 29249,
  revenue: 36638,
  newCustomers: 7400,
  activeCustomers: 18407
};

const mockChartData = [
  { date: "May 19", value: 1000 },
  { date: "Jun 08", value: 1200 },
  { date: "Jun 28", value: 1150 },
  { date: "Jul 18", value: 1350 },
  { date: "Aug 07", value: 1580 },
];

const mockTransactions = [
  {
    customerId: "5f4b8a2e059040799f172ee913ccbfda",
    store: "Granted entitlement",
    product: "rc_promo_premium_yearly",
    purchased: "an hour ago",
    expires: "in a year",
    revenue: "0,00 $",
    type: "NEW SUB",
    flag: "🇩🇪"
  },
  {
    customerId: "cf2af784cd2447409e3f7981edf083c6",
    store: "Play Store",
    product: "android_monthly",
    purchased: "2 hours ago",
    expires: "in a month",
    revenue: "9,99 $",
    type: "NEW SUB",
    flag: "🇺🇦"
  },
  {
    customerId: "a79a27ebf74445c299aca9a96cce660e",
    store: "App Store",
    product: "ios_premium_annual_1",
    purchased: "2 hours ago",
    expires: "in a year",
    revenue: "99,99 $",
    type: "NEW SUB",
    flag: "🇩🇪"
  },
  {
    customerId: "3822a3e2feff4558aaffec4c06841f6d",
    store: "App Store",
    product: "ios_premium_annual_1",
    purchased: "3 hours ago",
    expires: "in a year",
    revenue: "99,99 $",
    type: "NEW SUB",
    flag: "🇩🇪"
  },
  {
    customerId: "f99fdfec74e44fcab6addf9fdd2bf3",
    store: "App Store",
    product: "ios_premium_monthly_1",
    purchased: "3 hours ago",
    expires: "in a month",
    revenue: "9,99 $",
    type: "NEW SUB",
    flag: "🇺🇸"
  }
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Trials */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Trials</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockMetrics.activeTrials}</div>
            <p className="text-xs text-muted-foreground">In total</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockMetrics.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">In total</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* MRR */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">MRR</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockMetrics.mrr.toLocaleString()} $</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-5/6 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockMetrics.revenue.toLocaleString()} $</div>
            <p className="text-xs text-muted-foreground">Last 28 days</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* New Customers */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockMetrics.newCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 28 days</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-primary rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Customers</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{mockMetrics.activeCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 28 days</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-accent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Recent transactions</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              Sandbox data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground">Customer ID</TableHead>
                <TableHead className="text-muted-foreground">Store</TableHead>
                <TableHead className="text-muted-foreground">Product</TableHead>
                <TableHead className="text-muted-foreground">Purchased</TableHead>
                <TableHead className="text-muted-foreground">Expires</TableHead>
                <TableHead className="text-muted-foreground">Revenue</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction, index) => (
                <TableRow key={index} className="border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span>{transaction.flag}</span>
                      <span className="text-foreground">{transaction.customerId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{transaction.store}</TableCell>
                  <TableCell className="text-foreground">{transaction.product}</TableCell>
                  <TableCell className="text-muted-foreground">{transaction.purchased}</TableCell>
                  <TableCell className="text-muted-foreground">{transaction.expires}</TableCell>
                  <TableCell className="text-foreground">{transaction.revenue}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={transaction.type === "RENEWAL" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}