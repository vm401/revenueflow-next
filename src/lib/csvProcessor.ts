import { toast } from "@/hooks/use-toast";

// Data types для обработанных CSV данных
export interface CampaignRow {
  id: string;
  date: string;
  campaign_name: string;
  app_name: string;
  country: string;
  spend: number;
  installs: number;
  actions?: number;
  cpi: number;
  ctr?: number;
  cvr?: number;
  source?: string; // Meta Ads, Google Ads, etc.
  creative_name?: string;
  raw_data?: any; // Оригинальные данные из CSV
}

export interface CreativeRow {
  id: string;
  date: string;
  creative_name: string;
  campaign_name: string;
  app_name: string;
  country: string;
  spend: number;
  installs: number;
  actions?: number;
  cpi: number;
  format?: string;
  size?: string;
  source?: string;
  raw_data?: any;
}

export interface ProcessedData {
  campaigns: CampaignRow[];
  creatives: CreativeRow[];
  apps: string[];
  countries: string[];
  sources: string[];
  totalSpend: number;
  totalInstalls: number;
  totalActions: number;
  avgCPI: number;
  dateRange: {
    start: string;
    end: string;
  };
  processedAt: string;
  fileNames: string[];
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedType: 'campaign' | 'creative' | 'unknown';
  rowCount: number;
  columnCount: number;
  preview: string[][];
}

export class CSVProcessor {
  private requiredCampaignColumns = [
    'date', 'campaign_name', 'app_name', 'country', 'spend', 'installs'
  ];
  
  private requiredCreativeColumns = [
    'date', 'creative_name', 'campaign_name', 'app_name', 'spend', 'installs'
  ];

  // Парсинг CSV с учётом кавычек и запятых
  private parseCSV(csvText: string): string[][] {
    const lines = csvText.split('\n').filter(line => line.trim());
    const result: string[][] = [];

    for (const line of lines) {
      const row: string[] = [];
      let current = '';
      let inQuotes = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Escaped quote
            current += '"';
            i += 2;
            continue;
          }
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
        i++;
      }
      
