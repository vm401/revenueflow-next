import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload as UploadIcon, X, Trash2, AlertTriangle, Loader2, FileText, CheckCircle, Eye, Download, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UltraCSVProcessor, UltraProcessedCSVData, CSVValidation } from "@/lib/ultraCSVProcessor";
import { useUltraData } from "@/contexts/UltraDataContext";

interface FileUpload {
  id: string;
  file: File;
  status: "pending" | "validating" | "uploading" | "success" | "error";
  progress: number;
  validation?: CSVValidation;
  errorMessage?: string;
}

export default function Upload() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { setData, clearData, data } = useUltraData();

  // Handle file selection and validation
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

    // Create file uploads and validate
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
        status: "validating",
        progress: 0,
      };

      fileUploads.push(fileUpload);
    }

    setFiles(prev => [...prev, ...fileUploads]);

    // Validate files
    for (const fileUpload of fileUploads) {
      try {
        const validation = await UltraCSVProcessor.validateUltraCSV(fileUpload.file);
        
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id 
            ? { 
                ...f, 
                status: validation.isValid ? "pending" : "error",
                validation,
                errorMessage: validation.errors.join(', ')
              }
            : f
        ));

        if (!validation.isValid) {
          toast({
            title: "Validation Failed",
            description: `${fileUpload.file.name}: ${validation.errors[0]}`,
            variant: "destructive",
          });
        } else if (validation.warnings.length > 0) {
          toast({
            title: "Validation Warning",
            description: `${fileUpload.file.name}: ${validation.warnings.length} warning(s)`,
          });
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id 
            ? { 
                ...f, 
                status: "error",
                errorMessage: 'Failed to validate file'
              }
            : f
        ));
      }
    }

    if (fileUploads.length > 0) {
      toast({
        title: "Files Added",
        description: `${fileUploads.length} file(s) ready for processing`,
      });
    }
  };

  // Process all valid files
  const processFiles = async () => {
    const validFiles = files.filter(f => f.status === "pending" && f.validation?.isValid);
    
    if (validFiles.length === 0) {
      toast({
        title: "No Valid Files",
        description: "Please add valid CSV files before processing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        validFiles.some(vf => vf.id === f.id) 
          ? { ...f, status: "uploading" as const, progress: 0 }
          : f
      ));

      // Simulate progress for each file
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.status === "uploading" && f.progress < 90
            ? { ...f, progress: f.progress + Math.random() * 20 }
            : f
        ));
      }, 500);

      // Process files with ultra processor
      let allProcessedData: UltraProcessedCSVData = {
        campaigns: [],
        creatives: [],
        apps: [],
        exchanges: [],
        inventory: [],
        summary: { 
          totalCampaigns: 0, 
          totalCreatives: 0,
          totalExchanges: 0,
          totalInventory: 0,
          totalApps: 0,
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

      for (const fileUpload of validFiles) {
        const fileData = await UltraCSVProcessor.processUltraCSV(fileUpload.file);
        allProcessedData.campaigns.push(...fileData.campaigns);
        allProcessedData.creatives.push(...fileData.creatives);
        allProcessedData.apps.push(...fileData.apps);
        allProcessedData.exchanges.push(...fileData.exchanges);
        allProcessedData.inventory.push(...fileData.inventory);
        
        // Update available countries, apps, exchanges, OS
        fileData.availableCountries.forEach(country => {
          if (!allProcessedData.availableCountries.includes(country)) {
            allProcessedData.availableCountries.push(country);
          }
        });
        
        fileData.availableApps.forEach(app => {
          if (!allProcessedData.availableApps.includes(app)) {
            allProcessedData.availableApps.push(app);
          }
        });
        
        fileData.availableExchanges.forEach(exchange => {
          if (!allProcessedData.availableExchanges.includes(exchange)) {
            allProcessedData.availableExchanges.push(exchange);
          }
        });
        
        fileData.availableOS.forEach(os => {
          if (!allProcessedData.availableOS.includes(os)) {
            allProcessedData.availableOS.push(os);
          }
        });
        
        allProcessedData.recordCount += fileData.recordCount;
      }

      // Update metadata
      allProcessedData.fileCount = validFiles.length;
      allProcessedData.processedAt = new Date().toISOString();

      // Recalculate summary
      const totalSpend = allProcessedData.campaigns.reduce((sum, c) => sum + c.totalSpend, 0);
      const totalInstalls = allProcessedData.campaigns.reduce((sum, c) => sum + c.totalInstalls, 0);
      const totalImpressions = allProcessedData.campaigns.reduce((sum, c) => sum + c.totalImpressions, 0);
      const totalClicks = allProcessedData.campaigns.reduce((sum, c) => sum + c.totalClicks, 0);
      const totalActions = allProcessedData.campaigns.reduce((sum, c) => sum + c.totalActions, 0);
      
      allProcessedData.summary = {
        totalCampaigns: allProcessedData.campaigns.length,
        totalCreatives: allProcessedData.creatives.length,
        totalExchanges: allProcessedData.exchanges.length,
        totalInventory: allProcessedData.inventory.length,
        totalApps: allProcessedData.apps.length,
        totalSpend,
        totalInstalls,
        totalImpressions,
        totalClicks,
        totalActions,
        avgCPI: totalInstalls > 0 ? totalSpend / totalInstalls : 0,
        avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
        avgIPM: totalImpressions > 0 ? (totalInstalls / totalImpressions) * 1000 : 0,
        avgVTR: 0,
        totalRevenue: 0,
        avgROAS: 0,
        avgRetention: 0
      };

      const processedData = allProcessedData;

      clearInterval(progressInterval);

      // Update status to success
      setFiles(prev => prev.map(f => 
        validFiles.some(vf => vf.id === f.id) 
          ? { ...f, status: "success" as const, progress: 100 }
          : f
      ));

      // Save processed data
      setData(processedData);

      toast({
        title: "Processing Complete",
        description: `Successfully processed ${processedData.campaigns.length} campaigns and ${processedData.creatives.length} creatives from ${validFiles.length} files`,
      });

    } catch (error) {
      // Update failed files
      setFiles(prev => prev.map(f => 
        f.status === "uploading" 
          ? { ...f, status: "error" as const, errorMessage: (error as Error).message }
          : f
      ));

      toast({
        title: "Processing Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all data
  const clearAllData = () => {
    clearData();
    setFiles([]);
    setSelectedFile(null);
    
    toast({
      title: "Data Cleared",
      description: "All files and processed data have been removed",
    });
  };

  // Remove individual file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    if (selectedFile === id) {
      setSelectedFile(null);
    }
  };

  // Drag and drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFiles = Array.from(e.dataTransfer.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "uploading": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "validating": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const selectedFileData = files.find(f => f.id === selectedFile);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CSV Data Upload</h1>
            <p className="text-muted-foreground">
              Upload and process your campaign CSV files
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Database className="h-3 w-3 mr-1" />
                {data.campaigns.length + data.creatives.length} rows loaded
              </Badge>
              <Button variant="outline" onClick={() => data && setData(data)}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="preview">Preview Data</TabsTrigger>
            <TabsTrigger value="processed">Processed Data</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV Files</CardTitle>
                <CardDescription>
                  Drag and drop your campaign CSV files or click to select
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop your CSV files here</p>
                  <p className="text-muted-foreground mb-4">
                    Or click to select files (Max 10 files, 50MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Select Files
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Uploaded Files</CardTitle>
                      <CardDescription>
                        {files.filter(f => f.validation?.isValid).length} of {files.length} files are valid
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={processFiles} 
                        disabled={isProcessing || !files.some(f => f.validation?.isValid)}
                        className="flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Database className="h-4 w-4" />
                        )}
                        Process Files
                      </Button>
                      <Button variant="outline" onClick={clearAllData}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                              {file.validation && (
                                <span className="ml-2">
                                  • {file.validation.rowCount} rows • {file.validation.detectedType}
                                </span>
                              )}
                            </p>
                            {file.errorMessage && (
                              <p className="text-sm text-destructive mt-1">{file.errorMessage}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className={getStatusColor(file.status)}>
                            {file.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {file.status === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {file.status === "uploading" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {file.status}
                          </Badge>

                          {file.validation && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFile(file.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {file.status === "uploading" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Format Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>CSV Format Requirements</CardTitle>
                <CardDescription>
                  Your CSV files should contain the following columns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Campaign Reports:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Badge variant="outline">date</Badge>
                    <Badge variant="outline">campaign_name</Badge>
                    <Badge variant="outline">app_name</Badge>
                    <Badge variant="outline">country</Badge>
                    <Badge variant="outline">spend</Badge>
                    <Badge variant="outline">installs</Badge>
                    <Badge variant="outline">actions (optional)</Badge>
                    <Badge variant="outline">source (optional)</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Creative Reports:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Badge variant="outline">date</Badge>
                    <Badge variant="outline">creative_name</Badge>
                    <Badge variant="outline">campaign_name</Badge>
                    <Badge variant="outline">app_name</Badge>
                    <Badge variant="outline">spend</Badge>
                    <Badge variant="outline">installs</Badge>
                    <Badge variant="outline">format (optional)</Badge>
                    <Badge variant="outline">size (optional)</Badge>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Column names are flexible - the system will automatically 
                    detect variations like "Campaign Name", "campaign", "App", "application_name", etc.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            {selectedFileData?.validation ? (
              <Card>
                <CardHeader>
                  <CardTitle>File Preview: {selectedFileData.file.name}</CardTitle>
                  <CardDescription>
                    {selectedFileData.validation.detectedType} data • {selectedFileData.validation.rowCount} rows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedFileData.validation.warnings.length > 0 && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warnings:</strong>
                        <ul className="mt-1 list-disc list-inside">
                          {selectedFileData.validation.warnings.map((warning, i) => (
                            <li key={i} className="text-sm">{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {selectedFileData.validation.preview[0]?.map((header, i) => (
                            <TableHead key={i}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFileData.validation.preview.slice(1).map((row, i) => (
                          <TableRow key={i}>
                            {row.map((cell, j) => (
                              <TableCell key={j} className="max-w-[200px] truncate">
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Select a file to preview its contents</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="processed">
            {data ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Summary</CardTitle>
                    <CardDescription>
                      Data processed on {new Date(data.processedAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{data.campaigns.length}</div>
                        <div className="text-sm text-muted-foreground">Campaigns</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{data.creatives.length}</div>
                        <div className="text-sm text-muted-foreground">Creatives</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{data.apps.length}</div>
                        <div className="text-sm text-muted-foreground">Apps</div>
                      </div>
                      <div className="text-center">
                                        <div className="text-2xl font-bold">{data.availableCountries.length}</div>
                <div className="text-sm text-muted-foreground">Countries</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold">${data.summary.totalSpend.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Spend</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold">{data.summary.totalInstalls.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Installs</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold">${data.summary.avgCPI.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Average CPI</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processed Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {files.filter(f => f.status === 'success').map((file, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{file.file.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No processed data available. Upload and process CSV files first.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}