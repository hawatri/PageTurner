import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card className="shadow-2xl">
        <CardHeader className="text-center p-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-12 w-48" />
          </div>
          <Skeleton className="h-6 w-96 mx-auto" />
          <div className="flex items-center justify-center gap-4 mt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center">
            <Skeleton className="w-16 h-16 rounded-full mb-6" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="text-center p-6">
            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-5 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}