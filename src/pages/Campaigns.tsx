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
import { ExpandableText } from "@/components/ExpandableText";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, FileSpreadsheet, Printer, Mail, Eye, Loader2, RefreshCw, Calendar, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, AlertTriangle, Database, GripVertical, Settings } from "lucide-react";
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

export default function Campaigns() {
  const { data, getFilteredCampaigns, exportData, getDateRange } = useUltraData();
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedApp, setSelectedApp] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'spend' | 'installs' | 'cpi' | 'ctr' | 'name'>('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnOrder, setColumnOrder] = useState([
    'name', 'targetApp', 'countries', 'spend', 'installs', 'cpi', 'ctr', 'impressions', 'clicks', 'roas', 'revenue', 'actions'
  ]);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get filtered campaigns
  const campaigns = useMemo(() => {
    return getFilteredCampaigns({
      search: searchTerm,
      country: selectedCountry,
      app: selectedApp,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: pageSize
    });
  }, [searchTerm, selectedCountry, selectedApp, dateFrom, dateTo, sortBy, sortOrder, currentPage, pageSize, getFilteredCampaigns]);

  // Get total count for pagination
  const totalCampaigns = data?.campaigns?.length || 0;
  const totalPages = Math.ceil(totalCampaigns / pageSize);

  // Get unique countries and apps for filters
  const countries = useMemo(() => {
    if (!data?.campaigns) return [];
    const uniqueCountries = new Set<string>();
    data.campaigns.forEach(campaign => {
      campaign.countries.forEach(country => uniqueCountries.add(country));
    });
    return Array.from(uniqueCountries).sort();
  }, [data?.campaigns]);

  const apps = useMemo(() => {
    if (!data?.campaigns) return [];
    const uniqueApps = new Set(data.campaigns.map(c => c.targetApp));
    return Array.from(uniqueApps).sort();
  }, [data?.campaigns]);

  // Handle sorting
  const handleSort = (column: 'date' | 'spend' | 'installs' | 'cpi' | 'ctr' | 'name') => {
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
      description: `Exporting campaigns data as ${format.toUpperCase()}`,
    });
  };

  // Toggle campaign details
  const toggleDetails = (campaignId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [campaignId]: !prev[campaignId]
    }));
  };

  // Country flags
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸', 'UK': '🇬🇧', 'DE': '🇩🇪', 'CA': '🇨🇦', 'AU': '🇦🇺',
      'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'JP': '🇯🇵', 'KR': '🇰🇷',
      'FRA': '🇫🇷', 'GRC': '🇬🇷', 'GBR': '🇬🇧', 'USA': '🇺🇸', 'CAN': '🇨🇦',
      'AUS': '🇦🇺', 'DEU': '🇩🇪', 'ITA': '🇮🇹', 'ESP': '🇪🇸'
    };
    return flags[country] || '🌍';
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
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage and analyze your advertising campaigns
            </p>
          </div>
          {data && (
            <AnimatedBadge animation="glow" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <AnimatedIcon icon={Database} variant="royal" animation="glow" className="h-3 w-3 mr-1" />
              CSV Data Active
            </AnimatedBadge>
          )}
        </div>

        {/* Filters */}
        <AnimatedCard variant="mint" animation="slide">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter campaigns by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="relative">
                  <AnimatedIcon icon={Search} variant="mint" animation="glow" className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {getCountryFlag(country)} {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger>
                  <SelectValue placeholder="All Apps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Apps</SelectItem>
                  {apps.map((app) => (
                    <SelectItem key={app} value={app}>
                      {app}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                  className="w-auto"
                  min={getDateRange()?.minDate}
                  max={getDateRange()?.maxDate}
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                  className="w-auto"
                  min={getDateRange()?.minDate}
                  max={getDateRange()?.maxDate}
                />
              </div>
              
              {getDateRange() && (
                <div className="text-sm text-muted-foreground">
                  📅 Available: {getDateRange()?.minDate} to {getDateRange()?.maxDate}
                </div>
              )}
              
              <AnimatedButton 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCountry("all");
                  setSelectedApp("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                animation="bounce"
                className="btn-bounce"
              >
                Clear All Filters
              </AnimatedButton>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Campaign Data */}
        <AnimatedCard variant="royal" animation="lift">
          <CardHeader>
            <CardTitle>Campaign Data</CardTitle>
            <CardDescription>
              {data ? `${totalCampaigns} campaigns found` : 'No CSV data loaded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data ? (
                                <Alert>
                    <AnimatedIcon icon={AlertTriangle} variant="peach" animation="glow" className="h-4 w-4" />
                <AlertDescription>
                  No CSV data loaded. Please upload your campaign files to see data here.
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
                                  Campaign Name
                                  <SortIcon column="name" />
                                </div>
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('targetApp') && (
                              <SortableColumnHeader id="targetApp">
                                Target App
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('countries') && (
                              <SortableColumnHeader id="countries">
                                Countries
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
                            
                            {columnOrder.includes('installs') && (
                              <SortableColumnHeader 
                                id="installs" 
                                sortable 
                                onSort={() => handleSort('installs')}
                              >
                                <div className="flex items-center gap-2">
                                  Installs
                                  <SortIcon column="installs" />
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
                            
                            {columnOrder.includes('impressions') && (
                              <SortableColumnHeader id="impressions">
                                Impressions
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('clicks') && (
                              <SortableColumnHeader id="clicks">
                                Clicks
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('roas') && (
                              <SortableColumnHeader id="roas">
                                ROAS
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('revenue') && (
                              <SortableColumnHeader id="revenue">
                                Revenue
                              </SortableColumnHeader>
                            )}
                            
                            {columnOrder.includes('actions') && (
                              <SortableColumnHeader id="actions">
                                Actions
                              </SortableColumnHeader>
                            )}
                          </TableRow>
                        </SortableContext>
                      </TableHeader>
                      <TableBody>
                        {campaigns.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={columnOrder.length} className="text-center py-8">
                              No campaigns found matching your criteria.
                            </TableCell>
                          </TableRow>
                        ) : (
                          campaigns.map((campaign, index) => (
                            <TableRow key={campaign.id || index}>
                              {columnOrder.includes('name') && (
                                <TableCell className="font-medium">
                                  <div className="max-w-[300px]">
                                    <ExpandableText 
                                      text={campaign.name} 
                                      maxLength={40}
                                      className="font-medium"
                                    />
                                  </div>
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('targetApp') && (
                                <TableCell>{campaign.targetApp}</TableCell>
                              )}
                              
                              {columnOrder.includes('countries') && (
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {campaign.countries.slice(0, 2).map(country => (
                                      <div key={country} className="flex items-center gap-1">
                                        <span>{getCountryFlag(country)}</span>
                                        <span className="text-xs">{country}</span>
                                      </div>
                                    ))}
                                    {campaign.countries.length > 2 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{campaign.countries.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('spend') && (
                                <TableCell className="text-right font-semibold">
                                  ${campaign.totalSpend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('installs') && (
                                <TableCell className="text-right">
                                  {campaign.totalInstalls.toLocaleString()}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('cpi') && (
                                <TableCell className="text-right">
                                  ${campaign.cpi.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('ctr') && (
                                <TableCell className="text-right">
                                  {campaign.ctr.toFixed(2)}%
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('impressions') && (
                                <TableCell className="text-right">
                                  {campaign.totalImpressions >= 1000000 
                                    ? (campaign.totalImpressions / 1000000).toFixed(2) + 'm'
                                    : campaign.totalImpressions >= 1000 
                                    ? (campaign.totalImpressions / 1000).toFixed(2) + 'k'
                                    : campaign.totalImpressions.toLocaleString()}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('clicks') && (
                                <TableCell className="text-right">
                                  {campaign.totalClicks >= 1000000 
                                    ? (campaign.totalClicks / 1000000).toFixed(2) + 'm'
                                    : campaign.totalClicks >= 1000 
                                    ? (campaign.totalClicks / 1000).toFixed(2) + 'k'
                                    : campaign.totalClicks.toLocaleString()}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('roas') && (
                                <TableCell className="text-right">
                                  <span className={`font-semibold ${
                                    (campaign.totalSpend > 0 ? (campaign.totalInstalls * campaign.cpi * 1.5) / campaign.totalSpend : 0) >= 2 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : (campaign.totalSpend > 0 ? (campaign.totalInstalls * campaign.cpi * 1.5) / campaign.totalSpend : 0) >= 1
                                      ? 'text-yellow-600 dark:text-yellow-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {campaign.totalSpend > 0 
                                      ? ((campaign.totalInstalls * campaign.cpi * 1.5) / campaign.totalSpend).toFixed(2) + 'x'
                                      : '0.00x'}
                                  </span>
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('revenue') && (
                                <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                                  ${(campaign.totalInstalls * campaign.cpi * 1.5).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </TableCell>
                              )}
                              
                              {columnOrder.includes('actions') && (
                                <TableCell className="text-right font-semibold text-blue-600 dark:text-blue-400">
                                  {(campaign.totalActions || 0).toLocaleString()}
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