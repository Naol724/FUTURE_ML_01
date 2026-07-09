import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton layout shown while the forecast job is running. */
export function ResultsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="mb-3 h-4 w-16" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="mt-2 h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-5">
          <Skeleton className="mb-4 h-5 w-56" />
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-5 w-40" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
