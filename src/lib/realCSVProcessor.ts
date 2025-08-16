import Papa from 'papaparse';

// 🔥 ПРАВИЛЬНЫЕ ТИПЫ ДАННЫХ
export interface CampaignData {
  id: string;
  name: string;
  campaignId: string;
  type: string;
  countries: string[];
  os: string[];
  targetApp: string;
  targetAppId: string;
  status: 'active' | 'paused' | 'completed';
  
  // Агрегированные метрики
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
  
  // Даты
  startDate: string;
  endDate: string;
  lastUpdated: string;
  
  // Связанные данные
  creativesCount: number;
  exchangesCount: number;
  inventoryCount: number;
}

export interface CreativeData {
  id: string;
  name: string;
  creativeId: string;
  campaignId: string;
  campaignName: string;
  type: string;
  size: string;
  format: string;
  
  // Метрики
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  
  // Вычисляемые
  ctr: number;
  cpi: number;
  cpc: number;
  
  status: 'active' | 'paused';
  lastUpdated: string;
}

export interface ExchangeData {
  id: string;
  name: string;
  type: string;
  
  // Метрики по всем кампаниям
  totalImpressions: number;
  totalClicks: number;
  totalInstalls: number;
  totalSpend: number;
  
  // Вычисляемые
  ctr: number;
  cpi: number;
  averageCpc: number;
  
  // Связанные данные
  campaignsCount: number;
  creativesCount: number;
  
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface InventoryData {
  id: string;
  appBundle: string;
  appTitle: string;
  appId: string;
  trafficType: string;
  
  // Метрики
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  
  // Вычисляемые
  ctr: number;
  cpi: number;
  quality: 'high' | 'medium' | 'low';
  
  // Связанные данные
  campaignsCount: number;
  
  lastUpdated: string;
}

export interface AppData {
  id: string;
  name: string;
  appId: string;
  platform: 'iOS' | 'Android' | 'Both';
  
  // Метрики как рекламируемого приложения
  totalImpressions: number;
  totalClicks: number;
  totalInstalls: number;
  totalSpend: number;
  
  // Вычисляемые
  ctr: number;
  cpi: number;
  
  // Связанные данные
  campaignsCount: number;
  creativesCount: number;
  
  status: 'active' | 'paused';
  lastUpdated: string;
}

export interface ProcessedCSVData {
  campaigns: CampaignData[];
  creatives: CreativeData[];
  exchanges: ExchangeData[];
  inventory: InventoryData[];
  apps: AppData[];
  
  // Сводная статистика
  summary: {
    totalCampaigns: number;
    totalCreatives: number;
    totalExchanges: number;
    totalInventory: number;
    totalApps: number;
    
    totalSpend: number;
    totalInstalls: number;
    totalImpressions: number;
    totalClicks: number;
    
    avgCPI: number;
    avgCTR: number;
    avgCPC: number;
  };
  
  // Фильтры
  countries: string[];
  
  // Метаданные
  processedAt: string;
  fileCount: number;
  recordCount: number;
}

// 🔍 ВАЛИДАЦИЯ CSV
export interface CSVValidation {
  isValid: boolean;
  fileType: 'campaign' | 'inventory_daily' | 'inventory_overall' | 'unknown';
  errors: string[];
  warnings: string[];
  rowCount: number;
  expectedColumns: string[];
  actualColumns: string[];
}

export async function validateRealCSV(file: File): Promise<CSVValidation> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      preview: 5, // Читаем только первые 5 строк для валидации
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Определяем тип файла по заголовкам
        let fileType: CSVValidation['fileType'] = 'unknown';
        let expectedColumns: string[] = [];
        
        if (headers.includes('Campaign') && headers.includes('Creative') && headers.includes('Exchange')) {
          fileType = 'campaign';
          expectedColumns = ['Campaign', 'Campaign ID', 'Creative', 'Creative ID', 'Exchange', 'Impression', 'Click', 'Install', 'Spend'];
        } else if (headers.includes('Date') && headers.includes('Inventory - App Bundle')) {
          fileType = 'inventory_daily';
          expectedColumns = ['Date', 'Campaign', 'Campaign ID', 'Inventory - App Bundle', 'Inventory - App Title', 'Impression', 'Click', 'Install', 'Spend'];
        } else if (headers.includes('Inventory - App Bundle') && !headers.includes('Date')) {
          fileType = 'inventory_overall';
          expectedColumns = ['Campaign', 'Campaign ID', 'Inventory - App Bundle', 'Inventory - App Title', 'Impression', 'Click', 'Install', 'Spend'];
        }
        
