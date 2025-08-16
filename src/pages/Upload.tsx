import { useState, useCallback, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload as UploadIcon, X, Trash2, AlertTriangle, Loader2, FileText, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FileUpload {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  preview?: string[][];
  validationErrors?: string[];
  rowCount?: number;
  columnCount?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview: string[][];
  rowCount: number;
  columnCount: number;
}

export default function Upload() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // CSV validation function
  const validateCSV = async (file: File): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            resolve({
              isValid: false,
              errors: ['File is empty'],
              warnings: [],
              preview: [],
              rowCount: 0,
              columnCount: 0
            });
            return;
          }

          // Parse CSV (simple parser - could be enhanced)
          const rows = lines.map(line => {
            // Handle quoted values and commas
            const result: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          });

          const headers = rows[0]?.map(h => h.toLowerCase().replace(/['"]/g, '')) || [];
          const dataRows = rows.slice(1);
          
          // Validation rules
          const errors: string[] = [];
          const warnings: string[] = [];

          // Check required columns for campaign data
          const requiredCampaignColumns = ['date', 'campaign_name', 'app_name', 'country', 'spend', 'installs'];
          const requiredCreativeColumns = ['date', 'creative_name', 'campaign_name', 'app_name', 'spend', 'installs'];
          
          const hasRequiredCampaignColumns = requiredCampaignColumns.every(col => 
            headers.some(header => header.includes(col.replace('_', '')))
          );
          
          const hasRequiredCreativeColumns = requiredCreativeColumns.every(col => 
            headers.some(header => header.includes(col.replace('_', '')))
          );

          if (!hasRequiredCampaignColumns && !hasRequiredCreativeColumns) {
            errors.push('Missing required columns. Expected either campaign or creative data format.');
          }

          // Check data types in sample rows
          if (dataRows.length > 0) {
            const sampleRows = dataRows.slice(0, 5);
            
            sampleRows.forEach((row, idx) => {
              if (row.length !== headers.length) {
                warnings.push(`Row ${idx + 2}: Column count mismatch (${row.length} vs ${headers.length})`);
              }

              // Check spend column (should be numeric)
              const spendIndex = headers.findIndex(h => h.includes('spend'));
              if (spendIndex >= 0 && row[spendIndex]) {
                const spendValue = parseFloat(row[spendIndex].replace(/[$,]/g, ''));
                if (isNaN(spendValue)) {
                  warnings.push(`Row ${idx + 2}: Invalid spend value "${row[spendIndex]}"`);
                }
              }

              // Check installs column (should be numeric)
              const installsIndex = headers.findIndex(h => h.includes('installs'));
              if (installsIndex >= 0 && row[installsIndex]) {
                const installsValue = parseInt(row[installsIndex].replace(/[,]/g, ''));
                if (isNaN(installsValue)) {
                  warnings.push(`Row ${idx + 2}: Invalid installs value "${row[installsIndex]}"`);
                }
              }

              // Check date format
              const dateIndex = headers.findIndex(h => h.includes('date'));
              if (dateIndex >= 0 && row[dateIndex]) {
                const dateValue = new Date(row[dateIndex]);
                if (isNaN(dateValue.getTime())) {
                  warnings.push(`Row ${idx + 2}: Invalid date format "${row[dateIndex]}"`);
                }
              }
            });
          }

          // Size warnings
          if (dataRows.length > 10000) {
            warnings.push(`Large file: ${dataRows.length} rows. Processing may take longer.`);
          }

          if (dataRows.length === 0) {
            errors.push('No data rows found (only headers)');
          }

          resolve({
            isValid: errors.length === 0,
            errors,
            warnings,
            preview: rows.slice(0, 6), // First 5 data rows + header
            rowCount: dataRows.length,
            columnCount: headers.length
          });
        } catch (error) {
          resolve({
            isValid: false,
            errors: ['Failed to parse CSV file'],
            warnings: [],
            preview: [],
            rowCount: 0,
            columnCount: 0
          });
        }
      };
      reader.readAsText(file);
    });
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return api.uploadMultipleCSV(files);
    },
    onSuccess: (response) => {
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded and processed successfully`,
      });
      
      // Mark all files as successful
      setFiles(prev => prev.map(f => ({ ...f, status: "success" as const, progress: 100 })));
      
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Mark all files as error
      setFiles(prev => prev.map(f => ({ ...f, status: "error" as const })));
    },
  });

  // Clear data mutation
  const clearDataMutation = useMutation({
    mutationFn: () => api.clearUploadedData(),
    onSuccess: () => {
      toast({
        title: "Data Cleared",
        description: "All uploaded data has been permanently deleted",
      });
      
      // Clear local files
      setFiles([]);
      
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear data';
      toast({
        title: "Clear Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    const csvFiles = newFiles.filter(file => file.type === "text/csv" || file.name.endsWith(".csv"));
    
    if (csvFiles.length !== newFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only CSV files are supported",
        variant: "destructive",
      });
    }

    if (files.length + csvFiles.length > 10) {
      toast({
        title: "Too many files",
        description: "Maximum 10 files allowed",
        variant: "destructive",
      });
      return;
    }

    // Create file uploads with validation
    const fileUploads: FileUpload[] = [];
    
    for (const file of csvFiles) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        continue;
      }

      const fileUpload: FileUpload = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: "pending",
        progress: 0,
      };

      // Validate CSV in background
      try {
        const validation = await validateCSV(file);
        fileUpload.preview = validation.preview;
        fileUpload.validationErrors = validation.errors;
        fileUpload.rowCount = validation.rowCount;
        fileUpload.columnCount = validation.columnCount;

        if (!validation.isValid) {
          toast({
            title: "Validation Warning",
            description: `${file.name} has validation issues. Check the preview.`,
            variant: "destructive",
          });
        } else if (validation.warnings.length > 0) {
          toast({
            title: "File Warning",
            description: `${file.name} has ${validation.warnings.length} warning(s). Check the preview.`,
          });
        }
      } catch (error) {
        fileUpload.validationErrors = ['Failed to validate file'];
      }

      fileUploads.push(fileUpload);
    }

    setFiles(prev => [...prev, ...fileUploads]);

    if (fileUploads.length > 0) {
      toast({
        title: "Files Added",
        description: `${fileUploads.length} file(s) ready for upload`,
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    // Mark all files as uploading
    setFiles(prev => prev.map(f => ({ ...f, status: "uploading" as const, progress: 0 })));

    // Start progress animation
    const progressInterval = setInterval(() => {
      setFiles(prev => prev.map(f => ({
        ...f,
        progress: f.status === "uploading" ? Math.min(f.progress + 5, 95) : f.progress
      })));
    }, 200);

    try {
      const fileList = files.map(f => f.file);
      await uploadMutation.mutateAsync(fileList);
    } catch (error) {
      // Error handling is done in mutation
    } finally {
      clearInterval(progressInterval);
    }
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all uploaded data? This action cannot be undone.")) {
      clearDataMutation.mutate();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload CSV Files</h1>
          <p className="text-muted-foreground">
            Upload campaign, inventory, and creative reports for analysis
          </p>
        </div>

        {/* Upload Zone */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>Drag and drop CSV files or click to select</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Drop your CSV files here</h3>
              <p className="text-muted-foreground mb-4">
                Support for campaign, inventory, and creative reports
              </p>
              <Button asChild>
                <label className="cursor-pointer">
                  Click to select files
                  <input
                    type="file"
                    multiple
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum 10 files, 100MB each
              </p>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Selected Files ({files.length})</CardTitle>
                  <CardDescription>Files ready for upload</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={clearAllFiles}
                    disabled={uploadMutation.isPending}
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={uploadFiles}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Files'
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((fileUpload) => (
                  <div key={fileUpload.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{fileUpload.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {fileUpload.status === "uploading" && (
                        <Progress value={fileUpload.progress} className="mt-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {fileUpload.status === "pending" && (
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )}
                      {fileUpload.status === "uploading" && (
                        <span className="text-sm text-blue-600">Uploading...</span>
                      )}
                      {fileUpload.status === "success" && (
                        <span className="text-sm text-green-600">Success</span>
                      )}
                      {fileUpload.status === "error" && (
                        <span className="text-sm text-red-600">Error</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileUpload.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>File Format Requirements</CardTitle>
            <CardDescription>Ensure your CSV files follow these guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Campaign Reports</h4>
                <p className="text-sm text-muted-foreground mb-2">Required columns:</p>
                <ul className="text-xs space-y-1">
                  <li>• <code>date</code> - Campaign date (YYYY-MM-DD)</li>
                  <li>• <code>campaign_name</code> - Campaign name</li>
                  <li>• <code>app_name</code> - Application name</li>
                  <li>• <code>country</code> - Target country (US, UK, etc.)</li>
                  <li>• <code>spend</code> - Total spend amount</li>
                  <li>• <code>installs</code> - Number of installs</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Optional columns:</p>
                <ul className="text-xs space-y-1">
                  <li>• <code>actions</code> - Post-install actions</li>
                  <li>• <code>impressions</code> - Ad impressions</li>
                  <li>• <code>clicks</code> - Ad clicks</li>
                  <li>• <code>exchange</code> - Ad exchange</li>
                  <li>• <code>inventory_type</code> - Inventory type</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Creative Reports</h4>
                <p className="text-sm text-muted-foreground mb-2">Required columns:</p>
                <ul className="text-xs space-y-1">
                  <li>• <code>date</code> - Campaign date</li>
                  <li>• <code>creative_name</code> - Creative name</li>
                  <li>• <code>campaign_name</code> - Associated campaign</li>
                  <li>• <code>app_name</code> - Application name</li>
                  <li>• <code>spend</code> - Creative spend</li>
                  <li>• <code>installs</code> - Installs from creative</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Optional columns:</p>
                <ul className="text-xs space-y-1">
                  <li>• <code>creative_size</code> - Creative dimensions</li>
                  <li>• <code>creative_type</code> - Image/Video/etc.</li>
                  <li>• <code>country</code> - Target country</li>
                  <li>• <code>actions</code> - Post-install actions</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h5 className="font-semibold text-sm mb-2">📋 Important Notes:</h5>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Column names are case-sensitive</li>
                <li>• Date format: YYYY-MM-DD (e.g., 2025-01-15)</li>
                <li>• Numeric values should not contain currency symbols</li>
                <li>• Files are automatically processed and validated</li>
                <li>• Duplicate data is automatically handled</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that affect all data</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will permanently delete all uploaded data and cannot be undone.
              </AlertDescription>
            </Alert>
            <Button 
              variant="destructive" 
              onClick={clearAllData}
              disabled={clearDataMutation.isPending}
            >
              {clearDataMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}