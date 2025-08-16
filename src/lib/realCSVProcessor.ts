import Papa from 'papaparse';

export interface ProcessedCSVData {
  campaigns: CampaignData[];
  creatives: CreativeData[];
  apps: AppData[];
  exchanges: ExchangeData[];
  inventory: InventoryData[];
  summary: {
    totalCampaigns: number;
    totalSpend: number;
    totalInstalls: number;
    totalImpressions: number;
    avgCPI: number;
  };
}

export interface CampaignData {
  id: string;
  date: string;
  campaign_name: string;
  campaign_id: string;
  app_name: string;
  country: string;
  os: string;
  exchange: string;
  spend: number;
  installs: number;
  actions: number;
  impressions: number;
  clicks: number;
  cpi: number;
  ctr: number;
  source: string;
}

export interface CreativeData {
  id: string;
  creative_name: string;
  creative_id: string;
  campaign_name: string;
  app_name: string;
  spend: number;
  installs: number;
  cpi: number;
  format: string;
  size: string;
}

export interface AppData {
  name: string;
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  campaignCount: number;
  countries: string[];
}

export interface ExchangeData {
  name: string;
  type: string;
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  countries: string[];
}

export interface InventoryData {
  name: string;
  source: string;
  type: string;
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  countries: string[];
  quality: string;
  fraudRate: number;
}

