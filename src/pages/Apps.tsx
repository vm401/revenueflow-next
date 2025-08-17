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
import { Search, Filter, Download, FileSpreadsheet, Printer, Mail, Eye, Loader2, RefreshCw, Calendar, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, AlertTriangle, Database, GripVertical, Settings, Copy, CheckCircle, Smartphone, Globe } from "lucide-react";
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

export default function Apps() {
  const { data, getFilteredApps, exportData } = useUltraData();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedExchange, setSelectedExchange] = useState("all");
  const [sortBy, setSortBy] = useState<'name' | 'spend' | 'installs' | 'avgCPI' | 'avgCTR' | 'avgCPC'>('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnOrder, setColumnOrder] = useState([
    'name', 'platform', 'campaigns', 'creatives', 'spend', 'installs', 'avgCPI', 'avgCTR', 'avgCPC', 'moves'
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

  // Get filtered apps
  const apps = useMemo(() => {
    return getFilteredApps({
      search: searchTerm,
      platform: selectedPlatform,
      exchange: selectedExchange,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize
    });
  }, [searchTerm, selectedPlatform, selectedExchange, sortBy, sortOrder, currentPage, pageSize, getFilteredApps]);

  // Get total count for pagination
  const totalApps = data?.apps?.length || 0;
  const totalPages = Math.ceil(totalApps / pageSize);

  // Get unique platforms and exchanges for filters
  const platforms = useMemo(() => {
    if (!data?.apps) return [];
    const uniquePlatforms = new Set(data.apps.map(a => a.platform));
    return Array.from(uniquePlatforms).sort();
  }, [data?.apps]);

  const exchanges = useMemo(() => {
    if (!data?.apps) return [];
    const uniqueExchanges = new Set(data.apps.flatMap(app => 
      data.campaigns
        .filter(c => c.targetAppId === app.appId)
        .flatMap(c => c.exchanges.map(e => e.exchange))
    ));
    return Array.from(uniqueExchanges).sort();
  }, [data?.apps, data?.campaigns]);

  // Handle sorting
  const handleSort = (column: 'name' | 'spend' | 'installs' | 'avgCPI' | 'avgCTR' | 'avgCPC') => {
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
      description: `Exporting apps data as ${format.toUpperCase()}`,
    });
  };

  // Toggle app details
  const toggleDetails = (appId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  // Copy app name
  const copyAppName = async (appName: string, appId: string) => {
    try {
      await navigator.clipboard.writeText(appName);
      setCopiedId(appId);
      toast({
        title: "Copied!",
        description: "App name copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy app name",
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
            <h1 className="text-3xl font-bold">Apps</h1>
            <p className="text-muted-foreground">
              Manage and analyze your target applications and performance
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
        <AnimatedCard variant="royal" animation="slide">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter apps by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search apps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
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
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPlatform("all");
                  setSelectedExchange("all");
                }}
                size="sm"
              >
                Clear
              </Button>
              
              <Button 
                variant="default" 
                onClick={() => {
                  // Filters are applied automatically via useMemo
                }}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
              </Button>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Apps Data */}
        <AnimatedCard>
          <CardHeader>
            <CardTitle>Apps Data</CardTitle>
            <CardDescription>
              {data ? `${totalApps} apps found` : 'No CSV data loaded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No CSV data loaded. Please upload your campaign files to see app data here.
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
                            {columnOrder.includes('name') && (
                              <SortableColumnHeader 
                                id="name" 
                                sortable 
                                onSort={() => handleSort('name')}
                              >
                                <div className="flex items-center gap-2">
                                  App Name
                                  <SortIcon column="name" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('platform') && (
                              <SortableColumnHeader id="platform">
                                Platform
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('campaigns') && (
                              <SortableColumnHeader id="campaigns">
                                Campaigns
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('creatives') && (
                              <SortableColumnHeader id="creatives">
                                Creatives
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('spend') && (
                              <SortableColumnHeader 
                                id="spend" 
                                sortable 
                                onSort={() => handleSort('spend')}
                              >
                                <div className="flex items-center gap-2">
                                  Total Spend
                                  <SortIcon column="spend" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('installs') && (
                              <SortableColumnHeader 
                                id="installs" 
                                sortable 
                                onSort={() => handleSort('installs')}
                              >
                                <div className="flex items-center gap-2">
                                  Total Installs
                                  <SortIcon column="installs" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('avgCPI') && (
                              <SortableColumnHeader 
                                id="avgCPI" 
                                sortable 
                                onSort={() => handleSort('avgCPI')}
                              >
                                <div className="flex items-center gap-2">
                                  Avg CPI
                                  <SortIcon column="avgCPI" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('avgCTR') && (
                              <SortableColumnHeader 
                                id="avgCTR" 
                                sortable 
                                onSort={() => handleSort('avgCTR')}
                              >
                                <div className="flex items-center gap-2">
                                  Avg CTR
                                  <SortIcon column="avgCTR" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('avgCPC') && (
                              <SortableColumnHeader 
                                id="avgCPC" 
                                sortable 
                                onSort={() => handleSort('avgCPC')}
                              >
                                <div className="flex items-center gap-2">
                                  Avg CPC
                                  <SortIcon column="avgCPC" />
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
                        {apps.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={columnOrder.length} className="text-center py-8">
                              No apps found matching your criteria.
                            </TableCell>
                          </TableRow>
                        ) : (
                          apps.map((app, index) => (
                            <TableRow key={app.id || index}>
                              {columnOrder.includes('name') && (
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="max-w-[200px] truncate">
                                      {app.name}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-mint-100 dark:hover:bg-mint-900"
                                      onClick={() => copyAppName(app.name, app.id)}
                                    >
                                      {copiedId === app.id ? (
                                        <CheckCircle className="h-3 w-3 text-mint-600" />
                                      ) : (
                                        <Copy className="h-3 w-3 text-muted-foreground hover:text-mint-600" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('platform') && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {app.platform === 'iOS' ? (
                                      <Smartphone className="h-4 w-4 text-royal-600" />
                                    ) : (
                                      <Globe className="h-4 w-4 text-peach-600" />
                                    )}
                                    <Badge variant="outline" className="bg-lilac-50 text-lilac-700 border-lilac-200 dark:bg-lilac-900/20 dark:text-lilac-300 dark:border-lilac-700">
                                      {app.platform}
                                    </Badge>
                                  </div>
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('campaigns') && (
                                <TableCell className="text-center">
                                  <Badge variant="secondary" className="bg-mint-50 text-mint-700 dark:bg-mint-900/20 dark:text-mint-300">
                                    {app.campaignsCount}
                                  </Badge>
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('creatives') && (
                                <TableCell className="text-center">
                                  <Badge variant="secondary" className="bg-royal-50 text-royal-700 dark:bg-royal-900/20 dark:text-royal-300">
                                    {app.creativesCount}
                                  </Badge>
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('spend') && (
                                <TableCell className="text-right font-semibold">
                                  ${app.totalSpend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('installs') && (
                                <TableCell className="text-right">
                                  {app.totalInstalls.toLocaleString()}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('avgCPI') && (
                                <TableCell className="text-right">
                                  ${app.avgCPI.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('avgCTR') && (
                                <TableCell className="text-right">
                                  {app.avgCTR.toFixed(2)}%
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('avgCPC') && (
                                <TableCell className="text-right">
                                  ${app.avgCPC.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
                                      <DropdownMenuItem onClick={() => toggleDetails(app.id)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        {showDetails[app.id] ? 'Hide Details' : 'View Details'}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Campaigns
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