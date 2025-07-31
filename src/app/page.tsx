import { Header } from "@/components/header";
import { PageTurner } from "@/components/page-turner";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full h-full flex-grow flex flex-col items-center justify-center">
          <PageTurner />
        </div>
      </main>
    </div>
  );
}