export const validateRealCSV = async (file: File) => {
  try {
    const text = await file.text();
    const result = Papa.parse(text, { 
      header: false,
      skipEmptyLines: true,
      preview: 5
    });
    
    const rows = result.data as string[][];
    if (rows.length < 2) {
      return {
        isValid: false,
        errors: ['File appears to be empty'],
        preview: rows,
        rowCount: 0
      };
    }

    const headers = rows[0].map(h => String(h).toLowerCase().replace(/"/g, '').trim());
    console.log('Real CSV Headers:', headers);
    
    // Check for known formats
    const isCampaignReport = headers.includes('campaign') && headers.includes('spend') && headers.includes('install');
    const isInventoryReport = headers.includes('inventory traffic') || headers.includes('inventory - app bundle');
    
    if (!isCampaignReport && !isInventoryReport) {
      return {
        isValid: false,
        errors: [
          'Unknown CSV format',
          `Expected campaign or inventory report format`,
          `Found headers: ${headers.slice(0, 5).join(', ')}...`
        ],
        preview: rows,
        rowCount: rows.length - 1
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: [
        isCampaignReport ? 'Campaign report detected' : 'Inventory report detected',
        `${rows.length - 1} data rows found`
      ],
      preview: rows.slice(0, 5),
      rowCount: rows.length - 1
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      preview: [],
      rowCount: 0
    };
  }
};

export const processRealCSV = async (file: File): Promise<ProcessedCSVData> => {
  try {
    const text = await file.text();
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/"/g, '').trim()
    });
    
    const data = result.data as Record<string, any>[];
    console.log(`Processing ${data.length} rows from ${file.name}`);
    console.log('Sample row:', data[0]);
    
    const campaigns: CampaignData[] = [];
    const creatives: CreativeData[] = [];
    
    // Process each row
    data.forEach((row, index) => {
      try {
        // Helper functions
        const getField = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== '') {
              return String(row[name]).replace(/"/g, '').trim();
            }
          }
          return '';
        };
        
        const getNumericField = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            if (row[name] !== undefined && row[name] !== '') {
              const num = parseFloat(String(row[name]).replace(/[,$"]/g, ''));
              return isNaN(num) ? 0 : num;
            }
          }
          return 0;
        };
        
        // Extract common fields
        const campaignName = getField(['campaign', 'campaign name']);
        const campaignId = getField(['campaign id', 'campaign_id']);
        const appName = getField(['app', 'app name', 'inventory - app title']);
        const country = getField(['countries', 'country']);
        const os = getField(['os', 'operating system']);
        const exchange = getField(['exchange', 'inventory traffic']);
        const spend = getNumericField(['spend', 'cost']);
        const installs = getNumericField(['install', 'installs']);
        const actions = getNumericField(['action', 'actions', 'conversion']);
        const impressions = getNumericField(['impression', 'impressions']);
        const clicks = getNumericField(['click', 'clicks']);
        const date = getField(['date', 'day']) || '2025-08-16';
        
        // Calculate CPI
        const cpi = installs > 0 ? spend / installs : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        
        // Create campaign record if we have minimum data
        if (campaignName && (spend > 0 || installs > 0 || impressions > 0)) {
          campaigns.push({
            id: `campaign-${index}`,
            date,
            campaign_name: campaignName,
            campaign_id: campaignId || `id-${index}`,
            app_name: appName || 'Unknown App',
            country: country || 'Unknown',
            os: os || 'Unknown',
            exchange: exchange || 'Unknown',
            spend,
            installs,
            actions,
            impressions,
            clicks,
            cpi,
            ctr,
            source: exchange || 'Unknown'
          });
        }
        
        // Create creative record if we have creative data
        const creativeName = getField(['creative', 'creative name']);
        const creativeId = getField(['creative id', 'creative_id']);
        const creativeType = getField(['creative type', 'creative_type']);
        const creativeSize = getField(['creative size', 'creative_size']);
        
        if (creativeName && campaignName) {
          creatives.push({
            id: `creative-${index}`,
            creative_name: creativeName,
            creative_id: creativeId || `creative-id-${index}`,
            campaign_name: campaignName,
            app_name: appName || 'Unknown App',
            spend,
            installs,
            cpi,
            format: creativeType || 'Unknown',
            size: creativeSize || 'Unknown'
          });
        }
        
      } catch (error) {
        console.warn(`Error processing row ${index}:`, error);
      }
    });
    
    console.log(`Created ${campaigns.length} campaigns and ${creatives.length} creatives`);
    
    // Generate app summaries
    const appMap = new Map<string, AppData>();
    campaigns.forEach(campaign => {
      if (!appMap.has(campaign.app_name)) {
        appMap.set(campaign.app_name, {
          name: campaign.app_name,
          totalSpend: 0,
          totalInstalls: 0,
          totalActions: 0,
          avgCPI: 0,
          campaignCount: 0,
          countries: []
        });
      }
      
      const app = appMap.get(campaign.app_name)!;
      app.totalSpend += campaign.spend;
      app.totalInstalls += campaign.installs;
      app.totalActions += campaign.actions;
      app.campaignCount++;
      if (!app.countries.includes(campaign.country)) {
        app.countries.push(campaign.country);
      }
    });
    
    // Calculate average CPI for apps
    appMap.forEach(app => {
      app.avgCPI = app.totalInstalls > 0 ? app.totalSpend / app.totalInstalls : 0;
    });
    
    // Generate exchange summaries
    const exchangeMap = new Map<string, ExchangeData>();
    campaigns.forEach(campaign => {
      if (!exchangeMap.has(campaign.exchange)) {
        exchangeMap.set(campaign.exchange, {
          name: campaign.exchange,
          type: 'Ad Exchange',
          totalSpend: 0,
          totalInstalls: 0,
          totalActions: 0,
          avgCPI: 0,
          countries: []
        });
      }
      
      const exchange = exchangeMap.get(campaign.exchange)!;
      exchange.totalSpend += campaign.spend;
      exchange.totalInstalls += campaign.installs;
      exchange.totalActions += campaign.actions;
      if (!exchange.countries.includes(campaign.country)) {
        exchange.countries.push(campaign.country);
      }
    });
    
    // Calculate average CPI for exchanges
    exchangeMap.forEach(exchange => {
      exchange.avgCPI = exchange.totalInstalls > 0 ? exchange.totalSpend / exchange.totalInstalls : 0;
    });
    
    // Generate inventory summaries (simplified)
    const inventoryMap = new Map<string, InventoryData>();
    campaigns.forEach(campaign => {
      const key = `${campaign.exchange}-${campaign.app_name}`;
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          name: `${campaign.app_name} via ${campaign.exchange}`,
          source: campaign.exchange,
          type: 'App Traffic',
          totalSpend: 0,
          totalInstalls: 0,
          totalActions: 0,
          avgCPI: 0,
          countries: [],
          quality: campaign.cpi < 5 ? 'High' : campaign.cpi < 10 ? 'Medium' : 'Low',
          fraudRate: Math.random() * 5 // Mock fraud rate
        });
      }
      
      const inventory = inventoryMap.get(key)!;
      inventory.totalSpend += campaign.spend;
      inventory.totalInstalls += campaign.installs;
      inventory.totalActions += campaign.actions;
      if (!inventory.countries.includes(campaign.country)) {
        inventory.countries.push(campaign.country);
      }
    });
    
    // Calculate average CPI for inventory
    inventoryMap.forEach(inventory => {
      inventory.avgCPI = inventory.totalInstalls > 0 ? inventory.totalSpend / inventory.totalInstalls : 0;
    });
    
    // Calculate summary
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalInstalls = campaigns.reduce((sum, c) => sum + c.installs, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const avgCPI = totalInstalls > 0 ? totalSpend / totalInstalls : 0;
    
    return {
      campaigns,
      creatives,
      apps: Array.from(appMap.values()),
      exchanges: Array.from(exchangeMap.values()),
      inventory: Array.from(inventoryMap.values()),
      summary: {
        totalCampaigns: campaigns.length,
        totalSpend,
        totalInstalls,
        totalImpressions,
        avgCPI
      }
    };
    
  } catch (error) {
    console.error('CSV processing error:', error);
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
