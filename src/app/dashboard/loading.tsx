import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-5 sm:space-y-6">
      <Card className="surface-panel p-3 sm:p-4">
        <CardHeader className="p-0">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="mt-4 p-0">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-xl shadow-lg">
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
