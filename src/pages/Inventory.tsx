import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedCard } from "@/components/AnimatedCard";
import { AnimatedButton } from "@/components/AnimatedButton";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { AnimatedBadge } from "@/components/AnimatedBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, FileSpreadsheet, Printer, Mail, Eye, Loader2, RefreshCw, Calendar, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, AlertTriangle, Database, GripVertical, Settings, Copy, CheckCircle, Package, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUltraData } from "@/contexts/UltraDataContext";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Inventory() {
  const { data, getFilteredInventory, exportData } = useUltraData();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrafficType, setSelectedTrafficType] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedAppBundle, setSelectedAppBundle] = useState("all");
  const [selectedExchange, setSelectedExchange] = useState("all");
  const [sortBy, setSortBy] = useState<'appTitle' | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'cpi'>('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnOrder, setColumnOrder] = useState([
    'appTitle', 'trafficType', 'platform', 'appBundle', 'exchange', 'spend', 'impressions', 'clicks', 'ctr', 'cpi', 'moves'
  ]);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get filtered inventory
  const inventory = useMemo(() => {
    return getFilteredInventory({
      search: searchTerm,
      trafficType: selectedTrafficType,
      platform: selectedPlatform,
      app: selectedAppBundle,
      exchange: selectedExchange,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize
    });
  }, [searchTerm, selectedTrafficType, selectedPlatform, selectedAppBundle, selectedExchange, sortBy, sortOrder, currentPage, pageSize, getFilteredInventory]);

  // Get total count for pagination
  const totalInventory = data?.inventory?.length || 0;
  const totalPages = Math.ceil(totalInventory / pageSize);

  // Get unique traffic types, platforms, app bundles, and exchanges for filters
  const types = useMemo(() => {
    if (!data?.inventory) return [];
    const uniqueTypes = new Set(data.inventory.map(i => i.trafficType));
    return Array.from(uniqueTypes).sort();
  }, [data?.inventory]);

  const platforms = useMemo(() => {
    if (!data?.inventory) return [];
    const uniquePlatforms = new Set(data.inventory.map(i => i.platform));
    return Array.from(uniquePlatforms).sort();
  }, [data?.inventory]);

  const apps = useMemo(() => {
    if (!data?.inventory) return [];
    const uniqueApps = new Set(data.inventory.map(i => i.appBundle));
    return Array.from(uniqueApps).sort();
  }, [data?.inventory]);

  const exchanges = useMemo(() => {
    if (!data?.campaigns) return [];
    const uniqueExchanges = new Set(data.campaigns.flatMap(c => c.exchanges.map(e => e.exchange)));
    return Array.from(uniqueExchanges).sort();
  }, [data?.campaigns]);

  // Handle sorting
  const handleSort = (column: 'appTitle' | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'cpi') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Handle column reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    exportData(format);
    toast({
      title: "Export Started",
      description: `Exporting inventory data as ${format.toUpperCase()}`,
    });
  };

  // Toggle inventory details
  const toggleDetails = (inventoryId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [inventoryId]: !prev[inventoryId]
    }));
  };

  // Copy inventory name
  const copyInventoryName = async (inventoryName: string, inventoryId: string) => {
    try {
      await navigator.clipboard.writeText(inventoryName);
      setCopiedId(inventoryId);
      toast({
        title: "Copied!",
        description: "Inventory name copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy inventory name",
        variant: "destructive",
      });
    }
  };

  // Render sort icon
  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Column header component with drag handle
  const SortableColumnHeader = ({ id, children, sortable = false, onSort }: { 
    id: string; 
    children: React.ReactNode; 
    sortable?: boolean;
    onSort?: () => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TableHead 
        ref={setNodeRef} 
        style={style} 
        className="cursor-move select-none"
        onClick={sortable ? onSort : undefined}
      >
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
          {children}
        </div>
      </TableHead>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory Sources</h1>
            <p className="text-muted-foreground">
              Manage and analyze your inventory sources and performance
            </p>
          </div>
          {data && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Database className="h-3 w-3 mr-1" />
              CSV Data Active
            </Badge>
          )}
        </div>

        {/* Filters */}
        <AnimatedCard variant="lilac" animation="slide">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter inventory by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Select value={selectedTrafficType} onValueChange={setSelectedTrafficType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Traffic Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traffic Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedAppBundle} onValueChange={setSelectedAppBundle}>
                <SelectTrigger>
                  <SelectValue placeholder="All App Bundles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All App Bundles</SelectItem>
                  {apps.map((app) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Exchanges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exchanges</SelectItem>
                  {exchanges.map((exchange) => (
                    <SelectItem key={exchange} value={exchange}>
                      {exchange}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <Button 
                variant="outline" 
              >
                Clear
              </Button>
              
                            </div>
          </CardContent>
        </AnimatedCard>

        {/* Inventory Data */}
        <AnimatedCard>
          <CardHeader>
            <CardTitle>Inventory Data</CardTitle>
            <CardDescription>
              {data ? `${totalInventory} inventory sources found` : 'No CSV data loaded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No CSV data loaded. Please upload your campaign files to see inventory data here.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="rounded-md border">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Table>
                      <TableHeader>
                        <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
                          <TableRow>
                            {columnOrder.includes('appTitle') && (
                              <SortableColumnHeader 
                                id="appTitle" 
                                sortable 
                                onSort={() => handleSort('appTitle')}
                              >
                                <div className="flex items-center gap-2">
                                  App Title
                                  <SortIcon column="appTitle" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('trafficType') && (
                              <SortableColumnHeader id="trafficType">
                                Traffic Type
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('platform') && (
                              <SortableColumnHeader id="platform">
                                Platform
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('appBundle') && (
                              <SortableColumnHeader id="appBundle">
                                App Bundle
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('exchange') && (
                              <SortableColumnHeader id="exchange">
                                Exchange
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('spend') && (
                              <SortableColumnHeader 
                                id="spend" 
                                sortable 
                                onSort={() => handleSort('spend')}
                              >
                                <div className="flex items-center gap-2">
                                  Spend
                                  <SortIcon column="spend" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('impressions') && (
                              <SortableColumnHeader 
                                id="impressions" 
                                sortable 
                                onSort={() => handleSort('impressions')}
                              >
                                <div className="flex items-center gap-2">
                                  Impressions
                                  <SortIcon column="impressions" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('clicks') && (
                              <SortableColumnHeader 
                                id="clicks" 
                                sortable 
                                onSort={() => handleSort('clicks')}
                              >
                                <div className="flex items-center gap-2">
                                  Clicks
                                  <SortIcon column="clicks" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('ctr') && (
                              <SortableColumnHeader 
                                id="ctr" 
                                sortable 
                                onSort={() => handleSort('ctr')}
                              >
                                <div className="flex items-center gap-2">
                                  CTR
                                  <SortIcon column="ctr" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('cpi') && (
                              <SortableColumnHeader 
                                id="cpi" 
                                sortable 
                                onSort={() => handleSort('cpi')}
                              >
                                <div className="flex items-center gap-2">
                                  CPI
                                  <SortIcon column="cpi" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('moves') && (
                              <SortableColumnHeader id="moves">
                                Moves
                              </SortableColumnHeader>
                            )}
                          </TableRow>
                        </SortableContext>
                      </TableHeader>
                      <TableBody>
                        {inventory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={columnOrder.length} className="text-center py-8">
                              No inventory found matching your criteria.
                            </TableCell>
                          </TableRow>
                        ) : (
                          inventory.map((item, index) => (
                            <TableRow key={item.id || index}>
                                                             {columnOrder.includes('appTitle') && (
                                 <TableCell className="font-medium">
                                   <div className="flex items-center gap-2">
                                     <div className="max-w-[200px] truncate">
                                       {item.appTitle}
                                     </div>
                                     <Button
                                       variant="ghost"
                                       className="h-6 w-6 p-0 hover:bg-mint-100 dark:hover:bg-mint-900"
                                       onClick={() => copyInventoryName(item.appTitle, item.id)}
                                     >
                                       {copiedId === item.id ? (
                                         <CheckCircle className="h-3 w-3 text-mint-600" />
                                       ) : (
                                         <Copy className="h-3 w-3 text-muted-foreground hover:text-mint-600" />
                                       )}
                                     </Button>
                                   </div>
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('trafficType') && (
                                 <TableCell>
                                   <Badge variant="outline" className="bg-peach-50 text-peach-700 border-peach-200 dark:bg-peach-900/20 dark:text-peach-300 dark:border-peach-700">
                                     {item.trafficType}
                                   </Badge>
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('platform') && (
                                 <TableCell>
                                   <Badge variant="secondary" className="bg-lilac-50 text-lilac-700 dark:bg-lilac-900/20 dark:text-lilac-300">
                                     {item.platform}
                                   </Badge>
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('appBundle') && (
                                 <TableCell>
                                   <Badge variant="secondary" className="bg-royal-50 text-royal-700 dark:bg-royal-900/20 dark:text-royal-300">
                                     {item.appBundle}
                                   </Badge>
                                 </TableCell>
                               )}
                               
                                                              {columnOrder.includes('exchange') && (
                                 <TableCell>
                                   <Badge variant="secondary" className="bg-mint-50 text-mint-700 dark:bg-mint-900/20 dark:text-mint-300">
                                     {item.exchangesCount > 0 ? `${item.exchangesCount} exchanges` : 'N/A'}
                                   </Badge>
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('spend') && (
                                 <TableCell className="text-right font-semibold">
                                   ${item.totalSpend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('impressions') && (
                                 <TableCell className="text-right">
                                   {item.totalImpressions >= 1000000 
                                     ? (item.totalImpressions / 1000000).toFixed(2) + 'm'
                                     : item.totalImpressions >= 1000 
                                     ? (item.totalImpressions / 1000).toFixed(2) + 'k'
                                     : item.totalImpressions.toLocaleString()}
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('clicks') && (
                                 <TableCell className="text-right">
                                   {item.totalClicks >= 1000000 
                                     ? (item.totalClicks / 1000000).toFixed(2) + 'm'
                                     : item.totalClicks >= 1000 
                                     ? (item.totalClicks / 1000).toFixed(2) + 'k'
                                     : item.totalClicks.toLocaleString()}
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('ctr') && (
                                 <TableCell className="text-right">
                                   {item.ctr.toFixed(2)}%
                                 </TableCell>
                               )}
                               
                               {columnOrder.includes('cpi') && (
                                 <TableCell className="text-right">
                                   ${item.cpi.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                 </TableCell>
                               )}
                              
                              {columnOrder.includes('moves') && (
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => toggleDetails(item.id)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        {showDetails[item.id] ? 'Hide Details' : 'View Details'}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Campaign
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </DndContext>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNumber)}
                                isActive={currentPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                {/* Page Size Control */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">entries per page</span>
                </div>
              </>
            )}
          </CardContent>
        </AnimatedCard>
      </div>
    </Layout>
  );
}