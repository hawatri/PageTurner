"use client"

import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    return (
        <header className="p-4 flex justify-between items-center border-b">
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="PageTurner Logo" width={40} height={40} data-ai-hint="ebook reader" />
                <h1 className="text-2xl font-bold text-primary">PageTurner</h1>
            </div>
            <ThemeToggle />
        </header>
    )
}
