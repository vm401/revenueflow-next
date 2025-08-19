import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TanStackTable } from './TanStackTable';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  app: string;
  exchange: string;
  status: 'active' | 'paused' | 'ended';
  spend: number;
  installs: number;
  actions: number;
  avgCPI: number;
  avgCPA: number;
  avgCTR: number;
  avgCPC: number;
  creatives: number;
}

interface CampaignsTableProps {
  data: Campaign[];
  className?: string;
}

export function CampaignsTable({ data, className }: CampaignsTableProps) {
  const { toast } = useToast();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      duration: 2000,
    });
  };

  const columns: ColumnDef<Campaign>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Campaign Name",
        cell: ({ row }) => {
          const campaign = row.original;
          return (
            <div className="flex items-center space-x-2 min-w-[200px]">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground truncate max-w-[180px]">
                  {campaign.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ID: {campaign.id}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(campaign.id, "Campaign ID")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: "app",
        header: "App",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.getValue("app")}
          </Badge>
        ),
      },
      {
        accessorKey: "exchange",
        header: "Exchange",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium">
            {row.getValue("exchange")}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge 
              variant={status === 'active' ? 'default' : status === 'paused' ? 'secondary' : 'destructive'}
              className="capitalize"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("spend"));
          return (
            <div className="text-right font-semibold text-red-600 dark:text-red-400">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "installs",
        header: "Installs",
        cell: ({ row }) => (
          <div className="text-right font-semibold text-green-600 dark:text-green-400">
            {(row.getValue("installs") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="text-right font-semibold text-blue-600 dark:text-blue-400">
            {(row.getValue("actions") as number).toLocaleString()}
          </div>
        ),
      },
      {
        accessorKey: "avgCPI",
        header: "Avg CPI",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("avgCPI"));
          return (
            <div className="text-right">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "avgCPA",
        header: "Avg CPA",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("avgCPA"));
          return (
            <div className="text-right">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "avgCTR",
        header: "Avg CTR",
        cell: ({ row }) => (
          <div className="text-right">
            {(row.getValue("avgCTR") as number).toFixed(2)}%
          </div>
        ),
      },
      {
        accessorKey: "avgCPC",
        header: "Avg CPC",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("avgCPC"));
          return (
            <div className="text-right">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        accessorKey: "creatives",
        header: "Creatives",
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant="outline">
              {row.getValue("creatives")}
            </Badge>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const campaign = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleCopy(campaign.id, "Campaign ID")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [toast]
  );

  return (
    <TanStackTable
      data={data}
      columns={columns}
      searchPlaceholder="Search campaigns..."
      className={className}
    />
  );
}
