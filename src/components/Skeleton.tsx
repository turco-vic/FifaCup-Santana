type Props = {
    className?: string
}

export function Skeleton({ className = '' }: Props) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-white/10 ${className}`}
        />
    )
}

export function SkeletonCard() {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    )
}

export function SkeletonTable() {
    return (
        <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                </div>
            ))}
        </div>
    )
}

export function SkeletonMatch() {
    return (
        <div className="flex items-center gap-2 py-2">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 flex-1" />
        </div>
    )
}
