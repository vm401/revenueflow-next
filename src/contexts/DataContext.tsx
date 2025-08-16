import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProcessedCSVData, CampaignData, CreativeData, ExchangeData, InventoryData, AppData } from '@/lib/realCSVProcessor';
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  // Data state
  data: ProcessedCSVData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: ProcessedCSVData) => void;
  clearData: () => void;
  
  // Filtered data
  getFilteredCampaigns: (filters: CampaignFilters) => CampaignData[];
  getFilteredCreatives: (filters: CreativeFilters) => CreativeData[];
  
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
  sortBy?: 'date' | 'spend' | 'installs' | 'cpi' | 'ctr' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreativeFilters {
  search?: string;
  campaign?: string;
  type?: string;
  format?: string;
  minSpend?: number;
  maxSpend?: number;
  sortBy?: 'spend' | 'installs' | 'cpi' | 'ctr';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardSummary {
  totalSpend: number;
  totalInstalls: number;
  totalImpressions: number;
  totalClicks: number;
  totalCampaigns: number;
  totalCreatives: number;
  totalExchanges: number;
  totalInventory: number;
  activeApps: number;
  activeCountries: number;
  avgCPI: number;
  avgCTR: number;
  avgCPC: number;
}

export interface AppSummary {
  id: string;
  name: string;
  platform: string;
  totalSpend: number;
  totalInstalls: number;
  totalImpressions: number;
  avgCPI: number;
  avgCTR: number;
  campaignsCount: number;
  creativesCount: number;
  status: string;
}

export interface ExchangeSummary {
  id: string;
  name: string;
  type: string;
  totalSpend: number;
  totalInstalls: number;
  totalImpressions: number;
  avgCPI: number;
  avgCTR: number;
  avgCPC: number;
  campaignsCount: number;
  creativesCount: number;
  status: string;
}

export interface InventorySummary {
  id: string;
  appBundle: string;
  appTitle: string;
  trafficType: string;
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  ctr: number;
  cpi: number;
  quality: 'high' | 'medium' | 'low';
  campaignsCount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'revenueflow_csv_data';

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [data, setDataState] = useState<ProcessedCSVData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  const setData = (newData: ProcessedCSVData) => {
    setDataState(newData);
    setError(null);
    saveToStorage();
    
    toast({
      title: "✅ CSV Processed Successfully",
      description: `${newData.campaigns.length} campaigns, ${newData.creatives.length} creatives, ${newData.exchanges.length} exchanges, ${newData.inventory.length} inventory`,
    });
  };

  const clearData = () => {
    setDataState(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    
    toast({
      title: "🗑️ Data Cleared",
      description: "All processed data has been removed",
    });
  };

  const saveToStorage = () => {
    if (data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('💾 Data saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save data to localStorage:', error);
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
        const parsedData = JSON.parse(stored) as ProcessedCSVData;
        setDataState(parsedData);
        console.log('📂 Data loaded from localStorage');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to load data from localStorage:', error);
      setError('Failed to load stored data');
    }
    return false;
  };

  // 🎯 FILTER CAMPAIGNS
  const getFilteredCampaigns = (filters: CampaignFilters): CampaignData[] => {
    if (!data) return [];
    
    let filtered = [...data.campaigns];
    
    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.targetApp.toLowerCase().includes(searchLower) ||
        campaign.countries.some(country => country.toLowerCase().includes(searchLower)) ||
        campaign.campaignId.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(campaign => campaign.countries.includes(filters.country!));
    }
    
    if (filters.app && filters.app !== 'all') {
      filtered = filtered.filter(campaign => campaign.targetApp === filters.app);
    }
    
    // Date filtering
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.startDate || campaign.endDate || campaign.lastUpdated);
        return campaignDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.startDate || campaign.endDate || campaign.lastUpdated);
        return campaignDate <= toDate;
      });
    }
    
    if (filters.minSpend !== undefined) {
      filtered = filtered.filter(campaign => campaign.totalSpend >= filters.minSpend!);
    }
    
    if (filters.maxSpend !== undefined) {
      filtered = filtered.filter(campaign => campaign.totalSpend <= filters.maxSpend!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (filters.sortBy) {
          case 'date':
            aVal = new Date(a.startDate || a.endDate || a.lastUpdated).getTime();
            bVal = new Date(b.startDate || b.endDate || b.lastUpdated).getTime();
            break;
          case 'spend':
            aVal = a.totalSpend;
            bVal = b.totalSpend;
            break;
          case 'installs':
            aVal = a.totalInstalls;
            bVal = b.totalInstalls;
            break;
          case 'cpi':
            aVal = a.cpi;
            bVal = b.cpi;
            break;
          case 'ctr':
            aVal = a.ctr;
            bVal = b.ctr;
            break;
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          default:
            return 0;
        }
        
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortOrder === 'desc' ? -result : result;
      });
    }
    
    // Apply pagination
    if (filters.page && filters.limit) {
      const startIndex = (filters.page - 1) * filters.limit;
      filtered = filtered.slice(startIndex, startIndex + filters.limit);
    }
    
    return filtered;
  };

  // 🎨 FILTER CREATIVES
  const getFilteredCreatives = (filters: CreativeFilters): CreativeData[] => {
    if (!data) return [];
    
    let filtered = [...data.creatives];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(creative => 
        creative.name.toLowerCase().includes(searchLower) ||
        creative.campaignName.toLowerCase().includes(searchLower) ||
        creative.type.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.campaign && filters.campaign !== 'all') {
      filtered = filtered.filter(creative => creative.campaignId === filters.campaign);
    }
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(creative => creative.type === filters.type);
    }
    
    if (filters.format && filters.format !== 'all') {
      filtered = filtered.filter(creative => creative.format === filters.format);
    }
    
    if (filters.minSpend !== undefined) {
      filtered = filtered.filter(creative => creative.spend >= filters.minSpend!);
    }
    
    if (filters.maxSpend !== undefined) {
      filtered = filtered.filter(creative => creative.spend <= filters.maxSpend!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (filters.sortBy) {
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
          case 'ctr':
            aVal = a.ctr;
            bVal = b.ctr;
            break;
          default:
            return 0;
        }
        
        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return filters.sortOrder === 'desc' ? -result : result;
      });
    }
    
    // Apply pagination
    if (filters.page && filters.limit) {
      const startIndex = (filters.page - 1) * filters.limit;
      filtered = filtered.slice(startIndex, startIndex + filters.limit);
    }
    
    return filtered;
  };

  // 📊 DASHBOARD SUMMARY
  const getDashboardSummary = (): DashboardSummary => {
    if (!data) {
      return {
        totalSpend: 0,
        totalInstalls: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalCampaigns: 0,
        totalCreatives: 0,
        totalExchanges: 0,
        totalInventory: 0,
        activeApps: 0,
        activeCountries: 0,
        avgCPI: 0,
        avgCTR: 0,
        avgCPC: 0
      };
    }

    return {
      totalSpend: data.summary.totalSpend,
      totalInstalls: data.summary.totalInstalls,
      totalImpressions: data.summary.totalImpressions,
      totalClicks: data.summary.totalClicks,
      totalCampaigns: data.summary.totalCampaigns,
      totalCreatives: data.summary.totalCreatives,
      totalExchanges: data.summary.totalExchanges,
      totalInventory: data.summary.totalInventory,
      activeApps: data.summary.totalApps,
      activeCountries: data.countries.length,
      avgCPI: data.summary.avgCPI,
      avgCTR: data.summary.avgCTR,
      avgCPC: data.summary.avgCPC
    };
  };

  // 📱 APP SUMMARIES
  const getAppSummaries = (): AppSummary[] => {
    if (!data) return [];
    
    return data.apps.map(app => ({
      id: app.id,
      name: app.name,
      platform: app.platform,
      totalSpend: app.totalSpend,
      totalInstalls: app.totalInstalls,
      totalImpressions: app.totalImpressions,
      avgCPI: app.cpi,
      avgCTR: app.ctr,
      campaignsCount: app.campaignsCount,
      creativesCount: app.creativesCount,
      status: app.status
    }));
  };

  // 🔄 EXCHANGE SUMMARIES
  const getExchangeSummaries = (): ExchangeSummary[] => {
    if (!data) return [];
    
    return data.exchanges.map(exchange => ({
      id: exchange.id,
      name: exchange.name,
      type: exchange.type,
      totalSpend: exchange.totalSpend,
      totalInstalls: exchange.totalInstalls,
      totalImpressions: exchange.totalImpressions,
      avgCPI: exchange.cpi,
      avgCTR: exchange.ctr,
      avgCPC: exchange.averageCpc,
      campaignsCount: exchange.campaignsCount,
      creativesCount: exchange.creativesCount,
      status: exchange.status
    }));
  };

  // 📦 INVENTORY SUMMARIES
  const getInventorySummaries = (): InventorySummary[] => {
    if (!data) return [];
    
    return data.inventory.map(item => ({
      id: item.id,
      appBundle: item.appBundle,
      appTitle: item.appTitle,
      trafficType: item.trafficType,
      impressions: item.impressions,
      clicks: item.clicks,
      installs: item.installs,
      spend: item.spend,
      ctr: item.ctr,
      cpi: item.cpi,
      quality: item.quality,
      campaignsCount: item.campaignsCount
    }));
  };

  // 📤 EXPORT DATA
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

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `revenueflow-data-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // CSV export for campaigns
        const csvHeaders = ['Campaign ID', 'Campaign Name', 'Type', 'Countries', 'Target App', 'Total Spend', 'Total Installs', 'Total Impressions', 'CPI', 'CTR', 'Status'];
        const csvRows = data.campaigns.map(campaign => [
          campaign.campaignId,
          campaign.name,
          campaign.type,
          campaign.countries.join(';'),
          campaign.targetApp,
          campaign.totalSpend.toString(),
          campaign.totalInstalls.toString(),
          campaign.totalImpressions.toString(),
          campaign.cpi.toFixed(2),
          campaign.ctr.toFixed(2),
          campaign.status
        ]);
        
        content = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
        filename = `revenueflow-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "📥 Export Complete",
        description: `Data exported as ${filename}`,
      });
    } catch (error) {
      console.error('❌ Export failed:', error);
      toast({
        title: "Export Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const contextValue: DataContextType = {
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
    <DataContext.Provider value={contextValue}>
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