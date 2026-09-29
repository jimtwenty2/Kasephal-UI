import Image from "next/image";

export function ProfileHeaderSkeleton() {
  return (
    <section className="relative w-full overflow-hidden rounded-[28px] border border-light-grey bg-white px-5 py-6 shadow-sm lg:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-secondary to-primary/40" />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,auto)]">
        <div className="grid min-w-0 items-center gap-5 lg:grid-cols-[185px_minmax(0,1fr)]">
          <div className="flex justify-center lg:justify-start">
            <div className="h-42.5 w-42.5 animate-pulse rounded-full border-[6px] border-[#f7f2e7] bg-light-grey lg:h-46.25 lg:w-46.25" />
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-light-grey lg:mx-0" />
            <div className="mx-auto h-9 w-60 animate-pulse rounded-lg bg-light-grey lg:mx-0" />
            <div className="mx-auto h-7 w-44 animate-pulse rounded-lg bg-light-grey/80 lg:mx-0" />
            <div className="mx-auto h-4 w-full max-w-130 animate-pulse rounded-full bg-light-grey lg:mx-0" />
            <div className="mx-auto h-4 w-3/4 max-w-95 animate-pulse rounded-full bg-light-grey/80 lg:mx-0" />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center xl:justify-end">
            <div className="h-12.5 w-full animate-pulse rounded-[14px] bg-light-grey sm:w-40" />
            <div className="h-12.5 w-full animate-pulse rounded-[14px] bg-light-grey sm:w-40" />
          </div>

          <div className="flex w-full items-center justify-center gap-5 border-t border-light-grey pt-4">
            <div className="space-y-2 text-center">
              <div className="mx-auto h-3 w-20 animate-pulse rounded-full bg-light-grey" />
              <div className="mx-auto h-12 w-16 animate-pulse rounded-lg bg-light-grey" />
              <div className="mx-auto h-5 w-24 animate-pulse rounded-full bg-light-grey/80" />
            </div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-secondary/25" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-y-6 border-t border-light-grey pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3 px-3 text-center"
          >
            <div className="h-10 w-10 animate-pulse rounded-full bg-primary/10" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-light-grey" />
            <div className="h-4 w-24 animate-pulse rounded-full bg-light-grey/80" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileTabsSkeleton() {
  return (
    <div className="mt-1 flex w-full justify-center">
        <section className="w-full rounded-[28px] border border-light-grey bg-white px-5 pb-8 pt-8 shadow-sm md:px-10 lg:px-25 lg:pb-10 lg:pt-10">
        <nav className="mx-auto h-13.75 w-full max-w-332 border-b border-light-grey">
          <div className="flex h-full items-center gap-8 overflow-hidden lg:gap-15">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-5 w-28 shrink-0 animate-pulse rounded-full bg-light-grey"
              />
            ))}
          </div>
        </nav>

        <div className="mx-auto mt-6 grid w-full max-w-332 gap-4 lg:grid-cols-[320px_1fr]">
          <div className="hidden rounded-4xl border border-light-grey p-5 lg:block">
            <div className="mx-auto h-16 w-24 animate-pulse rounded-lg bg-light-grey" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-3 animate-pulse rounded-full bg-light-grey"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 w-full animate-pulse rounded-4xl border border-light-grey bg-light-grey/70"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <main className="min-h-screen min-w-full bg-background">
      <div className="mt-9 w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="mx-auto flex w-full flex-col gap-6 px-6 py-6 lg:px-30">
        <ProfileHeaderSkeleton />
        <ProfileTabsSkeleton />
      </div>
    </main>
  );
}

