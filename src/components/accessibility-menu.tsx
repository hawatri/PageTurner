"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Accessibility, Type, Eye, Volume2 } from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export function AccessibilityMenu() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    colorBlindMode: 'none'
  });

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply settings to document
    const root = document.documentElement;
    
    switch (key) {
      case 'fontSize':
        root.style.fontSize = `${value}px`;
        break;
      case 'highContrast':
        root.classList.toggle('high-contrast', value as boolean);
        break;
      case 'reducedMotion':
        root.classList.toggle('reduce-motion', value as boolean);
        break;
      case 'colorBlindMode':
        root.className = root.className.replace(/colorblind-\w+/g, '');
        if (value !== 'none') {
          root.classList.add(`colorblind-${value}`);
        }
        break;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm shadow-lg border"
          aria-label="Accessibility settings"
        >
          <Accessibility className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Accessibility className="w-4 h-4" />
              Accessibility Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font Size */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="w-3 h-3" />
                Font Size: {settings.fontSize}px
              </Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="flex items-center gap-2">
                <Eye className="w-3 h-3" />
                High Contrast
              </Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>

            {/* Screen Reader Support */}
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-reader" className="flex items-center gap-2">
                <Volume2 className="w-3 h-3" />
                Screen Reader
              </Label>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) => updateSetting('screenReader', checked)}
              />
            </div>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
              <Switch
                id="keyboard-nav"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
              />
            </div>

            {/* Color Blind Support */}
            <div className="space-y-2">
              <Label>Color Blind Support</Label>
              <Select
                value={settings.colorBlindMode}
                onValueChange={(value: AccessibilitySettings['colorBlindMode']) => 
                  updateSetting('colorBlindMode', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="protanopia">Protanopia</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 text-xs text-muted-foreground">
              <p>These settings are saved locally and will persist across sessions.</p>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}