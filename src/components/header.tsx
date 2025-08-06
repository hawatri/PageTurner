"use client"

import Image from "next/image";
import { Badge } from "./ui/badge";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    return (
        <header className="p-4 flex justify-between items-center border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="PageTurner Logo" width={40} height={40} data-ai-hint="ebook reader" />
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-primary">PageTurner</h1>
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Pro
                  </Badge>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">
                Interactive PDF Reader
              </Badge>
              <ThemeToggle />
            </div>
        </header>
    )
}