      row.push(current.trim());
      result.push(row);
    }

    return result;
  }

  // Нормализация заголовков колонок
  private normalizeHeader(header: string): string {
    return header
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^\w_]/g, '');
  }

  // Определение типа CSV файла
  private detectCSVType(headers: string[]): 'campaign' | 'creative' | 'unknown' {
    const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
    
    const hasCampaignColumns = this.requiredCampaignColumns.every(col => 
      normalizedHeaders.some(header => 
        header.includes(col.replace('_', '')) || header === col
      )
    );
    
    const hasCreativeColumns = this.requiredCreativeColumns.every(col => 
      normalizedHeaders.some(header => 
        header.includes(col.replace('_', '')) || header === col
      )
    );
    
    if (hasCreativeColumns && normalizedHeaders.some(h => h.includes('creative'))) {
      return 'creative';
    } else if (hasCampaignColumns) {
      return 'campaign';
    }
    
    return 'unknown';
  }

  // Валидация CSV файла
  async validateCSV(file: File): Promise<CSVValidationResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const rows = this.parseCSV(csvText);
          
          if (rows.length === 0) {
            resolve({
              isValid: false,
              errors: ['File is empty'],
              warnings: [],
              detectedType: 'unknown',
              rowCount: 0,
              columnCount: 0,
              preview: []
            });
            return;
          }

          const headers = rows[0];
          const dataRows = rows.slice(1);
          const detectedType = this.detectCSVType(headers);
          
          const errors: string[] = [];
          const warnings: string[] = [];

          // Проверка типа файла
          if (detectedType === 'unknown') {
            errors.push('Unable to detect file type. Expected campaign or creative data format.');
          }

          // Проверка данных в первых нескольких строках
          const sampleRows = dataRows.slice(0, 5);
          const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
          
          sampleRows.forEach((row, idx) => {
            if (row.length !== headers.length) {
              warnings.push(`Row ${idx + 2}: Column count mismatch (${row.length} vs ${headers.length})`);
            }

            // Проверка spend
            const spendIndex = normalizedHeaders.findIndex(h => h.includes('spend'));
            if (spendIndex >= 0 && row[spendIndex]) {
              const spendValue = this.parseNumber(row[spendIndex]);
              if (isNaN(spendValue)) {
                warnings.push(`Row ${idx + 2}: Invalid spend value "${row[spendIndex]}"`);
              }
            }

            // Проверка installs
            const installsIndex = normalizedHeaders.findIndex(h => h.includes('installs'));
            if (installsIndex >= 0 && row[installsIndex]) {
              const installsValue = parseInt(row[installsIndex].replace(/[,]/g, ''));
              if (isNaN(installsValue)) {
                warnings.push(`Row ${idx + 2}: Invalid installs value "${row[installsIndex]}"`);
              }
            }

            // Проверка даты
            const dateIndex = normalizedHeaders.findIndex(h => h.includes('date'));
            if (dateIndex >= 0 && row[dateIndex]) {
              const dateValue = new Date(row[dateIndex]);
              if (isNaN(dateValue.getTime())) {
                warnings.push(`Row ${idx + 2}: Invalid date format "${row[dateIndex]}"`);
              }
            }
          });

          // Предупреждения о размере файла
          if (dataRows.length > 50000) {
            warnings.push(`Large file: ${dataRows.length} rows. Processing may take longer.`);
          }

          if (dataRows.length === 0) {
            errors.push('No data rows found (only headers)');
          }

          resolve({
            isValid: errors.length === 0,
            errors,
            warnings,
            detectedType,
            rowCount: dataRows.length,
            columnCount: headers.length,
            preview: rows.slice(0, 6) // Header + 5 data rows
          });

        } catch (error) {
          resolve({
            isValid: false,
            errors: ['Failed to parse CSV file: ' + (error as Error).message],
            warnings: [],
            detectedType: 'unknown',
            rowCount: 0,
            columnCount: 0,
            preview: []
          });
        }
      };

      reader.onerror = () => {
        resolve({
          isValid: false,
          errors: ['Failed to read file'],
          warnings: [],
          detectedType: 'unknown',
          rowCount: 0,
          columnCount: 0,
          preview: []
        });
      };

      reader.readAsText(file);
    });
  }

  // Парсинг числовых значений
  private parseNumber(value: string): number {
    if (!value || value.trim() === '') return 0;
    
    // Убираем символы валют, запятые, пробелы
    const cleaned = value.toString()
      .replace(/[$€£¥,\s]/g, '')
      .replace(/[()]/g, '-'); // Отрицательные числа в скобках
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Парсинг целых чисел
  private parseInt(value: string): number {
    if (!value || value.trim() === '') return 0;
    
    const cleaned = value.toString().replace(/[,\s]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Нормализация даты
  private parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  // Определение источника по данным
  private detectSource(rowData: any, headers: string[]): string {
    const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
    
    // Ищем колонку с источником
    const sourceIndex = normalizedHeaders.findIndex(h => 
      h.includes('source') || h.includes('network') || h.includes('platform')
    );
    
    if (sourceIndex >= 0 && rowData[sourceIndex]) {
      return rowData[sourceIndex].toString().trim();
    }

    // Определяем по другим признакам
    const campaignName = (rowData[normalizedHeaders.findIndex(h => h.includes('campaign'))] || '').toLowerCase();
    
    if (campaignName.includes('meta') || campaignName.includes('facebook') || campaignName.includes('instagram')) {
      return 'Meta Ads';
    } else if (campaignName.includes('google') || campaignName.includes('adwords')) {
      return 'Google Ads';
    } else if (campaignName.includes('tiktok')) {
      return 'TikTok Ads';
    } else if (campaignName.includes('unity')) {
      return 'Unity Ads';
    } else if (campaignName.includes('snapchat')) {
      return 'Snapchat Ads';
    }
    
    return 'Unknown Source';
  }

  // Обработка одного CSV файла
  async processCSVFile(file: File): Promise<{ campaigns: CampaignRow[], creatives: CreativeRow[] }> {
    const validation = await this.validateCSV(file);
    
    if (!validation.isValid) {
      throw new Error(`Invalid CSV file: ${validation.errors.join(', ')}`);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const rows = this.parseCSV(csvText);
          const headers = rows[0];
          const dataRows = rows.slice(1);
          const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
          
          const campaigns: CampaignRow[] = [];
          const creatives: CreativeRow[] = [];

          // Маппинг колонок
          const getColumnIndex = (columnNames: string[]) => {
            for (const colName of columnNames) {
              const index = normalizedHeaders.findIndex(h => 
                h.includes(colName.replace('_', '')) || h === colName
              );
              if (index >= 0) return index;
            }
            return -1;
          };

          const dateIndex = getColumnIndex(['date', 'day']);
          const campaignIndex = getColumnIndex(['campaign_name', 'campaign']);
          const appIndex = getColumnIndex(['app_name', 'app']);
          const countryIndex = getColumnIndex(['country', 'geo']);
          const spendIndex = getColumnIndex(['spend', 'cost', 'amount']);
          const installsIndex = getColumnIndex(['installs', 'downloads']);
          const actionsIndex = getColumnIndex(['actions', 'conversions', 'events']);
          const creativeIndex = getColumnIndex(['creative_name', 'creative', 'ad_name']);

          dataRows.forEach((row, index) => {
            try {
              const spend = this.parseNumber(row[spendIndex] || '0');
              const installs = this.parseInt(row[installsIndex] || '0');
              const actions = actionsIndex >= 0 ? this.parseInt(row[actionsIndex] || '0') : installs;
              const cpi = installs > 0 ? spend / installs : 0;

              const baseData = {
                id: `${file.name}_${index}`,
                date: this.parseDate(row[dateIndex] || ''),
                campaign_name: row[campaignIndex] || 'Unknown Campaign',
                app_name: row[appIndex] || 'Unknown App',
                country: row[countryIndex] || 'Unknown',
                spend,
                installs,
                actions,
                cpi,
                source: this.detectSource(row, headers),
                raw_data: Object.fromEntries(headers.map((h, i) => [h, row[i]]))
              };

              if (validation.detectedType === 'creative' && creativeIndex >= 0) {
                creatives.push({
                  ...baseData,
                  creative_name: row[creativeIndex] || 'Unknown Creative',
                  format: this.detectCreativeFormat(row, headers),
                  size: this.detectCreativeSize(row, headers)
                });
              } else {
                campaigns.push(baseData);
              }

            } catch (error) {
              console.warn(`Error processing row ${index + 2}:`, error);
            }
          });

          resolve({ campaigns, creatives });

        } catch (error) {
          reject(new Error(`Failed to process CSV file: ${(error as Error).message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Определение формата креатива
  private detectCreativeFormat(rowData: any, headers: string[]): string {
    const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
    const formatIndex = normalizedHeaders.findIndex(h => h.includes('format') || h.includes('type'));
    
    if (formatIndex >= 0 && rowData[formatIndex]) {
      return rowData[formatIndex].toString().trim();
    }

    // Определяем по названию креатива
    const creativeName = (rowData[normalizedHeaders.findIndex(h => h.includes('creative'))] || '').toLowerCase();
    
    if (creativeName.includes('video')) return 'Video';
    if (creativeName.includes('banner')) return 'Banner';
    if (creativeName.includes('carousel')) return 'Carousel';
    if (creativeName.includes('story')) return 'Story';
    if (creativeName.includes('native')) return 'Native';
    
    return 'Image';
  }

  // Определение размера креатива
  private detectCreativeSize(rowData: any, headers: string[]): string {
    const normalizedHeaders = headers.map(h => this.normalizeHeader(h));
    const sizeIndex = normalizedHeaders.findIndex(h => h.includes('size') || h.includes('dimension'));
    
    if (sizeIndex >= 0 && rowData[sizeIndex]) {
      return rowData[sizeIndex].toString().trim();
    }

    const format = this.detectCreativeFormat(rowData, headers);
    
    // Размеры по умолчанию для форматов
    switch (format) {
      case 'Video': return '1080x1920';
      case 'Story': return '1080x1920';
      case 'Banner': return '728x90';
      case 'Carousel': return '1080x1080';
      case 'Native': return '1200x628';
      default: return '1080x1080';
    }
  }

  // Обработка множественных файлов
  async processMultipleFiles(files: File[]): Promise<ProcessedData> {
    const allCampaigns: CampaignRow[] = [];
    const allCreatives: CreativeRow[] = [];
    const fileNames: string[] = [];

    // Обрабатываем файлы последовательно
    for (const file of files) {
      try {
        const { campaigns, creatives } = await this.processCSVFile(file);
        allCampaigns.push(...campaigns);
        allCreatives.push(...creatives);
        fileNames.push(file.name);
        
        toast({
          title: "File Processed",
          description: `${file.name}: ${campaigns.length + creatives.length} rows processed`,
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        toast({
          title: "Processing Error",
          description: `Failed to process ${file.name}: ${(error as Error).message}`,
          variant: "destructive",
        });
      }
    }

    // Агрегируем данные
    const apps = [...new Set([...allCampaigns, ...allCreatives].map(row => row.app_name))];
    const countries = [...new Set([...allCampaigns, ...allCreatives].map(row => row.country))];
    const sources = [...new Set([...allCampaigns, ...allCreatives].map(row => row.source || 'Unknown'))];

    const totalSpend = [...allCampaigns, ...allCreatives].reduce((sum, row) => sum + row.spend, 0);
    const totalInstalls = [...allCampaigns, ...allCreatives].reduce((sum, row) => sum + row.installs, 0);
    const totalActions = [...allCampaigns, ...allCreatives].reduce((sum, row) => sum + (row.actions || 0), 0);
    const avgCPI = totalInstalls > 0 ? totalSpend / totalInstalls : 0;

    // Определяем диапазон дат
    const allDates = [...allCampaigns, ...allCreatives].map(row => row.date).sort();
    const dateRange = {
      start: allDates[0] || new Date().toISOString().split('T')[0],
      end: allDates[allDates.length - 1] || new Date().toISOString().split('T')[0]
    };

    return {
      campaigns: allCampaigns,
      creatives: allCreatives,
      apps,
      countries,
      sources,
      totalSpend,
      totalInstalls,
      totalActions,
      avgCPI,
      dateRange,
      processedAt: new Date().toISOString(),
      fileNames
    };
  }
}

// Экспортируем singleton instance
export const csvProcessor = new CSVProcessor();
