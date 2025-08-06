"use client";

import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Activity, Zap } from 'lucide-react';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  fps: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    fps: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show performance monitor only in development or when explicitly enabled
    const showMonitor = process.env.NODE_ENV === 'development' || 
                       localStorage.getItem('pageturner_show_perf') === 'true';
    setIsVisible(showMonitor);

    if (!showMonitor) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const updateMetrics = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory usage if available
        const memory = (performance as any).memory;
        const memoryUsage = memory ? 
          Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          renderTime: Math.round(currentTime - lastTime)
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(updateMetrics);
    };

    animationId = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <TooltipProvider>
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Activity className="w-3 h-3 mr-1" />
              {metrics.fps} FPS
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Frames per second</p>
          </TooltipContent>
        </Tooltip>

        {metrics.memoryUsage > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`bg-background/80 backdrop-blur-sm ${
                  metrics.memoryUsage > 100 ? 'border-yellow-500' : 
                  metrics.memoryUsage > 200 ? 'border-red-500' : ''
                }`}
              >
                <Zap className="w-3 h-3 mr-1" />
                {metrics.memoryUsage}MB
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Memory usage</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}