        if (fileType === 'unknown') {
          errors.push('Неизвестный тип CSV файла');
        }
        
        // Проверяем наличие обязательных колонок
        for (const col of expectedColumns) {
          if (!headers.includes(col)) {
            errors.push(`Отсутствует обязательная колонка: ${col}`);
          }
        }
        
        if (results.data.length === 0) {
          errors.push('Файл пустой или не содержит данных');
        }
        
        resolve({
          isValid: errors.length === 0,
          fileType,
          errors,
          warnings,
          rowCount: results.data.length,
          expectedColumns,
          actualColumns: headers
        });
      },
      error: (error) => {
        resolve({
          isValid: false,
          fileType: 'unknown',
          errors: [`Ошибка парсинга CSV: ${error.message}`],
          warnings: [],
          rowCount: 0,
          expectedColumns: [],
          actualColumns: []
        });
      }
    });
  });
}

// 🔄 ОБРАБОТКА CSV
export async function processRealCSV(file: File): Promise<ProcessedCSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          const headers = results.meta.fields || [];
          
          // Определяем тип файла
          let fileType: 'campaign' | 'inventory_daily' | 'inventory_overall' = 'campaign';
          if (headers.includes('Date') && headers.includes('Inventory - App Bundle')) {
            fileType = 'inventory_daily';
          } else if (headers.includes('Inventory - App Bundle') && !headers.includes('Date')) {
            fileType = 'inventory_overall';
          }
          
          console.log(`🔍 Обрабатываем ${fileType} файл с ${data.length} записями`);
          
          const processedData = processCSVData(data, fileType);
          resolve(processedData);
          
        } catch (error) {
          console.error('❌ Ошибка обработки CSV:', error);
          reject(new Error(`Ошибка обработки CSV: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`));
        }
      },
      error: (error) => {
        reject(new Error(`Ошибка парсинга CSV: ${error.message}`));
      }
    });
  });
}

// 🏗️ ОСНОВНАЯ ЛОГИКА ОБРАБОТКИ
function processCSVData(data: any[], fileType: 'campaign' | 'inventory_daily' | 'inventory_overall'): ProcessedCSVData {
  const campaigns = new Map<string, CampaignData>();
  const creatives = new Map<string, CreativeData>();
  const exchanges = new Map<string, ExchangeData>();
  const inventory = new Map<string, InventoryData>();
  const apps = new Map<string, AppData>();
  const countries = new Set<string>();
  
  console.log(`📊 Начинаем обработку ${data.length} записей типа ${fileType}`);
  
  for (const row of data) {
    try {
      // Очистка и валидация данных
      const cleanRow = cleanRowData(row);
      if (!isValidRow(cleanRow, fileType)) continue;
      
      // Добавляем страну
      if (cleanRow['Countries']) {
        countries.add(cleanRow['Countries']);
      }
      
      if (fileType === 'campaign') {
        // 🎯 CAMPAIGN DATA - группируем по Campaign + Campaign ID
        processCampaignRow(cleanRow, campaigns, creatives, exchanges, apps);
      } else {
        // 📦 INVENTORY DATA - группируем по Inventory App
        processInventoryRow(cleanRow, campaigns, inventory, apps);
      }
      
    } catch (error) {
      console.warn('⚠️ Ошибка обработки строки:', error, row);
    }
  }
  
  console.log(`✅ Обработано: ${campaigns.size} кампаний, ${creatives.size} креативов, ${exchanges.size} exchanges, ${inventory.size} inventory`);
  
  // Рассчитываем сводную статистику
  const summary = calculateSummary(campaigns, creatives, exchanges, inventory, apps);
  
  return {
    campaigns: Array.from(campaigns.values()),
    creatives: Array.from(creatives.values()),
    exchanges: Array.from(exchanges.values()),
    inventory: Array.from(inventory.values()),
    apps: Array.from(apps.values()),
    summary,
    countries: Array.from(countries),
    processedAt: new Date().toISOString(),
    fileCount: 1,
    recordCount: data.length
  };
}

