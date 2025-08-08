import dynamic from 'next/dynamic';
import { Header } from "@/components/header";
import ErrorBoundary from "@/components/error-boundary";
import { LoadingSkeleton } from "@/components/loading-skeleton";

// Dynamically import PageTurner to improve initial load time
const PageTurner = dynamic(
  () => import("@/components/page-turner").then(mod => ({ default: mod.PageTurner })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false
  }
);

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="w-full h-full flex-grow flex flex-col items-center justify-center">
            <PageTurner />
          </div>
        </main>
        <footer className="border-t bg-card/50 backdrop-blur-sm p-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PageTurner. Transform your reading experience with interactive flipbooks.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}