import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicLoading() {
  return (
    <div className="space-y-6">
      {/* Search/Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Doctor card skeletons */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Image placeholder */}
                <Skeleton className="h-48 w-full sm:h-auto sm:w-48 shrink-0" />
                {/* Info */}
                <div className="flex-1 p-4 sm:p-5 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
