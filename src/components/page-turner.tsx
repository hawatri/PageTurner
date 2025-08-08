"use client";

import { useState, useCallback, useEffect } from 'react';
import { PdfUploader } from './pdf-uploader';
import { FlipbookView } from './flipbook-view';
import { Progress } from './ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Clock, Eye, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentInfo {
  name: string;
  pages: number;
  size: string;
  uploadDate: Date;
}

const STORAGE_KEY = 'pageturner_recent_docs';

export function PageTurner() {
    const [pages, setPages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
    const [recentDocuments, setRecentDocuments] = useState<DocumentInfo[]>([]);
    const { toast } = useToast();

    // Load recent documents from localStorage
    useEffect(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecentDocuments(parsed.map((doc: any) => ({
            ...doc,
            uploadDate: new Date(doc.uploadDate)
          })));
        }
      } catch (error) {
        console.error('Error loading recent documents:', error);
      }
    }, []);

    // Save recent documents to localStorage
    const saveRecentDocuments = useCallback((docs: DocumentInfo[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
      } catch (error) {
        console.error('Error saving recent documents:', error);
      }
    }, []);

    const handlePdfUpload = useCallback(async (file: File) => {
        if (!file) return;

        setIsLoading(true);
        setProgress(0);
        setCurrentStep('Loading PDF...');

        try {
            setCurrentStep('Reading file...');
            const arrayBuffer = await file.arrayBuffer();
            setProgress(10);
            
            // Dynamically import pdfjs-dist to avoid SSR issues
            const pdfjsLib = await import('pdfjs-dist');
            
            // Set worker source
            if (typeof window !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }
            
            setCurrentStep('Parsing PDF structure...');
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            setProgress(20);

            const numPages = pdf.numPages;
            const newPages: string[] = [];

            // Create document info
            const docInfo: DocumentInfo = {
              name: file.name.replace('.pdf', ''),
              pages: numPages,
              size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
              uploadDate: new Date()
            };
            setDocumentInfo(docInfo);

            // Add to recent documents
            setRecentDocuments(prev => {
              const filtered = prev.filter(doc => doc.name !== docInfo.name);
              const updated = [docInfo, ...filtered].slice(0, 5);
              saveRecentDocuments(updated);
              return updated;
            });
            
            setCurrentStep('Converting pages...');
            for (let i = 1; i <= numPages; i++) {
                setCurrentStep(`Converting page ${i} of ${numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                newPages.push(canvas.toDataURL('image/jpeg', 0.9));
                setProgress(20 + (i / numPages) * 80);
            }

            setCurrentStep('Finalizing...');
            setPages(newPages);
            
            toast({
              title: 'PDF Loaded Successfully!',
              description: `${docInfo.name} with ${numPages} pages is ready to read.`,
            });
        } catch (error) {
            console.error("Error processing PDF:", error);
            toast({
                variant: 'destructive',
                title: 'Error Processing PDF',
                description: 'There was an issue converting your PDF. Please try a different file.',
            });
        } finally {
            setIsLoading(false);
            setCurrentStep('');
        }
    }, [toast, saveRecentDocuments]);
    
    const handleReset = useCallback(() => {
        setPages([]);
        setProgress(0);
        setCurrentStep('');
        setDocumentInfo(null);
    }, []);

    const clearRecentDocuments = useCallback(() => {
      setRecentDocuments([]);
      localStorage.removeItem(STORAGE_KEY);
      toast({
        title: 'Recent Documents Cleared',
        description: 'All recent documents have been removed.',
      });
    }, [toast]);
    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Processing PDF...
                        </CardTitle>
                        <CardDescription>{currentStep}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progress} className="w-full" />
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{currentStep}</span>
                          <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: Larger PDFs may take longer to process. Please be patient while we create your interactive flipbook.
                          </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (pages.length > 0) {
        return (
          <div className="w-full h-full">
            {/* Document header */}
            {documentInfo && (
              <div className="mb-4 p-4 bg-card rounded-lg shadow-sm border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <h2 className="font-semibold text-lg">{documentInfo.name}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {documentInfo.pages} pages
                        </span>
                        <span>{documentInfo.size}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {documentInfo.uploadDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Interactive Flipbook</Badge>
                </div>
              </div>
            )}
            <FlipbookView 
              pages={pages} 
              onReset={handleReset} 
              fileName={documentInfo?.name}
            />
          </div>
        );
    }

    return (
      <div className="w-full max-w-4xl mx-auto">
        <PdfUploader onFileSelect={handlePdfUpload} />
        
        {/* Recent documents */}
        {recentDocuments.length > 0 && (
          <Card className="mt-8 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Documents
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearRecentDocuments}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              <CardDescription>Your recently viewed PDF documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.pages} pages • {doc.size} • {doc.uploadDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reload
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
}
