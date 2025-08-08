"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { PageFlip } from 'react-pageflip';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Expand, ChevronsLeft, ChevronsRight, RotateCcw, Menu, Download, Share2, Bookmark, BookOpen, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { HTMLFlipBookProps } from 'react-pageflip';

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false });

interface FlipbookViewProps {
  pages: string[];
  onReset: () => void;
  fileName?: string;
}

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>(({ children, number }, ref) => {
    return (
        <div className="flex items-center justify-center bg-white shadow-lg border border-gray-200" ref={ref}>
            <div className="flex flex-col items-center justify-center w-full h-full">
                {children}
            </div>
        </div>
    );
});
Page.displayName = 'Page';

export function FlipbookView({ pages, onReset, fileName = "document" }: FlipbookViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [autoFlip, setAutoFlip] = useState(false);
  const [flipSpeed, setFlipSpeed] = useState(1000);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [flipSound, setFlipSound] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [startTime] = useState(Date.now());
  const [nightMode, setNightMode] = useState(false);
  const [pageTransition, setPageTransition] = useState('default');
  const flipBookRef = useRef<{ pageFlip: () => PageFlip } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinchDistRef = useRef(0);
  const autoFlipIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const readingTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isClient = useMemo(() => typeof window !== 'undefined', []);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
    setReadingProgress((e.data / (totalPages - 1)) * 100);
  }, []);

  const pageFlip = flipBookRef.current?.pageFlip();

  useEffect(() => {
    if (pageFlip) {
      setTotalPages(pageFlip.getPageCount());
      pageFlip.on('flip', onFlip);
    }
    return () => {
      pageFlip?.off('flip', onFlip);
    };
  }, [pageFlip, onFlip]);

  // Reading time tracker
  useEffect(() => {
    readingTimeIntervalRef.current = setInterval(() => {
      setReadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (readingTimeIntervalRef.current) {
        clearInterval(readingTimeIntervalRef.current);
      }
    };
  }, [startTime]);

  // Auto-flip functionality
  useEffect(() => {
    if (autoFlip && pageFlip && currentPage < totalPages - 1) {
      autoFlipIntervalRef.current = setInterval(() => {
        pageFlip.flipNext();
      }, flipSpeed);
    } else {
      if (autoFlipIntervalRef.current) {
        clearInterval(autoFlipIntervalRef.current);
        autoFlipIntervalRef.current = null;
      }
    }

    return () => {
      if (autoFlipIntervalRef.current) {
        clearInterval(autoFlipIntervalRef.current);
      }
    };
  }, [autoFlip, currentPage, totalPages, flipSpeed, pageFlip]);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);
  
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
  }, []);
  
  const toggleBookmark = useCallback(() => {
    setBookmarks(prev => 
      prev.includes(currentPage) 
        ? prev.filter(p => p !== currentPage)
        : [...prev, currentPage]
    );
  }, [currentPage]);

  const downloadPDF = useCallback(() => {
    // Create a canvas to combine all pages
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // For demo purposes, we'll just trigger a download of the first page
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = pages[0];
    link.click();
  }, [pages, fileName]);

  const shareDocument = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fileName} - Page ${currentPage + 1}`,
          text: `Check out this document: ${fileName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }, [fileName, currentPage]);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
  const formatReadingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exportBookmarks = useCallback(() => {
    const bookmarkData = {
      fileName,
      bookmarks: bookmarks.map(page => ({
        page: page + 1,
        timestamp: new Date().toISOString()
      })),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(bookmarkData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_bookmarks.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [bookmarks, fileName]);

    if (e.touches.length === 2) {
      pinchDistRef.current = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const diff = newDist - pinchDistRef.current;
      setZoom(z => Math.min(Math.max(0.5, z + diff * 0.01), 2.5));
      pinchDistRef.current = newDist;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          pageFlip?.flipPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          pageFlip?.flipNext();
          break;
        case 'Home':
          e.preventDefault();
          pageFlip?.turnToPage(0);
          break;
        case 'End':
          e.preventDefault();
          pageFlip?.turnToPage(totalPages - 1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'b':
          e.preventDefault();
          toggleBookmark();
          break;
        case ' ':
          e.preventDefault();
          setAutoFlip(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [pageFlip, totalPages, toggleFullscreen, toggleBookmark]);

  const bookProps: HTMLFlipBookProps = {
    width: 550,
    height: 730,
    size: "stretch",
    minWidth: 315,
    maxWidth: 1000,
    minHeight: 400,
    maxHeight: 1533,
    maxShadowOpacity: 0.5,
    showCover: false,
    mobileScrollSupport: true,
    flippingTime: flipSpeed,
    onFlip,
    className: "shadow-2xl rounded-lg overflow-hidden",
    ref: flipBookRef,
    children: []
  };

  const SettingsDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings />
          {(autoFlip || nightMode) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reading Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Display Settings</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="night-mode">Night mode</Label>
              <Switch
                id="night-mode"
                checked={nightMode}
                onCheckedChange={setNightMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="page-numbers">Show page numbers</Label>
              <Switch
                id="page-numbers"
                checked={showPageNumbers}
                onCheckedChange={setShowPageNumbers}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Animation Settings</h4>
            <div className="space-y-2">
              <Label>Page transition effect</Label>
              <Select value={pageTransition} onValueChange={setPageTransition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="smooth">Smooth</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Auto-flip Settings</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-flip">Auto-flip pages</Label>
            <Switch
              id="auto-flip"
              checked={autoFlip}
              onCheckedChange={setAutoFlip}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Flip Speed (seconds)</Label>
            <Select value={flipSpeed.toString()} onValueChange={(value) => setFlipSpeed(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">0.5s</SelectItem>
                <SelectItem value="1000">1s</SelectItem>
                <SelectItem value="2000">2s</SelectItem>
                <SelectItem value="3000">3s</SelectItem>
                <SelectItem value="5000">5s</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Audio Settings</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="flip-sound">Flip sound effects</Label>
            <Switch
              id="flip-sound"
              checked={flipSound}
              onCheckedChange={setFlipSound}
            />
          </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Reading Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-semibold">{formatReadingTime(readingTime)}</div>
                <div className="text-muted-foreground">Reading Time</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-semibold">{bookmarks.length}</div>
                <div className="text-muted-foreground">Bookmarks</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  const Controls = ({ className }: { className?: string }) => (
    <TooltipProvider>
      <div className={cn("flex items-center justify-between gap-4 flex-wrap", className)}>
        <div className="flex items-center gap-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Tooltip><TooltipTrigger asChild><div><RotateCcw /></div></TooltipTrigger><TooltipContent><p>New PDF</p></TooltipContent></Tooltip>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Load New PDF?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will close the current document and any unsaved bookmarks will be lost. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset}>Load New PDF</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={downloadPDF}><Download /></Button></TooltipTrigger><TooltipContent><p>Download</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={shareDocument}><Share2 /></Button></TooltipTrigger><TooltipContent><p>Share</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={toggleBookmark} className={bookmarks.includes(currentPage) ? "text-amber-500" : ""}><Bookmark /></Button></TooltipTrigger><TooltipContent><p>Bookmark Page</p></TooltipContent></Tooltip>
            {bookmarks.length > 0 && (
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={exportBookmarks}><Download className="w-3 h-3" /></Button></TooltipTrigger><TooltipContent><p>Export Bookmarks</p></TooltipContent></Tooltip>
            )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-grow max-w-lg">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.turnToPage(0)} disabled={!pageFlip || currentPage === 0}><ChevronsLeft /></Button></TooltipTrigger><TooltipContent><p>First</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.flipPrev()} disabled={!pageFlip || currentPage === 0}><ArrowLeft /></Button></TooltipTrigger><TooltipContent><p>Previous</p></TooltipContent></Tooltip>
            <Slider min={0} max={totalPages > 0 ? totalPages - 1 : 0} step={1} value={[currentPage]} onValueChange={(value) => pageFlip?.turnToPage(value[0])} className="flex-grow"/>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.flipNext()} disabled={!pageFlip || currentPage >= totalPages - 1}><ArrowRight /></Button></TooltipTrigger><TooltipContent><p>Next</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.turnToPage(totalPages - 1)} disabled={!pageFlip || currentPage >= totalPages - 1}><ChevronsRight /></Button></TooltipTrigger><TooltipContent><p>Last</p></TooltipContent></Tooltip>
        </div>
        
        <div className="flex flex-col items-center gap-1 order-first sm:order-none basis-full sm:basis-auto">
          <span className="text-sm text-muted-foreground">Page {currentPage + 1} of {totalPages}</span>
          <div className="flex items-center gap-1">
            {bookmarks.includes(currentPage) && <Badge variant="secondary" className="text-xs">Bookmarked</Badge>}
            {autoFlip && <Badge variant="outline" className="text-xs">Auto-flip</Badge>}
            {nightMode && <Badge variant="outline" className="text-xs">Night</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut /></Button></TooltipTrigger><TooltipContent><p>Zoom Out</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}><ZoomIn /></Button></TooltipTrigger><TooltipContent><p>Zoom In</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={toggleFullscreen}>{isFullscreen ? <Minimize2 /> : <Maximize2 />}</Button></TooltipTrigger><TooltipContent><p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p></TooltipContent></Tooltip>
            <SettingsDialog />
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "w-full h-full flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen ? 'bg-background p-0' : '',
        nightMode ? 'bg-gray-900 text-gray-100' : ''
      )} 
      onTouchStart={handleTouchStart} 
      onTouchMove={handleTouchMove}
    >
      {/* Reading Progress Bar */}
      {!isFullscreen && (
        <div className="w-full max-w-4xl mb-2 px-4">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
            <span>Progress: {Math.round(readingProgress)}%</span>
            <span>Reading time: {formatReadingTime(readingTime)}</span>
          </div>
        </div>
      )}
      
      <div 
        className={cn(
          "w-full h-full flex-grow flex items-center justify-center",
          nightMode ? 'filter invert' : ''
        )}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}
      >
        {isClient ? (
          <HTMLFlipBook 
            {...bookProps}
            flippingTime={
              pageTransition === 'fast' ? 300 :
              pageTransition === 'slow' ? 1500 :
              pageTransition === 'smooth' ? 800 :
              flipSpeed
            }
          >
            {pages.map((pageUrl, index) => (
              <Page number={index + 1} key={index}>
                <div className="relative w-full h-full">
                  <img 
                    src={pageUrl} 
                    alt={`Page ${index + 1}`} 
                    className={cn(
                      "max-w-full max-h-full object-contain",
                      nightMode ? 'filter invert' : ''
                    )} 
                    data-ai-hint="book page" 
                  />
                  {showPageNumbers && (
                    <div className={cn(
                      "absolute bottom-2 right-2 px-2 py-1 rounded text-xs",
                      nightMode ? 'bg-white/20 text-gray-200' : 'bg-black/50 text-white'
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
              </Page>
            ))}
          </HTMLFlipBook>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading flipbook...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bookmarks sidebar for fullscreen */}
      {isFullscreen && bookmarks.length > 0 && (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <div className="flex flex-col gap-1">
            <BookOpen className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            {bookmarks.map(bookmark => (
              <Button
                key={bookmark}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-xs"
                onClick={() => pageFlip?.turnToPage(bookmark)}
              >
                {bookmark + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      {isFullscreen ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 bg-card/80 backdrop-blur-sm shadow-lg border">
              <Menu />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top" align="end">
             <Controls className="w-full max-w-4xl" />
          </PopoverContent>
        </Popover>
      ) : (
        <div className="mt-4 p-4 rounded-lg bg-card/80 backdrop-blur-sm shadow-lg border w-full max-w-4xl">
            <Controls />
        </div>
      )}
      
      {/* Keyboard shortcuts help */}
      {!isFullscreen && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          <p>Keyboard shortcuts: ← → (navigate), Home/End (first/last), F (fullscreen), B (bookmark), Space (auto-flip)</p>
        </div>
      )}
    </div>
  );
}
