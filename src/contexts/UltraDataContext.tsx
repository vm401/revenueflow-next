import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  UltraProcessedCSVData, 
  UltraCampaignData, 
  UltraCreativeData, 
  UltraExchangeData, 
  UltraInventoryData, 
  UltraAppData 
} from '@/lib/ultraCSVProcessor';
import { useToast } from "@/hooks/use-toast";

interface UltraDataContextType {
  // Data state
  data: UltraProcessedCSVData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setData: (data: UltraProcessedCSVData) => void;
  clearData: () => void;
  
  // Filtered data
  getFilteredCampaigns: (filters: UltraCampaignFilters) => UltraCampaignData[];
  getFilteredCreatives: (filters: UltraCreativeFilters) => UltraCreativeData[];
  getFilteredApps: (filters: UltraAppFilters) => UltraAppData[];
  getFilteredExchanges: (filters: UltraExchangeFilters) => UltraExchangeData[];
  getFilteredInventory: (filters: UltraInventoryFilters) => UltraInventoryData[];
  
  // Aggregated data
  getUltraSummary: () => UltraSummary;
  
  // Data persistence
  saveToStorage: () => void;
  loadFromStorage: () => boolean;
  
  // Data export
  exportData: (format: 'csv' | 'json') => void;
  
  // Date range info
  getDateRange: () => { minDate: string; maxDate: string } | null;
}

