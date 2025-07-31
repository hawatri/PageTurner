"use client";

import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfUploader } from './pdf-uploader';
import { FlipbookView } from './flipbook-view';
import { Progress } from './ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export function PageTurner() {
    const [pages, setPages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();

    const handlePdfUpload = useCallback(async (file: File) => {
        if (!file) return;

        setIsLoading(true);
        setProgress(0);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            const numPages = pdf.numPages;
            const newPages: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                newPages.push(canvas.toDataURL('image/jpeg', 0.9));
                setProgress((i / numPages) * 100);
            }

            setPages(newPages);
        } catch (error) {
            console.error("Error processing PDF:", error);
            toast({
                variant: 'destructive',
                title: 'Error Processing PDF',
                description: 'There was an issue converting your PDF. Please try a different file.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    const handleReset = useCallback(() => {
        setPages([]);
        setProgress(0);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full max-w-md mx-auto text-center">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Processing PDF...</CardTitle>
                        <CardDescription>Please wait while we convert your document.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progress} className="w-full" />
                        <p className="mt-2 text-sm font-semibold text-primary">{Math.round(progress)}%</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (pages.length > 0) {
        return <FlipbookView pages={pages} onReset={handleReset} />;
    }

    return <PdfUploader onFileSelect={handlePdfUpload} />;
}
