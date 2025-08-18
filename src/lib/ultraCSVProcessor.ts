import Papa from 'papaparse';

// 🔥 УЛЬТРА-МОЩНЫЕ ТИПЫ ДАННЫХ
export interface UltraCampaignData {
  id: string;
  name: string;
  campaignId: string;
  type: string;
  countries: string[];
  os: string[];
  targetApp: string;
  targetAppId: string;
  campaignGoal: string;
  latTarget: boolean;
  location: string;
  
  // Агрегированные метрики по всем exchanges
  totalImpressions: number;
  totalClicks: number;
  totalInstalls: number;
  totalSpend: number;
  totalActions: number;
  totalConversions: number;
  
  // Вычисляемые метрики
  ctr: number; // Click-through rate
  cpi: number; // Cost per install
  cpc: number; // Cost per click
  cpa: number; // Cost per action
  vtr: number; // Video view-through rate
  ipm: number; // Installs per mille
  
  // Детализация по exchanges
  exchanges: ExchangeDetail[];
  
  // Даты
  startDate: string;
  endDate: string;
  lastUpdated: string;
  
  // Связанные данные
  creativesCount: number;
  adGroupsCount: number;
  status: 'active' | 'paused' | 'completed';
}

export interface ExchangeDetail {
  exchange: string;
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  ctr: number;
  cpi: number;
  cpc: number;
}

export interface UltraCreativeData {
  id: string;
  name: string;
  creativeId: string;
  campaignId: string;
  campaignName: string;
  type: string;
  size: string;
  format: string;
  videoDuration?: number;
  endCardType?: string;
  
  // Метрики по всем exchanges
  totalImpressions: number;
  totalClicks: number;
  totalInstalls: number;
  totalSpend: number;
  totalActions: number;
  
  // Вычисляемые
  ctr: number;
  cpi: number;
  cpc: number;
  cpa: number;
  vtr: number;
  
  // Детализация по exchanges
  exchanges: ExchangeDetail[];
  
  status: 'active' | 'paused';
  lastUpdated: string;
}

export interface UltraAppData {
  id: string;
  name: string;
  appId: string;
  platform: string;
  bundleId?: string;
  
  // Метрики по всем кампаниям
  totalImpressions: number;
  totalClicks: number;
  totalInstalls: number;
  totalSpend: number;
  totalActions: number;
  
  // Вычисляемые
  avgCTR: number;
  avgCPI: number;
  avgCPC: number;
  avgCPA: number;
  avgIPM: number;
  
