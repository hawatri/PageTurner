"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import type { PageFlip } from 'react-pageflip';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Expand, ChevronsLeft, ChevronsRight, RotateCcw, Menu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { HTMLFlipBookProps } from 'react-pageflip';


interface FlipbookViewProps {
  pages: string[];
  onReset: () => void;
}

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>(({ children, number }, ref) => {
    return (
        <div className="flex items-center justify-center bg-white shadow-md" ref={ref}>
            <div className="flex flex-col items-center justify-center w-full h-full">
                {children}
            </div>
        </div>
    );
});
Page.displayName = 'Page';

export function FlipbookView({ pages, onReset }: FlipbookViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const flipBookRef = useRef<{ pageFlip: () => PageFlip } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinchDistRef = useRef(0);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
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
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
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
    onFlip,
    className: "shadow-2xl",
    ref: flipBookRef,
    children: []
  };

  const Controls = ({ className }: { className?: string }) => (
    <TooltipProvider>
      <div className={cn("flex items-center justify-between gap-4 flex-wrap", className)}>
        <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onReset}><RotateCcw /></Button></TooltipTrigger><TooltipContent><p>New PDF</p></TooltipContent></Tooltip>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-grow max-w-lg">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.turnToPage(0)} disabled={!pageFlip || currentPage === 0}><ChevronsLeft /></Button></TooltipTrigger><TooltipContent><p>First</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.flipPrev()} disabled={!pageFlip || currentPage === 0}><ArrowLeft /></Button></TooltipTrigger><TooltipContent><p>Previous</p></TooltipContent></Tooltip>
            <Slider min={0} max={totalPages > 0 ? totalPages - 1 : 0} step={1} value={[currentPage]} onValueChange={(value) => pageFlip?.turnToPage(value[0])} className="flex-grow"/>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.flipNext()} disabled={!pageFlip || currentPage >= totalPages - 1}><ArrowRight /></Button></TooltipTrigger><TooltipContent><p>Next</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => pageFlip?.turnToPage(totalPages - 1)} disabled={!pageFlip || currentPage >= totalPages - 1}><ChevronsRight /></Button></TooltipTrigger><TooltipContent><p>Last</p></TooltipContent></Tooltip>
        </div>
        
        <span className="text-sm text-muted-foreground w-24 text-center order-first sm:order-none basis-full sm:basis-auto">Page {currentPage + 1} of {totalPages}</span>

        <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut /></Button></TooltipTrigger><TooltipContent><p>Zoom Out</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}><ZoomIn /></Button></TooltipTrigger><TooltipContent><p>Zoom In</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={toggleFullscreen}><Expand /></Button></TooltipTrigger><TooltipContent><p>Fullscreen</p></TooltipContent></Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <div ref={containerRef} className={`w-full h-full flex flex-col items-center justify-center transition-all duration-300 ${isFullscreen ? 'bg-background p-0' : ''}`} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
      <div 
        className="w-full h-full flex-grow flex items-center justify-center"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}
      >
        <HTMLFlipBook {...bookProps}>
          {pages.map((pageUrl, index) => (
            <Page number={index + 1} key={index}>
              <img src={pageUrl} alt={`Page ${index + 1}`} className="max-w-full max-h-full object-contain" data-ai-hint="book page" />
            </Page>
          ))}
        </HTMLFlipBook>
      </div>

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
    </div>
  );
}
