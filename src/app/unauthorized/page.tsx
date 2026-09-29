import Link from "next/link";
import Image from "next/image";
import { KeyRound, LayoutDashboard, ShieldAlert } from "lucide-react";
import { ClientBackButton } from "./ClientBackButton";

export default function UnauthorizedPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white selection:bg-primary selection:text-white">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute -right-50 top-[40%] z-0 hidden h-136.25 w-136.25 rounded-full bg-secondary opacity-20 blur-[120px] mix-blend-multiply lg:block" />
      <div className="pointer-events-none absolute -left-55 top-[50%] z-0 hidden h-136.25 w-136.25 rounded-full bg-secondary opacity-20 blur-[120px] mix-blend-multiply lg:block" />

      {/* Footer decorative artworks */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-100 w-87.5 -translate-x-16 translate-y-45 scale-x-[-1] bg-[url('/image/background-footer-b.png')] bg-contain bg-bottom-left bg-no-repeat opacity-40 md:block md:h-125 md:w-115 md:translate-y-55 lg:h-150 lg:w-140 lg:translate-y-67.5" />
      <div className="pointer-events-none absolute bottom-40 right-0 z-0 hidden h-60 w-95 translate-x-15 translate-y-12.5 scale-120 bg-[url('/image/background-footer-b.png')] bg-contain bg-bottom-right bg-no-repeat opacity-30 md:block md:h-75 md:w-120 md:scale-150 lg:h-85.75 lg:w-140 lg:translate-x-22.5 lg:scale-170" />

      {/* Main split layout */}
      <section className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white lg:flex-row">
        {/* Floating decorative assets */}
        <Image
          src="/assets/srov.png"
          width={220}
          height={253}
          alt="srov"
          className="absolute right-0 top-[3%] z-10 h-auto max-h-[25%] w-[clamp(100px,10vw,210px)] object-contain opacity-40 lg:opacity-50"
        />

        <Image
          src="/assets/tractor.png"
          width={300}
          height={400}
          alt="tractor"
          className="absolute bottom-16 right-[3%] z-10 h-auto max-h-[20%] w-[clamp(110px,12vw,250px)] object-contain opacity-30 lg:bottom-0 lg:max-h-[30%] lg:opacity-100"
        />

        <div className="absolute right-[-8%] top-[-3%] z-5 h-[clamp(220px,20vw,360px)] w-[clamp(170px,15vw,260px)] rounded-full bg-background blur-2xl" />

        {/* LEFT COLUMN */}
        <section className="relative hidden h-full overflow-hidden rounded-[20px] bg-background lg:flex lg:w-[52%] lg:flex-col">
          <div className="relative z-20 p-5 lg:p-[clamp(20px,4.2vw,78px)]">
            <Image
              src="/assets/logo-green.png"
              width={150}
              height={60}
              alt="logo-kasephal"
              className="h-auto w-[clamp(110px,8.7vw,150px)]"
            />

            <div className="mt-[clamp(28px,3vw,60px)] max-w-[clamp(500px,38vw,650px)]">
              <div className="relative text-[clamp(34px,3.1vw,58px)] font-extrabold leading-[1.15]">
                <h1 className="font-heading text-secondary">Access</h1>

                <h1 className="text-heading-text">
                  Permission <span className="text-primary">Required</span>
                </h1>

                <h1 className="text-heading-text">
                  This field is <span className="text-primary">Protected</span>
                </h1>

                <Image
                  src="/assets/leaf.png"
                  width={80}
                  height={65}
                  alt="leaf"
                  className="absolute right-[4%] top-[16%] h-auto w-[clamp(50px,4.6vw,90px)]"
                />
              </div>

              <p className="mt-[clamp(12px,1vw,22px)] max-w-[clamp(420px,29vw,520px)] text-[clamp(13px,0.95vw,18px)] font-medium leading-[1.4] text-description-text">
                You are signed in, but this area requires a different permission level.
                Please switch account or return to a safe page.
              </p>
            </div>
          </div>

          {/* left decorative wheat */}
          <Image
            src="/assets/srov2.png"
            width={250}
            height={380}
            alt="srov2"
            className="pointer-events-none absolute bottom-[8%] left-0 z-10 h-auto w-[clamp(150px,13vw,250px)] object-contain opacity-70"
          />

          {/* trimmed preview image */}
          <Image
            src="/assets/preview.png"
            width={900}
            height={800}
            alt="preview"
            priority
            className="pointer-events-none absolute bottom-[-10%] right-[-5%] z-10 h-auto w-[58%] object-contain"
          />
        </section>

        {/* RIGHT COLUMN */}
        <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-6 sm:px-8 lg:w-[48%] lg:px-[clamp(32px,4.2vw,64px)]">
          <div className="relative z-20 mx-auto my-auto w-full max-w-md md:max-w-xl">
            <div className="absolute inset-0 -z-10 translate-x-1.5 translate-y-1.5 rounded-2xl" />

            <div className="rounded-2xl border border-light-grey bg-white p-5 sm:p-8 md:p-10">
              {/* Header */}
              <div className="mb-6 flex flex-col justify-between gap-4 border-b border-light-grey pb-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <div className="animate-pulse-ring absolute inset-0 rounded-xl bg-primary/5" />
                    <ShieldAlert
                      className="relative h-6 w-6 text-primary"
                      strokeWidth={2}
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-muted">
                      ERROR STATUS
                    </span>
                    <h2 className="text-sm font-black tracking-tight text-primary-heading">
                      403: RESTRICTED ACCESS
                    </h2>
                  </div>
                </div>

                <div className="inline-flex self-start rounded-full border border-light-grey bg-background px-3 py-1 sm:self-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-body">
                    🔒 Security Protocol
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6 space-y-3 sm:mb-8">
                <h1 className="text-xl font-extrabold leading-tight tracking-tight text-heading-text sm:text-2xl">
                  Unauthorized Permission Required
                </h1>

                <p className="text-xs font-medium leading-relaxed text-description-text opacity-90 sm:text-sm">
                  You are currently authenticated, but your account does not have
                  permission to view this page. Please switch to an authorized
                  account or return to a safe page.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Primary Action */}
                <Link
                  href="/login"
                  className="group relative overflow-hidden rounded-2xl bg-primary p-4 text-white shadow-[0_18px_45px_rgba(16,116,70,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,116,70,0.28)] active:translate-y-0"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_36%)]" />
                  <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative z-10 flex min-h-30 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-white/20">
                        <KeyRound className="h-5 w-5 text-white" />
                      </div>

                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary-heading">
                        Recommended
                      </span>
                    </div>

                    <div className="mt-5">
                      <span className="block text-base font-extrabold tracking-tight text-white">
                        Sign In / Switch User
                      </span>

                      <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/75">
                        Access with another account.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Secondary Action */}
                <Link
                  href="/"
                  className="group relative overflow-hidden rounded-2xl border border-light-grey/80 bg-background p-4 text-primary-heading shadow-[0_16px_40px_rgba(17,24,39,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-white hover:shadow-[0_22px_55px_rgba(17,24,39,0.08)] active:translate-y-0"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,116,70,0.12),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative z-10 flex min-h-30 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-light-grey bg-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-primary/20">
                        <LayoutDashboard className="h-5 w-5 text-primary-heading transition-colors duration-300 group-hover:text-primary" />
                      </div>

                      <span className="rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
                        Safe
                      </span>
                    </div>

                    <div className="mt-5">
                      <span className="block text-base font-extrabold tracking-tight text-primary-heading">
                        Return to Safety
                      </span>

                      <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted">
                        Go back to the homepage.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Bottom controls */}
              <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-light-grey pt-4 sm:flex-row">
                <ClientBackButton />

                <span className="font-mono text-[10px] tracking-tight text-muted">
                  Node ID: AUTH_BLOCKED_403
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto w-full pb-2 pt-6 text-center text-[10px] font-medium text-description-text sm:text-[11px]">
            <p>
              © 2026 Kasephal. All rights reserved. Built with pride in Cambodia.
            </p>
            <p className="mt-0.5 opacity-80">
              Privacy Policy | Terms of Service | Trust & Safety
            </p>
          </footer>
        </section>
      </section>

      {/* Blurred lighting overlays */}
      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full opacity-30">
        <div className="absolute left-[-5%] top-[-5%] h-[70vw] w-[70vw] rounded-full bg-secondary/15 blur-[80px] md:h-[50vw] md:w-[50vw] md:blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[60vw] w-[60vw] rounded-full bg-accent/15 blur-[70px] md:h-[40vw] md:w-[40vw] md:blur-[100px]" />
      </div>
    </div>
  );
}