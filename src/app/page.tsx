import { PageTurner } from "@/components/page-turner";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="w-full h-full flex-grow flex flex-col items-center justify-center">
        <PageTurner />
      </div>
    </main>
  );
}
