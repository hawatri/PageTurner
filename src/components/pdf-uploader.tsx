"use client";

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, Zap, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
}

export function PdfUploader({ onFileSelect }: PdfUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validatePDF = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer.slice(0, 5));
        const header = String.fromCharCode(...bytes);
        resolve(header === '%PDF-');
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 5));
    });
  }, []);

  const handleFile = useCallback(async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setIsValidating(true);

      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please upload a PDF file smaller than 50MB.',
        });
        setIsValidating(false);
        return;
      }

      // Validate file type and content
      const isValidPDF = file.type === 'application/pdf' && await validatePDF(file);
      
      if (isValidPDF) {
        onFileSelect(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a valid PDF file. The file may be corrupted or not a proper PDF.',
        });
      }
      setIsValidating(false);
    }
  }, [onFileSelect, toast, validatePDF]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card className="shadow-2xl animate-fade-in">
        <CardHeader className="text-center p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-5xl font-bold font-headline text-primary tracking-tight">PageTurner</h1>
            </div>
            <p className="text-muted-foreground text-xl mt-2">Transform your PDFs into immersive, interactive flipbooks</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Fast Processing
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Interactive Reading
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                Export Ready
              </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
            <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                <input ref={inputRef} type="file" id="input-file-upload" accept=".pdf" className="hidden" onChange={handleChange} />
                <label 
                    id="label-file-upload" 
                    htmlFor="input-file-upload" 
                    className={`h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${dragActive ? "border-primary bg-primary/10 scale-105" : "border-border hover:bg-accent/10 hover:border-primary/50"}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className={`p-4 rounded-full mb-6 transition-colors ${dragActive ? "bg-primary/20" : "bg-muted"}`}>
                      <UploadCloud className={`w-16 h-16 transition-colors ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    {isValidating ? (
                      <>
                        <p className="text-xl font-semibold mb-2">Validating PDF...</p>
                        <Progress value={50} className="w-32 mb-4" />
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-semibold mb-2">Drop your PDF here</p>
                        <p className="text-muted-foreground mb-4">or click to browse your files</p>
                      </>
                    )}
                    <Button 
                      type="button" 
                      onClick={onButtonClick} 
                      size="lg"
                      disabled={isValidating}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {isValidating ? 'Validating...' : 'Choose PDF File'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">Maximum file size: 50MB</p>
                </label>
            </form>
        </CardContent>
      </Card>
      
      {/* Features showcase */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Interactive Reading</h3>
          <p className="text-sm text-muted-foreground">Realistic page-turning animations with smooth transitions and natural feel</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Smart Features</h3>
          <p className="text-sm text-muted-foreground">Bookmarks, auto-flip, zoom controls, and keyboard shortcuts for enhanced reading</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Export & Share</h3>
          <p className="text-sm text-muted-foreground">Download pages as images or share your flipbook with others easily</p>
        </Card>
      </div>
    </div>
  );
}