export interface UltraCampaignFilters {
  search?: string;
  country?: string;
  app?: string;
  exchange?: string;
  os?: string;
  dateFrom?: string;
  dateTo?: string;
  minSpend?: number;
  maxSpend?: number;
  minInstalls?: number;
  maxInstalls?: number;
  minCTR?: number;
  maxCTR?: number;
  minCPI?: number;
  maxCPI?: number;
  sortBy?: 'name' | 'spend' | 'installs' | 'cpi' | 'ctr' | 'impressions' | 'clicks' | 'date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UltraCreativeFilters {
  search?: string;
  campaign?: string;
  type?: string;
  format?: string;
  country?: string;
  exchange?: string;
  minSpend?: number;
  maxSpend?: number;
  minInstalls?: number;
  maxInstalls?: number;
  minCTR?: number;
  maxCTR?: number;
  sortBy?: 'name' | 'spend' | 'installs' | 'cpi' | 'ctr' | 'impressions' | 'clicks';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UltraAppFilters {
  search?: string;
  platform?: string;
  exchange?: string;
  minSpend?: number;
  maxSpend?: number;
  minInstalls?: number;
  maxInstalls?: number;
  sortBy?: 'name' | 'spend' | 'installs' | 'avgCPI' | 'avgCTR' | 'avgCPC';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UltraExchangeFilters {
  search?: string;
  type?: string;
  country?: string;
  app?: string;
  minSpend?: number;
  maxSpend?: number;
  minInstalls?: number;
  maxInstalls?: number;
  sortBy?: 'name' | 'spend' | 'installs' | 'avgCPI' | 'avgCTR' | 'avgCPC';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UltraInventoryFilters {
  search?: string;
  app?: string;
  trafficType?: string;
  platform?: string;
  exchange?: string;
  minSpend?: number;
  maxSpend?: number;
  minInstalls?: number;
  maxInstalls?: number;
  sortBy?: 'appTitle' | 'spend' | 'installs' | 'cpi' | 'ctr' | 'impressions' | 'clicks';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UltraSummary {
  totalCampaigns: number;
  totalCreatives: number;
  totalApps: number;
  totalExchanges: number;
  totalInventory: number;
  
  totalSpend: number;
  totalInstalls: number;
  totalImpressions: number;
  totalClicks: number;
  totalActions: number;
  
  avgCPI: number;
  avgCTR: number;
  avgCPC: number;
  avgIPM: number;
  avgVTR: number;
  
  // Performance metrics
  totalRevenue: number;
  avgROAS: number;
  avgRetention: number;
}

const UltraDataContext = createContext<UltraDataContextType | undefined>(undefined);

export const useUltraData = () => {
  const context = useContext(UltraDataContext);
  if (context === undefined) {
    throw new Error('useUltraData must be used within an UltraDataProvider');
  }
  return context;
};

interface UltraDataProviderProps {
  children: ReactNode;
}

export const UltraDataProvider: React.FC<UltraDataProviderProps> = ({ children }) => {
  const [data, setDataState] = useState<UltraProcessedCSVData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 🎯 ULTRA FILTERED CAMPAIGNS
  const getFilteredCampaigns = (filters: UltraCampaignFilters): UltraCampaignData[] => {
    if (!data) return [];
    
    let filtered = [...data.campaigns];
    
    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.targetApp.toLowerCase().includes(searchLower) ||
        campaign.countries.some(country => country.toLowerCase().includes(searchLower)) ||
        campaign.campaignId.toLowerCase().includes(searchLower) ||
        campaign.type.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(campaign => campaign.countries.includes(filters.country!));
    }
    
    if (filters.app && filters.app !== 'all') {
      filtered = filtered.filter(campaign => campaign.targetApp === filters.app);
    }
    
    if (filters.exchange && filters.exchange !== 'all') {
      filtered = filtered.filter(campaign => 
        campaign.exchanges.some(e => e.exchange === filters.exchange)
      );
    }
    
    if (filters.os && filters.os !== 'all') {
      filtered = filtered.filter(campaign => campaign.os.includes(filters.os!));
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
    
    if (filters.minInstalls !== undefined) {
      filtered = filtered.filter(campaign => campaign.totalInstalls >= filters.minInstalls!);
    }
    
    if (filters.maxInstalls !== undefined) {
      filtered = filtered.filter(campaign => campaign.totalInstalls <= filters.maxInstalls!);
    }
    
    if (filters.minCTR !== undefined) {
      filtered = filtered.filter(campaign => campaign.ctr >= filters.minCTR!);
    }
    
    if (filters.maxCTR !== undefined) {
      filtered = filtered.filter(campaign => campaign.ctr <= filters.maxCTR!);
    }
    
    if (filters.minCPI !== undefined) {
      filtered = filtered.filter(campaign => campaign.cpi >= filters.minCPI!);
    }
    
    if (filters.maxCPI !== undefined) {
      filtered = filtered.filter(campaign => campaign.cpi <= filters.maxCPI!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (filters.sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
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
          case 'impressions':
            aVal = a.totalImpressions;
            bVal = b.totalImpressions;
            break;
          case 'clicks':
            aVal = a.totalClicks;
            bVal = b.totalClicks;
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

  // 🎯 ULTRA FILTERED CREATIVES
  const getFilteredCreatives = (filters: UltraCreativeFilters): UltraCreativeData[] => {
    if (!data) {
      console.log('🚨 getFilteredCreatives: NO DATA');
      return [];
    }
    
    console.log('🔍 getFilteredCreatives:', {
      totalCreatives: data.creatives?.length || 0,
      totalCampaigns: data.campaigns?.length || 0,
      filters,
      sampleCreative: data.creatives?.[0],
      sampleCampaign: data.campaigns?.[0]
    });
    
    let filtered = [...data.creatives];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(creative => 
        creative.name.toLowerCase().includes(searchLower) ||
        creative.campaignName.toLowerCase().includes(searchLower) ||
        creative.type.toLowerCase().includes(searchLower) ||
        creative.format.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.campaign && filters.campaign !== 'all') {
      console.log('🎯 Filtering by campaign:', filters.campaign);
      console.log('🔍 Sample creative campaignId:', data.creatives?.[0]?.campaignId);
      filtered = filtered.filter(creative => creative.campaignId === filters.campaign);
      console.log('📊 After campaign filter:', filtered.length);
    }
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(creative => creative.type === filters.type);
    }
    
    if (filters.format && filters.format !== 'all') {
      filtered = filtered.filter(creative => creative.format === filters.format);
    }
    
    if (filters.country && filters.country !== 'all') {
      console.log('🌍 Filtering by country:', filters.country);
      console.log('🔍 Sample campaign countries:', data.campaigns?.[0]?.countries);
      // Filter creatives by campaign country
      filtered = filtered.filter(creative => 
        data.campaigns.some(campaign => 
          campaign.id === creative.campaignId &&
          campaign.countries.includes(filters.country!)
        )
      );
      console.log('📊 After country filter:', filtered.length);
    }
    
    if (filters.exchange && filters.exchange !== 'all') {
      filtered = filtered.filter(creative => 
        creative.exchanges.some(e => e.exchange === filters.exchange)
      );
    }
    
    if (filters.minSpend !== undefined) {
      filtered = filtered.filter(creative => creative.totalSpend >= filters.minSpend!);
    }
    
    if (filters.maxSpend !== undefined) {
      filtered = filtered.filter(creative => creative.totalSpend <= filters.maxSpend!);
    }
    
    if (filters.minInstalls !== undefined) {
      filtered = filtered.filter(creative => creative.totalInstalls >= filters.minInstalls!);
    }
    
    if (filters.maxInstalls !== undefined) {
      filtered = filtered.filter(creative => creative.totalInstalls <= filters.maxInstalls!);
    }
    
    if (filters.minCTR !== undefined) {
      filtered = filtered.filter(creative => creative.ctr >= filters.minCTR!);
    }
    
    if (filters.maxCTR !== undefined) {
      filtered = filtered.filter(creative => creative.ctr <= filters.maxCTR!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (filters.sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
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
          case 'impressions':
            aVal = a.totalImpressions;
            bVal = b.totalImpressions;
            break;
          case 'clicks':
            aVal = a.totalClicks;
            bVal = b.totalClicks;
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

  // 🎯 ULTRA FILTERED APPS
  const getFilteredApps = (filters: UltraAppFilters): UltraAppData[] => {
    if (!data) return [];
    
    let filtered = [...data.apps];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchLower) ||
        app.appId.toLowerCase().includes(searchLower) ||
        app.platform.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.platform && filters.platform !== 'all') {
      filtered = filtered.filter(app => app.platform === filters.platform);
    }
    
    if (filters.exchange && filters.exchange !== 'all') {
      // Filter apps that have campaigns with this exchange
      filtered = filtered.filter(app => 
        data.campaigns.some(campaign => 
          campaign.targetAppId === app.appId && 
          campaign.exchanges.some(e => e.exchange === filters.exchange)
        )
      );
    }
    
    if (filters.minSpend !== undefined) {
      filtered = filtered.filter(app => app.totalSpend >= filters.minSpend!);
    }
    
    if (filters.maxSpend !== undefined) {
      filtered = filtered.filter(app => app.totalSpend <= filters.maxSpend!);
    }
    
    if (filters.minInstalls !== undefined) {
      filtered = filtered.filter(app => app.totalInstalls >= filters.minInstalls!);
    }
    
    if (filters.maxInstalls !== undefined) {
      filtered = filtered.filter(app => app.totalInstalls <= filters.maxInstalls!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (filters.sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'spend':
            aVal = a.totalSpend;
            bVal = b.totalSpend;
            break;
          case 'installs':
            aVal = a.totalInstalls;
            bVal = b.totalInstalls;
            break;
          case 'avgCPI':
            aVal = a.avgCPI;
            bVal = b.avgCPI;
            break;
          case 'avgCTR':
            aVal = a.avgCTR;
            bVal = b.avgCTR;
            break;
          case 'avgCPC':
            aVal = a.avgCPC;
            bVal = b.avgCPC;
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

  // 🎯 ULTRA FILTERED EXCHANGES
  const getFilteredExchanges = (filters: UltraExchangeFilters): UltraExchangeData[] => {
    if (!data) return [];
    
    let filtered = [...data.exchanges];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(exchange => 
        exchange.name.toLowerCase().includes(searchLower) ||
        exchange.type.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(exchange => exchange.type === filters.type);
    }
    
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(exchange => 
        data.campaigns.some(campaign => 
          campaign.exchanges.some(e => e.exchange === exchange.name) &&
          campaign.countries.includes(filters.country!)
        )
      );
    }
    
    if (filters.app && filters.app !== 'all') {
      filtered = filtered.filter(exchange => 
        data.campaigns.some(campaign => 
          campaign.exchanges.some(e => e.exchange === exchange.name) &&
          campaign.targetApp === filters.app
        )
      );
    }
    
    if (filters.minSpend !== undefined) {
      filtered = filtered.filter(exchange => exchange.totalSpend >= filters.minSpend!);
    }
    
    if (filters.maxSpend !== undefined) {
      filtered = filtered.filter(exchange => exchange.totalSpend <= filters.maxSpend!);
    }
    
    if (filters.minInstalls !== undefined) {
      filtered = filtered.filter(exchange => exchange.totalInstalls >= filters.minInstalls!);
    }
    
    if (filters.maxInstalls !== undefined) {
      filtered = filtered.filter(exchange => exchange.totalInstalls <= filters.maxInstalls!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (filters.sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'spend':
            aVal = a.totalSpend;
            bVal = b.totalSpend;
            break;
          case 'installs':
            aVal = a.totalInstalls;
            bVal = b.totalInstalls;
            break;
          case 'avgCPI':
            aVal = a.avgCPI;
            bVal = b.avgCPI;
            break;
          case 'avgCTR':
            aVal = a.avgCTR;
            bVal = b.avgCTR;
            break;
          case 'avgCPC':
            aVal = a.avgCPC;
            bVal = b.avgCPC;
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

  // 🎯 ULTRA FILTERED INVENTORY
  const getFilteredInventory = (filters: UltraInventoryFilters): UltraInventoryData[] => {
    if (!data) return [];
    
    let filtered = [...data.inventory];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(inventory => 
        inventory.appTitle.toLowerCase().includes(searchLower) ||
        inventory.appId.toLowerCase().includes(searchLower) ||
        inventory.trafficType.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.app && filters.app !== 'all') {
      filtered = filtered.filter(inventory => inventory.appId === filters.app);
    }
    
    if (filters.trafficType && filters.trafficType !== 'all') {
      filtered = filtered.filter(inventory => inventory.trafficType === filters.trafficType);
    }
    
    if (filters.platform && filters.platform !== 'all') {
      filtered = filtered.filter(inventory => inventory.platform === filters.platform);
    }
    
    if (filters.exchange && filters.exchange !== 'all') {
      // Filter inventory that has campaigns with this exchange
      filtered = filtered.filter(inventory => 
        data.campaigns.some(campaign => 
          campaign.targetAppId === inventory.appId && 
          campaign.exchanges.some(e => e.exchange === filters.exchange)
        )
      );
    }
    
    if (filters.minSpend !== undefined) {
      filtered = filtered.filter(inventory => inventory.totalSpend >= filters.minSpend!);
    }
    
    if (filters.maxSpend !== undefined) {
      filtered = filtered.filter(inventory => inventory.totalSpend <= filters.maxSpend!);
    }
    
    if (filters.minInstalls !== undefined) {
      filtered = filtered.filter(inventory => inventory.totalInstalls >= filters.minInstalls!);
    }
    
    if (filters.maxInstalls !== undefined) {
      filtered = filtered.filter(inventory => inventory.totalInstalls <= filters.maxInstalls!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch (filters.sortBy) {
          case 'appTitle':
            aVal = a.appTitle.toLowerCase();
            bVal = b.appTitle.toLowerCase();
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
          case 'impressions':
            aVal = a.totalImpressions;
            bVal = b.totalImpressions;
            break;
          case 'clicks':
            aVal = a.totalClicks;
            bVal = b.totalClicks;
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

  // 🎯 ULTRA SUMMARY
  const getUltraSummary = (): UltraSummary => {
    if (!data) {
      return {
        totalCampaigns: 0,
        totalCreatives: 0,
        totalApps: 0,
        totalExchanges: 0,
        totalInventory: 0,
        totalSpend: 0,
        totalInstalls: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalActions: 0,
        avgCPI: 0,
        avgCTR: 0,
        avgCPC: 0,
        avgIPM: 0,
        avgVTR: 0,
        totalRevenue: 0,
        avgROAS: 0,
        avgRetention: 0
      };
    }
    
    return data.summary;
  };

  // Actions
  const setData = (newData: UltraProcessedCSVData) => {
    setDataState(newData);
    setError(null);
    saveToStorage();
  };

  const clearData = () => {
    setDataState(null);
    setError(null);
    localStorage.removeItem('ultraData');
  };

  // Data persistence
  const saveToStorage = () => {
    if (data) {
      try {
        localStorage.setItem('ultraData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to save data to storage:', error);
      }
    }
  };

  const loadFromStorage = (): boolean => {
    try {
      const stored = localStorage.getItem('ultraData');
      if (stored) {
        const parsedData = JSON.parse(stored);
        setDataState(parsedData);
        return true;
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error);
    }
    return false;
  };

  // Data export
  const exportData = (format: 'csv' | 'json') => {
    if (!data) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }

    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ultra-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvData = convertToCSV(data);
        const dataBlob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ultra-data-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Failed to export data: ${error}`,
        variant: "destructive"
      });
    }
  };

  // Convert data to CSV format
  const convertToCSV = (data: UltraProcessedCSVData): string => {
    // Simple CSV conversion for campaigns
    const headers = ['Campaign Name', 'Campaign ID', 'Target App', 'Countries', 'OS', 'Spend', 'Installs', 'CPI', 'CTR', 'Impressions', 'Clicks'];
    const rows = data.campaigns.map(campaign => [
      campaign.name,
      campaign.campaignId,
      campaign.targetApp,
      campaign.countries.join(', '),
      campaign.os.join(', '),
      campaign.totalSpend,
      campaign.totalInstalls,
      campaign.cpi,
      campaign.ctr,
      campaign.totalImpressions,
      campaign.totalClicks
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  // Load data from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Get date range from data
  const getDateRange = (): { minDate: string; maxDate: string } | null => {
    if (!data?.campaigns?.length) return null;
    
    const dates = data.campaigns.flatMap(campaign => 
      campaign.dailyData?.map(d => d.date) || []
    ).filter(Boolean);
    
    if (dates.length === 0) return null;
    
    const sortedDates = dates.sort();
    return {
      minDate: sortedDates[0],
      maxDate: sortedDates[sortedDates.length - 1]
    };
  };

  const value: UltraDataContextType = {
    data,
    isLoading,
    error,
    setData,
    clearData,
    getFilteredCampaigns,
    getFilteredCreatives,
    getFilteredApps,
    getFilteredExchanges,
    getFilteredInventory,
    getUltraSummary,
    saveToStorage,
    loadFromStorage,
    exportData,
    getDateRange
  };

  return (
    <UltraDataContext.Provider value={value}>
      {children}
    </UltraDataContext.Provider>
  );
};