// 🧹 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function cleanRowData(row: any): any {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(row)) {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function isValidRow(row: any, fileType: string): boolean {
  if (fileType === 'campaign') {
    return row['Campaign'] && row['Campaign ID'];
  } else {
    return row['Campaign'] && row['Campaign ID'] && row['Inventory - App Bundle'];
  }
}

function getCreativeFormat(type: string): string {
  if (!type) return 'Unknown';
  if (type.includes('HTML')) return 'HTML';
  if (type.includes('VIDEO')) return 'Video';
  if (type.includes('IMAGE')) return 'Image';
  return 'Other';
}

function getExchangeType(name: string): string {
  const dsps = ['MOLOCO_SDK', 'CHARTBOOST', 'APPLOVIN'];
  const ssps = ['VUNGLE', 'IRONSOURCE', 'INMOBI', 'FYBER'];
  
  if (dsps.some(dsp => name.includes(dsp))) return 'DSP';
  if (ssps.some(ssp => name.includes(ssp))) return 'SSP';
  return 'Exchange';
}

// 🎯 ОБРАБОТКА CAMPAIGN СТРОК
function processCampaignRow(row: any, campaigns: Map<string, CampaignData>, creatives: Map<string, CreativeData>, exchanges: Map<string, ExchangeData>, apps: Map<string, AppData>) {
  const campaignKey = `${row['Campaign']}_${row['Campaign ID']}`;
  const creativeKey = `${row['Creative']}_${row['Creative ID']}`;
  const exchangeName = row['Exchange'] || 'Unknown Exchange';
  const appKey = `${row['App']}_${row['App ID']}`;
  
  // Метрики из строки
  const impressions = parseFloat(row['Impression']) || 0;
  const clicks = parseFloat(row['Click']) || 0;
  const installs = parseFloat(row['Install']) || 0;
  const spend = parseFloat(row['Spend']) || 0;
  const actions = parseFloat(row['Action']) || 0;
  const conversions = parseFloat(row['Conversion']) || 0;
  
  // 📈 CAMPAIGN
  if (!campaigns.has(campaignKey)) {
    campaigns.set(campaignKey, {
      id: campaignKey,
      name: row['Campaign'] || 'Unknown Campaign',
      campaignId: row['Campaign ID'] || 'unknown',
      type: row['Campaign Type'] || 'Unknown',
      countries: row['Countries'] ? [row['Countries']] : [],
      os: row['OS'] ? [row['OS']] : [],
      targetApp: row['App'] || 'Unknown App',
      targetAppId: row['App ID'] || 'unknown',
      status: 'active',
      
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
      
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      
      creativesCount: 0,
      exchangesCount: 0,
      inventoryCount: 0
    });
  }
  
  const campaign = campaigns.get(campaignKey)!;
  campaign.totalImpressions += impressions;
  campaign.totalClicks += clicks;
  campaign.totalInstalls += installs;
  campaign.totalSpend += spend;
  campaign.totalActions += actions;
  campaign.totalConversions += conversions;
  
  // Пересчитываем метрики
  campaign.ctr = campaign.totalImpressions > 0 ? (campaign.totalClicks / campaign.totalImpressions) * 100 : 0;
  campaign.cpi = campaign.totalInstalls > 0 ? campaign.totalSpend / campaign.totalInstalls : 0;
  campaign.cpc = campaign.totalClicks > 0 ? campaign.totalSpend / campaign.totalClicks : 0;
  campaign.cpa = campaign.totalActions > 0 ? campaign.totalSpend / campaign.totalActions : 0;
  
  // 🎨 CREATIVE
  if (!creatives.has(creativeKey)) {
    creatives.set(creativeKey, {
      id: creativeKey,
      name: row['Creative'] || 'Unknown Creative',
      creativeId: row['Creative ID'] || 'unknown',
      campaignId: row['Campaign ID'] || 'unknown',
      campaignName: row['Campaign'] || 'Unknown Campaign',
      type: row['Creative Type'] || 'Unknown',
      size: row['Creative Size'] || 'Unknown',
      format: getCreativeFormat(row['Creative Type']),
      
      impressions: 0,
      clicks: 0,
      installs: 0,
      spend: 0,
      
      ctr: 0,
      cpi: 0,
      cpc: 0,
      
      status: 'active',
      lastUpdated: new Date().toISOString()
    });
    campaign.creativesCount++;
  }
  
  const creative = creatives.get(creativeKey)!;
  creative.impressions += impressions;
  creative.clicks += clicks;
  creative.installs += installs;
  creative.spend += spend;
  
  creative.ctr = creative.impressions > 0 ? (creative.clicks / creative.impressions) * 100 : 0;
  creative.cpi = creative.installs > 0 ? creative.spend / creative.installs : 0;
  creative.cpc = creative.clicks > 0 ? creative.spend / creative.clicks : 0;
  
  // 🔄 EXCHANGE
  if (!exchanges.has(exchangeName)) {
    exchanges.set(exchangeName, {
      id: exchangeName.toLowerCase().replace(/\s+/g, '_'),
      name: exchangeName,
      type: getExchangeType(exchangeName),
      
      totalImpressions: 0,
      totalClicks: 0,
      totalInstalls: 0,
      totalSpend: 0,
      
      ctr: 0,
      cpi: 0,
      averageCpc: 0,
      
      campaignsCount: 0,
      creativesCount: 0,
      
      status: 'active',
      lastUpdated: new Date().toISOString()
    });
    campaign.exchangesCount++;
  }
  
  const exchange = exchanges.get(exchangeName)!;
  exchange.totalImpressions += impressions;
  exchange.totalClicks += clicks;
  exchange.totalInstalls += installs;
  exchange.totalSpend += spend;
  
  exchange.ctr = exchange.totalImpressions > 0 ? (exchange.totalClicks / exchange.totalImpressions) * 100 : 0;
  exchange.cpi = exchange.totalInstalls > 0 ? exchange.totalSpend / exchange.totalInstalls : 0;
  exchange.averageCpc = exchange.totalClicks > 0 ? exchange.totalSpend / exchange.totalClicks : 0;
  
  // 📱 APP (рекламируемое приложение)
  if (!apps.has(appKey)) {
    apps.set(appKey, {
      id: appKey,
      name: row['App'] || 'Unknown App',
      appId: row['App ID'] || 'unknown',
      platform: row['OS'] === 'iOS' ? 'iOS' : row['OS'] === 'Android' ? 'Android' : 'Both',
      
      totalImpressions: 0,
      totalClicks: 0,
      totalInstalls: 0,
      totalSpend: 0,
      
      ctr: 0,
      cpi: 0,
      
      campaignsCount: 0,
      creativesCount: 0,
      
      status: 'active',
      lastUpdated: new Date().toISOString()
    });
  }
  
  const app = apps.get(appKey)!;
  app.totalImpressions += impressions;
  app.totalClicks += clicks;
  app.totalInstalls += installs;
  app.totalSpend += spend;
  
  app.ctr = app.totalImpressions > 0 ? (app.totalClicks / app.totalImpressions) * 100 : 0;
  app.cpi = app.totalInstalls > 0 ? app.totalSpend / app.totalInstalls : 0;
}