  // Связанные данные
  campaignsCount: number;
  creativesCount: number;
  exchangesCount: number;
  
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface UltraExchangeData {
  id: string;
  name: string;
  type: string;
  
  // Метрики по всем кампаниям
  totalImpressions: number;
  totalClicks: number;
  totalInstalls: number;
  totalSpend: number;
  totalActions: number;
  
  // Вычисляемые
  avgCTR: number;
  avgCPI: number;
  avgCPC: number;
  avgCPA: number;
  avgIPM: number;
  
  // Связанные данные
  campaignsCount: number;
  creativesCount: number;
  appsCount: number;
  
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface UltraInventoryData {
  id: string;
  appBundle: string;
  appTitle: string;
  appId: string;
  trafficType: string;
  platform: string;
  
  // Метрики
  totalImpressions: number;
  totalClicks: number;
  totalInstalls: number;
  totalSpend: number;
  totalActions: number;
  
  // Вычисляемые
  ctr: number;
  ipm: number;
  cpc: number;
  cpi: number;
  cpa: number;
  
  // Retention metrics
  d1Retention: number;
  d3Retention: number;
  d7Retention: number;
  d30Retention: number;
  
  // Revenue metrics
  d1Revenue: number;
  d3Revenue: number;
  d7Revenue: number;
  d30Revenue: number;
  
  // ROAS
  d1ROAS: number;
  d3ROAS: number;
  d7ROAS: number;
  d30ROAS: number;
  
  // Связанные данные
  campaignsCount: number;
  exchangesCount: number;
  
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface UltraProcessedCSVData {
  campaigns: UltraCampaignData[];
  creatives: UltraCreativeData[];
  apps: UltraAppData[];
  exchanges: UltraExchangeData[];
  inventory: UltraInventoryData[];
  
  // Summary
  summary: UltraSummary;
  
  // Metadata
  processedAt: string;
  fileCount: number;
  recordCount: number;
  
  // Filter options
  availableCountries: string[];
  availableApps: string[];
  availableExchanges: string[];
  availableOS: string[];
  dateRange: {
    min: string;
    max: string;
  };
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

export interface CSVValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedType: 'campaign' | 'inventory_daily' | 'inventory_overall' | 'unknown';
  preview: any[];
  columns: string[];
  rowCount: number;
}

// 🔥 УЛЬТРА-МОЩНЫЙ CSV ПРОЦЕССОР
export class UltraCSVProcessor {
  
  // Валидация CSV файла
  static validateUltraCSV(file: File): Promise<CSVValidation> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvString = event.target?.result as string;
          const { data, errors } = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            preview: 10
          });
          
          if (errors.length > 0) {
            resolve({
              isValid: false,
              errors: errors.map(e => `Row ${e.row}: ${e.message}`),
              warnings: [],
              detectedType: 'unknown',
              preview: data.slice(0, 3),
              columns: Object.keys(data[0] || {}),
              rowCount: data.length
            });
            return;
          }
          
          if (data.length === 0) {
            resolve({
              isValid: false,
              errors: ['File is empty or has no valid data'],
              warnings: [],
              detectedType: 'unknown',
              preview: [],
              columns: [],
              rowCount: 0
            });
            return;
          }
          
          const columns = Object.keys(data[0]);
          const detectedType = this.detectFileType(columns, data[0]);
          
          resolve({
            isValid: true,
            errors: [],
            warnings: [],
            detectedType,
            preview: data.slice(0, 3),
            columns,
            rowCount: data.length
          });
          
        } catch (error) {
          resolve({
            isValid: false,
            errors: [`Parse error: ${error}`],
            warnings: [],
            detectedType: 'unknown',
            preview: [],
            columns: [],
            rowCount: 0
          });
        }
      };
      reader.readAsText(file);
    });
  }
  
  // Определение типа файла
  private static detectFileType(columns: string[], firstRow: any): 'campaign' | 'inventory_daily' | 'inventory_overall' | 'unknown' {
    const hasDate = columns.includes('Date');
    const hasInventoryTraffic = columns.includes('Inventory Traffic');
    const hasExchange = columns.includes('Exchange');
    
    if (hasDate && hasInventoryTraffic) {
      return 'inventory_daily';
    } else if (hasInventoryTraffic && !hasDate) {
      return 'inventory_overall';
    } else if (hasExchange) {
      return 'campaign';
    }
    
    return 'unknown';
  }
  
  // Основная обработка
  static processUltraCSV(file: File): Promise<UltraProcessedCSVData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvString = event.target?.result as string;
          const { data, errors } = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true
          });
          
          if (errors.length > 0) {
            reject(new Error(`CSV parse errors: ${errors.map(e => e.message).join(', ')}`));
            return;
          }
          
          const fileType = this.detectFileType(Object.keys(data[0] || {}), data[0]);
          let processedData: UltraProcessedCSVData;
          
          switch (fileType) {
            case 'campaign':
              processedData = this.processCampaignData(data);
              break;
            case 'inventory_daily':
              processedData = this.processInventoryDailyData(data);
              break;
            case 'inventory_overall':
              processedData = this.processInventoryOverallData(data);
              break;
            default:
              reject(new Error('Unknown file type'));
              return;
          }
          
          resolve(processedData);
          
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
  
  // Обработка данных кампаний
  private static processCampaignData(data: any[]): UltraProcessedCSVData {
    const campaignsMap = new Map<string, UltraCampaignData>();
    const creativesMap = new Map<string, UltraCreativeData>();
    const appsMap = new Map<string, UltraAppData>();
    const exchangesMap = new Map<string, UltraExchangeData>();
    
    // Обработка каждой строки
    data.forEach((row, index) => {
      const campaignKey = `${row.Campaign}_${row['Campaign ID']}`;
      const creativeKey = `${row.Creative}_${row['Creative ID']}`;
      const appKey = row['App ID'];
      const exchangeKey = row.Exchange;
      
      // Обработка кампании
      if (!campaignsMap.has(campaignKey)) {
        campaignsMap.set(campaignKey, {
          id: campaignKey,
          name: row.Campaign,
          campaignId: row['Campaign ID'],
          type: row['Campaign Type'],
          countries: [row.Countries],
          os: [row.OS],
          targetApp: row.App,
          targetAppId: row['App ID'],
          campaignGoal: row['Campaign Goal'],
          latTarget: row['LAT Target'] === 'On',
          location: row.Location,
          totalImpressions: 0,
          totalClicks: 0,
          totalInstalls: 0,
          totalSpend: 0,
          totalActions: 0,
          totalConversions: 0,
          ctr: 0,
          cpi: 0,
          cpc: 0,
          cpa: 0,
          vtr: 0,
          ipm: 0,
          exchanges: [],
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          creativesCount: 0,
          adGroupsCount: 0,
          status: 'active'
        });
      }
      
      const campaign = campaignsMap.get(campaignKey)!;
      
      // Агрегация метрик
      const impressions = parseInt(row.Impression) || 0;
      const clicks = parseInt(row.Click) || 0;
      const installs = parseInt(row.Install) || 0;
      const spend = parseFloat(row.Spend) || 0;
      const actions = parseInt(row.Action) || 0;
      const conversions = parseInt(row.Conversion) || 0;
      
      campaign.totalImpressions += impressions;
      campaign.totalClicks += clicks;
      campaign.totalInstalls += installs;
      campaign.totalSpend += spend;
      campaign.totalActions += actions;
      campaign.totalConversions += conversions;
      
      // Добавление exchange детализации
      campaign.exchanges.push({
        exchange: row.Exchange,
        impressions,
        clicks,
        installs,
        spend,
        ctr: clicks > 0 ? (clicks / impressions) * 100 : 0,
        cpi: installs > 0 ? spend / installs : 0,
        cpc: clicks > 0 ? spend / clicks : 0
      });
      
      // Обработка креатива
      if (!creativesMap.has(creativeKey)) {
        creativesMap.set(creativeKey, {
          id: creativeKey,
          name: row.Creative,
          creativeId: row['Creative ID'],
          campaignId: campaignKey, // ИСПРАВЛЕНО: используем campaignKey вместо row['Campaign ID']
          campaignName: row.Campaign,
          type: row['Creative Type'],
          size: row['Creative Size'],
          format: row['Creative Size'],
          videoDuration: row['Video Duration'] ? parseInt(row['Video Duration']) : undefined,
          endCardType: row['End Card Type'],
          totalImpressions: 0,
          totalClicks: 0,
          totalInstalls: 0,
          totalSpend: 0,
          totalActions: 0,
          ctr: 0,
          cpi: 0,
          cpc: 0,
          vtr: 0,
          exchanges: [],
          status: 'active',
          lastUpdated: new Date().toISOString()
        });
      }
      
      const creative = creativesMap.get(creativeKey)!;
      creative.totalImpressions += impressions;
      creative.totalClicks += clicks;
      creative.totalInstalls += installs;
      creative.totalSpend += spend;
      creative.totalActions += actions;
      
      // Обработка приложения
      if (!appsMap.has(appKey)) {
        appsMap.set(appKey, {
          id: appKey,
          name: row.App,
          appId: row['App ID'],
          platform: row.OS,
          bundleId: row['App ID'],
          totalImpressions: 0,
          totalClicks: 0,
          totalInstalls: 0,
          totalSpend: 0,
          totalActions: 0,
          avgCTR: 0,
          avgCPI: 0,
          avgCPC: 0,
          avgIPM: 0,
          campaignsCount: 0,
          creativesCount: 0,
          exchangesCount: 0,
          status: 'active',
          lastUpdated: new Date().toISOString()
        });
      }
      
      const app = appsMap.get(appKey)!;
      app.totalImpressions += impressions;
      app.totalClicks += clicks;
      app.totalInstalls += installs;
      app.totalSpend += spend;
      app.totalActions += actions;
      
      // Обработка exchange
      if (!exchangesMap.has(exchangeKey)) {
        exchangesMap.set(exchangeKey, {
          id: exchangeKey,
          name: row.Exchange,
          type: 'ad_network',
          totalImpressions: 0,
          totalClicks: 0,
          totalInstalls: 0,
          totalSpend: 0,
          totalActions: 0,
          avgCTR: 0,
          avgCPI: 0,
          avgCPC: 0,
          avgIPM: 0,
          campaignsCount: 0,
          creativesCount: 0,
          appsCount: 0,
          status: 'active',
          lastUpdated: new Date().toISOString()
        });
      }
      
      const exchange = exchangesMap.get(exchangeKey)!;
      exchange.totalImpressions += impressions;
      exchange.totalClicks += clicks;
      exchange.totalInstalls += installs;
      exchange.totalSpend += spend;
      exchange.totalActions += actions;
    });
    
    // Вычисление производных метрик
    campaignsMap.forEach(campaign => {
      campaign.ctr = campaign.totalImpressions > 0 ? (campaign.totalClicks / campaign.totalImpressions) * 100 : 0;
      campaign.cpi = campaign.totalInstalls > 0 ? campaign.totalSpend / campaign.totalInstalls : 0;
      campaign.cpc = campaign.totalClicks > 0 ? campaign.totalSpend / campaign.totalClicks : 0;
      campaign.cpa = campaign.totalActions > 0 ? campaign.totalSpend / campaign.totalActions : 0;
      campaign.ipm = campaign.totalImpressions > 0 ? (campaign.totalInstalls / campaign.totalImpressions) * 1000 : 0;
      campaign.creativesCount = new Set(campaign.exchanges.map(e => e.exchange)).size;
      campaign.adGroupsCount = 1; // Упрощенно
    });
    
    creativesMap.forEach(creative => {
      creative.ctr = creative.totalImpressions > 0 ? (creative.totalClicks / creative.totalImpressions) * 100 : 0;
      creative.cpi = creative.totalInstalls > 0 ? creative.totalSpend / creative.totalInstalls : 0;
      creative.cpc = creative.totalClicks > 0 ? creative.totalSpend / creative.totalClicks : 0;
      creative.cpa = creative.totalActions > 0 ? creative.totalSpend / creative.totalActions : 0;
      creative.vtr = creative.totalImpressions > 0 ? (creative.totalImpressions / creative.totalImpressions) * 100 : 0;
    });
    
    appsMap.forEach(app => {
      app.avgCTR = app.totalImpressions > 0 ? (app.totalClicks / app.totalImpressions) * 100 : 0;
      app.avgCPI = app.totalInstalls > 0 ? app.totalSpend / app.totalInstalls : 0;
      app.avgCPC = app.totalClicks > 0 ? app.totalSpend / app.totalClicks : 0;
      app.avgCPA = app.totalActions > 0 ? app.totalSpend / app.totalActions : 0;
      app.avgIPM = app.totalImpressions > 0 ? (app.totalInstalls / app.totalImpressions) * 1000 : 0;
    });
    
    exchangesMap.forEach(exchange => {
      exchange.avgCTR = exchange.totalImpressions > 0 ? (exchange.totalClicks / exchange.totalImpressions) * 100 : 0;
      exchange.avgCPI = exchange.totalInstalls > 0 ? exchange.totalSpend / exchange.totalInstalls : 0;
      exchange.avgCPC = exchange.totalClicks > 0 ? exchange.totalSpend / exchange.totalClicks : 0;
      exchange.avgCPA = exchange.totalActions > 0 ? exchange.totalSpend / exchange.totalActions : 0;
      exchange.avgIPM = exchange.totalImpressions > 0 ? (exchange.totalInstalls / exchange.totalImpressions) * 1000 : 0;
    });
    
    // Создание итогового объекта
    const campaigns = Array.from(campaignsMap.values());
    const creatives = Array.from(creativesMap.values());
    const apps = Array.from(appsMap.values());
    const exchanges = Array.from(exchangesMap.values());
    
    const summary = this.calculateUltraSummary(campaigns, creatives, apps, exchanges, []);
    
    return {
      campaigns,
      creatives,
      apps,
      exchanges,
      inventory: [],
      summary,
      processedAt: new Date().toISOString(),
      fileCount: 1,
      recordCount: data.length,
      availableCountries: [...new Set(campaigns.flatMap(c => c.countries))],
      availableApps: [...new Set(campaigns.map(c => c.targetApp))],
      availableExchanges: [...new Set(exchanges.map(e => e.name))],
      availableOS: [...new Set(campaigns.flatMap(c => c.os))],
      dateRange: {
        min: new Date().toISOString(),
        max: new Date().toISOString()
      }
    };
  }
  
  // Обработка inventory daily данных
  private static processInventoryDailyData(data: any[]): UltraProcessedCSVData {
    // Аналогичная логика для inventory daily
    // Пока возвращаю пустую структуру
    return this.createEmptyUltraData();
  }
  
  // Обработка inventory overall данных
  private static processInventoryOverallData(data: any[]): UltraProcessedCSVData {
    // Аналогичная логика для inventory overall
    // Пока возвращаю пустую структуру
    return this.createEmptyUltraData();
  }
  
  // Создание пустых данных
  private static createEmptyUltraData(): UltraProcessedCSVData {
    return {
      campaigns: [],
      creatives: [],
      apps: [],
      exchanges: [],
      inventory: [],
      summary: {
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
      },
      processedAt: new Date().toISOString(),
      fileCount: 0,
      recordCount: 0,
      availableCountries: [],
      availableApps: [],
      availableExchanges: [],
      availableOS: [],
      dateRange: {
        min: new Date().toISOString(),
        max: new Date().toISOString()
      }
    };
  }
  
  // Вычисление ультра-суммари
  private static calculateUltraSummary(
    campaigns: UltraCampaignData[],
    creatives: UltraCreativeData[],
    apps: UltraAppData[],
    exchanges: UltraExchangeData[],
    inventory: UltraInventoryData[]
  ): UltraSummary {
    const totalSpend = campaigns.reduce((sum, c) => sum + c.totalSpend, 0);
    const totalInstalls = campaigns.reduce((sum, c) => sum + c.totalInstalls, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.totalImpressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.totalClicks, 0);
    const totalActions = campaigns.reduce((sum, c) => sum + c.totalActions, 0);
    
    return {
      totalCampaigns: campaigns.length,
      totalCreatives: creatives.length,
      totalApps: apps.length,
      totalExchanges: exchanges.length,
      totalInventory: inventory.length,
      totalSpend,
      totalInstalls,
      totalImpressions,
      totalClicks,
      totalActions,
      avgCPI: totalInstalls > 0 ? totalSpend / totalInstalls : 0,
      avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
      avgIPM: totalImpressions > 0 ? (totalInstalls / totalImpressions) * 1000 : 0,
      avgVTR: 0, // Пока не вычисляется
      totalRevenue: 0, // Пока не вычисляется
      avgROAS: 0, // Пока не вычисляется
      avgRetention: 0 // Пока не вычисляется
    };
  }
}
