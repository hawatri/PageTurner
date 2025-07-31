"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
}

export function PdfUploader({ onFileSelect }: PdfUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (files: FileList | null) => {
    if (files && files[0]) {
      if (files[0].type === 'application/pdf') {
        onFileSelect(files[0]);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a valid PDF file.',
        });
      }
    }
  };

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
    <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-fade-in">
        <CardHeader className="text-center p-8">
            <h1 className="text-5xl font-bold font-headline text-primary tracking-tight">PageTurner</h1>
            <p className="text-muted-foreground text-lg mt-2">Convert your PDFs into beautiful flipbooks instantly.</p>
        </CardHeader>
        <CardContent className="p-8 pt-0">
            <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                <input ref={inputRef} type="file" id="input-file-upload" accept=".pdf" className="hidden" onChange={handleChange} />
                <label 
                    id="label-file-upload" 
                    htmlFor="input-file-upload" 
                    className={`h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? "border-primary bg-primary/10" : "border-border hover:bg-accent/10"}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <UploadCloud className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="mt-2 text-lg font-medium">Drag & Drop your PDF here</p>
                    <p className="text-sm text-muted-foreground">or</p>
                    <Button type="button" onClick={onButtonClick} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">Browse Files</Button>
                </label>
            </form>
        </CardContent>
    </Card>
  );
}
