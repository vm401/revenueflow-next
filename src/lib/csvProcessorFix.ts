import Papa from 'papaparse';

export const validateCSVQuick = async (file: File) => {
  try {
    const text = await file.text();
    
    // Quick parse to get headers
    const result = Papa.parse(text, { 
      header: false,
      skipEmptyLines: true,
      preview: 10 // Only parse first 10 rows for validation
    });
    
    if (result.errors.length > 0) {
      console.error('Papa parse errors:', result.errors);
    }
    
    const rows = result.data as string[][];
    
    if (rows.length === 0) {
      return {
        isValid: false,
        errors: ['File is empty'],
        preview: [],
        rowCount: 0
      };
    }

    const headers = rows[0].map(h => String(h).toLowerCase().trim());
    console.log('CSV Headers:', headers);
    console.log('Sample row:', rows[1]);
    
    // Very flexible validation - just check if we have some basic columns
    const hasDate = headers.some(h => h.includes('date') || h.includes('time'));
    const hasNumericData = headers.some(h => 
      h.includes('spend') || h.includes('cost') || h.includes('revenue') ||
      h.includes('install') || h.includes('click') || h.includes('impression')
    );
    
    if (!hasDate && !hasNumericData) {
      return {
        isValid: false,
        errors: [
          'Could not identify data format',
          'Expected columns with date/time and numeric data (spend, installs, etc.)',
          `Found: ${headers.join(', ')}`
        ],
        preview: rows.slice(0, 5),
        rowCount: rows.length - 1
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: [`Detected ${headers.length} columns, ${rows.length - 1} data rows`],
      preview: rows.slice(0, 5),
      rowCount: rows.length - 1
    };
    
  } catch (error) {
    console.error('CSV validation error:', error);
    return {
      isValid: false,
      errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      preview: [],
      rowCount: 0
    };
  }
};

export const processCSVQuick = async (file: File) => {
  try {
    const text = await file.text();
    
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim()
    });
    
    const data = result.data as Record<string, any>[];
    console.log(`Processed ${data.length} rows`);
    console.log('Sample processed row:', data[0]);
    
    // Convert to campaign format
    const campaigns = data.map((row, index) => {
      // Try to extract common fields with flexible column names
      const getField = (possibleNames: string[]) => {
        for (const name of possibleNames) {
          if (row[name] !== undefined && row[name] !== '') {
            return row[name];
          }
        }
        return '';
      };
      
      const getNumericField = (possibleNames: string[]) => {
        for (const name of possibleNames) {
          if (row[name] !== undefined && row[name] !== '') {
            const num = parseFloat(String(row[name]).replace(/[,$]/g, ''));
            return isNaN(num) ? 0 : num;
          }
        }
        return 0;
      };
      
      return {
        id: `csv-${index}`,
        date: getField(['date', 'day', 'time', 'timestamp']) || new Date().toISOString().split('T')[0],
        campaign_name: getField(['campaign_name', 'campaign', 'name', 'campaign_id']) || `Campaign ${index + 1}`,
        app_name: getField(['app_name', 'app', 'bundle_id', 'package_name']) || 'Unknown App',
        country: getField(['country', 'country_code', 'geo', 'region']) || 'US',
        spend: getNumericField(['spend', 'cost', 'amount', 'revenue']),
        installs: Math.round(getNumericField(['installs', 'installations', 'conversions', 'actions'])),
        actions: Math.round(getNumericField(['actions', 'clicks', 'events'])),
        cpi: 0, // Will be calculated
        source: getField(['source', 'platform', 'network', 'channel']) || 'Unknown',
        raw_data: row
      };
    }).filter(campaign => campaign.spend > 0 || campaign.installs > 0); // Filter out empty rows
    
    // Calculate CPI
    campaigns.forEach(campaign => {
      campaign.cpi = campaign.installs > 0 ? campaign.spend / campaign.installs : 0;
    });
    
    console.log(`Created ${campaigns.length} campaign records`);
    
    return {
      campaigns,
      creatives: [], // Empty for now
      apps: [],
      exchanges: [],
      inventory: [],
      summary: {
        totalCampaigns: campaigns.length,
        totalSpend: campaigns.reduce((sum, c) => sum + c.spend, 0),
        totalInstalls: campaigns.reduce((sum, c) => sum + c.installs, 0),
        avgCPI: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.cpi, 0) / campaigns.length : 0
      }
    };
    
  } catch (error) {
    console.error('CSV processing error:', error);
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
