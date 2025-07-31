"use client"

import { ThemeToggle } from "./theme-toggle";

export function Header() {
    return (
        <header className="p-4 flex justify-between items-center border-b">
            <h1 className="text-2xl font-bold text-primary">PageTurner</h1>
            <ThemeToggle />
        </header>
    )
}
