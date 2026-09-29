function SkeletonBlock({ className }: { className: string }) {
    return (
        <div
            className={`animate-pulse rounded-full bg-[#E8EEE9] ${className}`}
            aria-hidden="true"
        />
    );
}

function ChatCardSkeleton() {
    return (
        <div className="flex w-full items-center gap-3 rounded-[22px] p-3">
            <SkeletonBlock className="h-11 w-11 shrink-0" />

            <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-3 w-full" />
            </div>

            <SkeletonBlock className="h-3 w-10" />
        </div>
    );
}

export default function ChatLoading() {
    return (
        <div className="min-h-screen min-w-screen">
            <div className="mt-9 min-w-full px-6">
                <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px] bg-[#E8EEE9]" />
            </div>

            <main className="flex h-screen w-full overflow-hidden bg-white font-thicccboi">
                <aside className="flex h-screen w-[360px] shrink-0 flex-col overflow-hidden border-r border-light-grey bg-white px-6 py-6">
                    <SkeletonBlock className="mb-5 h-10 w-10" />

                    <SkeletonBlock className="h-7 w-56 rounded-md" />
                    <SkeletonBlock className="mt-2 h-4 w-64 rounded-md" />

                    <div className="mt-6 flex h-[44px] items-center gap-3 rounded-[18px] border border-light-grey bg-white px-4 shadow-sm">
                        <SkeletonBlock className="h-5 w-5" />
                        <SkeletonBlock className="h-4 w-40 rounded-md" />
                    </div>

                    <div className="mt-6 flex gap-2">
                        <SkeletonBlock className="h-9 w-16" />
                        <SkeletonBlock className="h-9 w-20" />
                        <SkeletonBlock className="h-9 w-20" />
                    </div>

                    <div className="mt-6 min-h-0 flex-1 space-y-3 pr-1">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ChatCardSkeleton key={index} />
                        ))}
                    </div>
                </aside>

                <div className="h-full w-[5px] shrink-0 bg-transparent">
                    <div className="mx-auto h-full w-px bg-black/5" />
                </div>

                <section className="min-w-0 flex-1 bg-white">
                    <div className="flex h-full min-h-0 flex-1 flex-col">
                        <div className="flex h-[82px] items-center justify-between border-b border-light-grey px-6">
                            <div className="flex items-center gap-3">
                                <SkeletonBlock className="h-12 w-12" />
                                <div className="space-y-2">
                                    <SkeletonBlock className="h-4 w-36 rounded-md" />
                                    <SkeletonBlock className="h-3 w-24 rounded-md" />
                                </div>
                            </div>

                            <SkeletonBlock className="h-10 w-32" />
                        </div>

                        <div className="min-h-0 flex-1 space-y-5 overflow-hidden px-6 py-5">
                            <SkeletonBlock className="h-10 w-64 rounded-[18px]" />
                            <SkeletonBlock className="ml-auto h-10 w-72 rounded-[18px]" />
                            <SkeletonBlock className="h-24 w-80 rounded-[18px]" />
                            <SkeletonBlock className="ml-auto h-16 w-64 rounded-[18px]" />
                        </div>

                        <div className="border-t border-light-grey px-6 py-4">
                            <SkeletonBlock className="h-12 w-full rounded-[18px]" />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
