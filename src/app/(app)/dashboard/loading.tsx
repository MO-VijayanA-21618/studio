import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <Skeleton className="h-10 w-64" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[108px] w-full" />
                <Skeleton className="h-[108px] w-full" />
                <Skeleton className="h-[108px] w-full" />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <Skeleton className="h-[400px] w-full" />
                </div>
                <div className="lg:col-span-2">
                    <Skeleton className="h-[200px] w-full" />
                </div>
            </div>
        </div>
    )
}