// 📦 ОБРАБОТКА INVENTORY СТРОК
function processInventoryRow(row: any, campaigns: Map<string, CampaignData>, inventory: Map<string, InventoryData>, apps: Map<string, AppData>) {
  const campaignKey = `${row['Campaign']}_${row['Campaign ID']}`;
  const inventoryKey = `${row['Inventory - App Bundle']}_${row['Inventory - App Title']}`;
  
  const impressions = parseFloat(row['Impression']) || 0;
  const clicks = parseFloat(row['Click']) || 0;
  const installs = parseFloat(row['Install']) || 0;
  const spend = parseFloat(row['Spend']) || 0;
  
  // 📈 CAMPAIGN (обновляем если уже есть)
  if (!campaigns.has(campaignKey)) {
    campaigns.set(campaignKey, {
      id: campaignKey,
      name: row['Campaign'] || 'Unknown Campaign',
      campaignId: row['Campaign ID'] || 'unknown',
      type: row['Campaign Type'] || 'Unknown',
      countries: row['Countries'] ? [row['Countries']] : [],
      os: row['OS'] ? [row['OS']] : [],
      targetApp: 'Unknown App', // В inventory файлах нет информации о target app
      targetAppId: 'unknown',
      status: 'active',
      
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
      
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      
      creativesCount: 0,
      exchangesCount: 0,
      inventoryCount: 0
    });
  }
  
  const campaign = campaigns.get(campaignKey)!;
  campaign.totalImpressions += impressions;
  campaign.totalClicks += clicks;
  campaign.totalInstalls += installs;
  campaign.totalSpend += spend;
  campaign.inventoryCount++;
  
  // Пересчитываем метрики
  campaign.ctr = campaign.totalImpressions > 0 ? (campaign.totalClicks / campaign.totalImpressions) * 100 : 0;
  campaign.cpi = campaign.totalInstalls > 0 ? campaign.totalSpend / campaign.totalInstalls : 0;
  campaign.cpc = campaign.totalClicks > 0 ? campaign.totalSpend / campaign.totalClicks : 0;
  
  // 📦 INVENTORY
  if (!inventory.has(inventoryKey)) {
    inventory.set(inventoryKey, {
      id: inventoryKey,
      appBundle: row['Inventory - App Bundle'] || 'unknown',
      appTitle: row['Inventory - App Title'] || 'Unknown App',
      appId: row['Inventory - App Bundle'] || 'unknown',
      trafficType: row['Inventory Traffic'] || 'Unknown',
      
      impressions: 0,
      clicks: 0,
      installs: 0,
      spend: 0,
      
      ctr: 0,
      cpi: 0,
      quality: 'medium',
      
      campaignsCount: 0,
      
      lastUpdated: new Date().toISOString()
    });
  }
  
  const inventoryItem = inventory.get(inventoryKey)!;
  inventoryItem.impressions += impressions;
  inventoryItem.clicks += clicks;
  inventoryItem.installs += installs;
  inventoryItem.spend += spend;
  
  inventoryItem.ctr = inventoryItem.impressions > 0 ? (inventoryItem.clicks / inventoryItem.impressions) * 100 : 0;
  inventoryItem.cpi = inventoryItem.installs > 0 ? inventoryItem.spend / inventoryItem.installs : 0;
  
  // Определяем качество inventory
  if (inventoryItem.ctr > 1.0 && inventoryItem.cpi < 5.0) {
    inventoryItem.quality = 'high';
  } else if (inventoryItem.ctr < 0.1 || inventoryItem.cpi > 20.0) {
    inventoryItem.quality = 'low';
  } else {
    inventoryItem.quality = 'medium';
  }
}

function calculateSummary(campaigns: Map<string, CampaignData>, creatives: Map<string, CreativeData>, exchanges: Map<string, ExchangeData>, inventory: Map<string, InventoryData>, apps: Map<string, AppData>) {
  const totalSpend = Array.from(campaigns.values()).reduce((sum, c) => sum + c.totalSpend, 0);
  const totalInstalls = Array.from(campaigns.values()).reduce((sum, c) => sum + c.totalInstalls, 0);
  const totalImpressions = Array.from(campaigns.values()).reduce((sum, c) => sum + c.totalImpressions, 0);
  const totalClicks = Array.from(campaigns.values()).reduce((sum, c) => sum + c.totalClicks, 0);
  
  return {
    totalCampaigns: campaigns.size,
    totalCreatives: creatives.size,
    totalExchanges: exchanges.size,
    totalInventory: inventory.size,
    totalApps: apps.size,
    
    totalSpend,
    totalInstalls,
    totalImpressions,
    totalClicks,
    
    avgCPI: totalInstalls > 0 ? totalSpend / totalInstalls : 0,
    avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0
  };
}
