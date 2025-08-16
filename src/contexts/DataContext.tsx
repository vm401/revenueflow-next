import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProcessedData, CampaignRow, CreativeRow } from '@/lib/csvProcessor';
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  // Data state
  data: ProcessedData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: ProcessedData) => void;
  clearData: () => void;
  
  // Filtered data
  getFilteredCampaigns: (filters: CampaignFilters) => CampaignRow[];
  getFilteredCreatives: (filters: CreativeFilters) => CreativeRow[];
  
  // Aggregated data
  getDashboardSummary: () => DashboardSummary;
  getAppSummaries: () => AppSummary[];
  getExchangeSummaries: () => ExchangeSummary[];
  getInventorySummaries: () => InventorySummary[];
  
  // Data persistence
  saveToStorage: () => void;
  loadFromStorage: () => boolean;
  
  // Data export
  exportData: (format: 'csv' | 'json') => void;
}

export interface CampaignFilters {
  search?: string;
  country?: string;
  app?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  minSpend?: number;
  maxSpend?: number;
  sortBy?: 'date' | 'spend' | 'installs' | 'cpi';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreativeFilters {
  search?: string;
  campaign?: string;
  app?: string;
  format?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'spend' | 'installs' | 'cpi';
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardSummary {
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  totalCampaigns: number;
  totalCreatives: number;
  activeApps: number;
  activeCountries: number;
  activeSources: number;
  dateRange: { start: string; end: string };
  lastUpdated: string;
}

export interface AppSummary {
  name: string;
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  campaignCount: number;
  countries: string[];
  sources: string[];
  lastActivity: string;
}

export interface ExchangeSummary {
  name: string;
  type: string;
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  campaignCount: number;
  countries: string[];
  apps: string[];
}

export interface InventorySummary {
  name: string;
  source: string;
  type: string;
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  countries: string[];
  quality: 'High' | 'Medium' | 'Low';
  fraudRate: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'moloco_crm_data';

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [data, setDataState] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  const setData = (newData: ProcessedData) => {
    setDataState(newData);
    setError(null);
    saveToStorage();
    
    toast({
      title: "Data Updated",
      description: `Processed ${newData.campaigns.length + newData.creatives.length} rows from ${newData.fileNames.length} files`,
    });
  };

  const clearData = () => {
    setDataState(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    
    toast({
      title: "Data Cleared",
      description: "All processed data has been removed",
    });
  };

  const saveToStorage = () => {
    if (data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to localStorage:', error);
        toast({
          title: "Storage Error",
          description: "Failed to save data locally",
          variant: "destructive",
        });
      }
    }
  };

  const loadFromStorage = (): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored) as ProcessedData;
        setDataState(parsedData);
        return true;
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      setError('Failed to load stored data');
    }
    return false;
  };

  // Filter campaigns with advanced filtering
  const getFilteredCampaigns = (filters: CampaignFilters): CampaignRow[] => {
    if (!data) return [];

    let filtered = [...data.campaigns];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.campaign_name.toLowerCase().includes(searchLower) ||
        campaign.app_name.toLowerCase().includes(searchLower) ||
        campaign.country.toLowerCase().includes(searchLower)
      );
    }

    // Filters
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(campaign => campaign.country === filters.country);
    }

    if (filters.app && filters.app !== 'all') {
      filtered = filtered.filter(campaign => campaign.app_name === filters.app);
    }

    if (filters.source && filters.source !== 'all') {
      filtered = filtered.filter(campaign => campaign.source === filters.source);
    }

    // Date range
    if (filters.dateFrom) {
      filtered = filtered.filter(campaign => campaign.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(campaign => campaign.date <= filters.dateTo!);
    }

    // Spend range
    if (filters.minSpend !== undefined) {
      filtered = filtered.filter(campaign => campaign.spend >= filters.minSpend!);
    }

    if (filters.maxSpend !== undefined) {
      filtered = filtered.filter(campaign => campaign.spend <= filters.maxSpend!);
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (filters.sortBy) {
          case 'date':
            aVal = new Date(a.date);
            bVal = new Date(b.date);
            break;
          case 'spend':
            aVal = a.spend;
            bVal = b.spend;
            break;
          case 'installs':
            aVal = a.installs;
            bVal = b.installs;
            break;
          case 'cpi':
            aVal = a.cpi;
            bVal = b.cpi;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }

    // Pagination
    if (filters.page && filters.limit) {
      const start = (filters.page - 1) * filters.limit;
      filtered = filtered.slice(start, start + filters.limit);
    }

    return filtered;
  };

  // Filter creatives
  const getFilteredCreatives = (filters: CreativeFilters): CreativeRow[] => {
    if (!data) return [];

    let filtered = [...data.creatives];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(creative => 
        creative.creative_name.toLowerCase().includes(searchLower) ||
        creative.campaign_name.toLowerCase().includes(searchLower) ||
        creative.app_name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.campaign && filters.campaign !== 'all') {
      filtered = filtered.filter(creative => creative.campaign_name === filters.campaign);
    }

    if (filters.app && filters.app !== 'all') {
      filtered = filtered.filter(creative => creative.app_name === filters.app);
    }

    if (filters.format && filters.format !== 'all') {
      filtered = filtered.filter(creative => creative.format === filters.format);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(creative => creative.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(creative => creative.date <= filters.dateTo!);
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (filters.sortBy) {
          case 'date':
            aVal = new Date(a.date);
            bVal = new Date(b.date);
            break;
          case 'spend':
            aVal = a.spend;
            bVal = b.spend;
            break;
          case 'installs':
            aVal = a.installs;
            bVal = b.installs;
            break;
          case 'cpi':
            aVal = a.cpi;
            bVal = b.cpi;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  };

  // Generate dashboard summary
  const getDashboardSummary = (): DashboardSummary => {
    if (!data) {
      return {
        totalSpend: 0,
        totalInstalls: 0,
        totalActions: 0,
        avgCPI: 0,
        totalCampaigns: 0,
        totalCreatives: 0,
        activeApps: 0,
        activeCountries: 0,
        activeSources: 0,
        dateRange: { start: '', end: '' },
        lastUpdated: ''
      };
    }

    return {
      totalSpend: data.totalSpend,
      totalInstalls: data.totalInstalls,
      totalActions: data.totalActions,
      avgCPI: data.avgCPI,
      totalCampaigns: data.campaigns.length,
      totalCreatives: data.creatives.length,
      activeApps: data.apps.length,
      activeCountries: data.countries.length,
      activeSources: data.sources.length,
      dateRange: data.dateRange,
      lastUpdated: data.processedAt
    };
  };

  // Generate app summaries
  const getAppSummaries = (): AppSummary[] => {
    if (!data) return [];

    const appMap = new Map<string, AppSummary>();

    [...data.campaigns, ...data.creatives].forEach(row => {
      if (!appMap.has(row.app_name)) {
        appMap.set(row.app_name, {
          name: row.app_name,
          totalSpend: 0,
          totalInstalls: 0,
          totalActions: 0,
          avgCPI: 0,
          campaignCount: 0,
          countries: [],
          sources: [],
          lastActivity: row.date
        });
      }

      const app = appMap.get(row.app_name)!;
      app.totalSpend += row.spend;
      app.totalInstalls += row.installs;
      app.totalActions += row.actions || 0;
      app.campaignCount++;
      
      if (!app.countries.includes(row.country)) {
        app.countries.push(row.country);
      }
      
      if (row.source && !app.sources.includes(row.source)) {
        app.sources.push(row.source);
      }

      if (row.date > app.lastActivity) {
        app.lastActivity = row.date;
      }
    });

    // Calculate average CPI
    appMap.forEach(app => {
      app.avgCPI = app.totalInstalls > 0 ? app.totalSpend / app.totalInstalls : 0;
    });

    return Array.from(appMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  };

  // Generate exchange summaries
  const getExchangeSummaries = (): ExchangeSummary[] => {
    if (!data) return [];

    const exchangeMap = new Map<string, ExchangeSummary>();

    [...data.campaigns, ...data.creatives].forEach(row => {
      const source = row.source || 'Unknown';
      
      if (!exchangeMap.has(source)) {
        exchangeMap.set(source, {
          name: source,
          type: getExchangeType(source),
          totalSpend: 0,
          totalInstalls: 0,
          totalActions: 0,
          avgCPI: 0,
          campaignCount: 0,
          countries: [],
          apps: []
        });
      }

      const exchange = exchangeMap.get(source)!;
      exchange.totalSpend += row.spend;
      exchange.totalInstalls += row.installs;
      exchange.totalActions += row.actions || 0;
      exchange.campaignCount++;
      
      if (!exchange.countries.includes(row.country)) {
        exchange.countries.push(row.country);
      }
      
      if (!exchange.apps.includes(row.app_name)) {
        exchange.apps.push(row.app_name);
      }
    });

    // Calculate average CPI
    exchangeMap.forEach(exchange => {
      exchange.avgCPI = exchange.totalInstalls > 0 ? exchange.totalSpend / exchange.totalInstalls : 0;
    });

    return Array.from(exchangeMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  };

  // Generate inventory summaries
  const getInventorySummaries = (): InventorySummary[] => {
    if (!data) return [];

    const inventoryMap = new Map<string, InventorySummary>();

    [...data.campaigns, ...data.creatives].forEach(row => {
      const source = row.source || 'Unknown';
      const key = `${source}_${row.app_name}`;
      
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          name: `${row.app_name} - ${source}`,
          source: source,
          type: getExchangeType(source),
          totalSpend: 0,
          totalInstalls: 0,
          totalActions: 0,
          avgCPI: 0,
          countries: [],
          quality: 'Medium',
          fraudRate: Math.random() * 5 // Mock fraud rate
        });
      }

      const inventory = inventoryMap.get(key)!;
      inventory.totalSpend += row.spend;
      inventory.totalInstalls += row.installs;
      inventory.totalActions += row.actions || 0;
      
      if (!inventory.countries.includes(row.country)) {
        inventory.countries.push(row.country);
      }
    });

    // Calculate CPI and quality
    inventoryMap.forEach(inventory => {
      inventory.avgCPI = inventory.totalInstalls > 0 ? inventory.totalSpend / inventory.totalInstalls : 0;
      
      // Quality based on CPI and fraud rate
      if (inventory.avgCPI < 8.0 && inventory.fraudRate < 3.0) {
        inventory.quality = 'High';
      } else if (inventory.avgCPI < 10.0 && inventory.fraudRate < 5.0) {
        inventory.quality = 'Medium';
      } else {
        inventory.quality = 'Low';
      }
    });

    return Array.from(inventoryMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  };

  // Helper function to determine exchange type
  const getExchangeType = (source: string): string => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('meta') || sourceLower.includes('facebook') || sourceLower.includes('instagram')) {
      return 'Social Media';
    } else if (sourceLower.includes('google')) {
      return 'Search & Display';
    } else if (sourceLower.includes('tiktok')) {
      return 'Social Media';
    } else if (sourceLower.includes('unity')) {
      return 'Gaming';
    } else if (sourceLower.includes('snapchat')) {
      return 'Social Media';
    }
    return 'Unknown';
  };

  // Export data
  const exportData = (format: 'csv' | 'json') => {
    if (!data) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        // Export as CSV
        const campaignHeaders = ['Date', 'Campaign', 'App', 'Country', 'Spend', 'Installs', 'CPI', 'Source'];
        const campaignRows = data.campaigns.map(c => [
          c.date, c.campaign_name, c.app_name, c.country, c.spend.toString(), 
          c.installs.toString(), c.cpi.toFixed(2), c.source || ''
        ]);
        
        content = [campaignHeaders, ...campaignRows].map(row => row.join(',')).join('\n');
        filename = `moloco_crm_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // Export as JSON
        content = JSON.stringify(data, null, 2);
        filename = `moloco_crm_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Data exported as ${filename}`,
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const value: DataContextType = {
    data,
    isLoading,
    error,
    setData,
    clearData,
    getFilteredCampaigns,
    getFilteredCreatives,
    getDashboardSummary,
    getAppSummaries,
    getExchangeSummaries,
    getInventorySummaries,
    saveToStorage,
    loadFromStorage,
    exportData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
