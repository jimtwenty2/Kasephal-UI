"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nContext";

const HOW_TEXT = {
  "home.how.label": {
    en: "HOW KASEPHAL WORKS",
    kh: "របៀបដែលកសិផលដំណើរការ",
  },
  "home.how.title": {
    en: "How KASEPHAL works",
    kh: "របៀបដំណើរការរបស់កសិផល",
  },
  "home.how.description": {
    en: "We've digitized the agricultural supply chain to make trading faster, fairer, and completely secure for both farmers and businesses.",
    kh: "យើងបានបម្លែងខ្សែសង្វាក់ផ្គត់ផ្គង់កសិកម្មទៅជាប្រព័ន្ធឌីជីថល ដើម្បីធ្វើឱ្យការជួញដូរលឿនជាងមុន យុត្តិធម៌ជាងមុន និងមានសុវត្ថិភាពសម្រាប់ទាំងកសិករ និងអាជីវកម្ម។",
  },

  "home.how.step1.title": {
    en: "Discover & Connect",
    kh: "ស្វែងរក និងភ្ជាប់ទំនាក់ទំនង",
  },
  "home.how.step1.description": {
    en: "Find farmers or post your exact crop demands instantly.",
    kh: "ស្វែងរកកសិករ ឬបង្ហោះតម្រូវការកសិផលរបស់អ្នកបានភ្លាមៗ។",
  },

  "home.how.step2.title": {
    en: "Agree & Contract",
    kh: "ព្រមព្រៀង និងធ្វើកិច្ចសន្យា",
  },
  "home.how.step2.description": {
    en: "Lock in fair prices and terms with our secure digital agreements.",
    kh: "កំណត់តម្លៃ និងលក្ខខណ្ឌយុត្តិធម៌តាមរយៈកិច្ចព្រមព្រៀងឌីជីថលដែលមានសុវត្ថិភាព។",
  },

  "home.how.step3.title": {
    en: "Secure Trade & Delivery",
    kh: "ជួញដូរ និងដឹកជញ្ជូនដោយសុវត្ថិភាព",
  },
  "home.how.step3.description": {
    en: "Deliver the harvest and get paid safely through our escrow system.",
    kh: "ដឹកជញ្ជូនផលប្រមូលផល និងទទួលប្រាក់ដោយសុវត្ថិភាពតាមរយៈប្រព័ន្ធធានាទូទាត់របស់យើង។",
  },
} as const;

function getHowText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: keyof typeof HOW_TEXT) => HOW_TEXT[key][lang];
}

const LINE_GAP = 28;

export default function HowItWorks() {
  const { language } = useI18n();
  const t = getHowText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  const steps = useMemo(
    () => [
      {
        number: 1,
        bgColor: "#FFC44F",
        title: t("home.how.step1.title"),
        titleColor: "#FFC44F",
        description: t("home.how.step1.description"),
      },
      {
        number: 2,
        bgColor: "#107446",
        title: t("home.how.step2.title"),
        titleColor: "#107446",
        description: t("home.how.step2.description"),
      },
      {
        number: 3,
        bgColor: "#EDA96F",
        title: t("home.how.step3.title"),
        titleColor: "#EDA96F",
        description: t("home.how.step3.description"),
      },
    ],
    [t],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const segmentIndexRef = useRef(0);
  const segmentProgressRef = useRef(0);
  const pauseUntilRef = useRef(0);
  const animationStateRef = useRef<"drawing" | "pause">("drawing");

  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [isDesktopFlow, setIsDesktopFlow] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktopFlow(window.innerWidth >= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const element = flowRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.25 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isDesktopFlow) {
      setReady(false);
      return;
    }

    const canvas = canvasRef.current;
    const flow = flowRef.current;

    if (!canvas || !flow) return;

    const sync = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = flow.offsetWidth;
      const height = flow.offsetHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      setReady(true);
    };

    const raf = requestAnimationFrame(sync);

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(flow);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [isDesktopFlow]);

  useEffect(() => {
    if (!isDesktopFlow || !inView || !ready) return;

    const canvas = canvasRef.current;
    const flow = flowRef.current;

    if (!canvas || !flow) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    segmentIndexRef.current = 0;
    segmentProgressRef.current = 0;
    animationStateRef.current = "drawing";
    pauseUntilRef.current = 0;
    lastTimeRef.current = null;
    setActiveStep(null);

    const getBox = (index: number) => {
      const boxes = flow.querySelectorAll<HTMLElement>("[data-step-box]");
      const box = boxes[index];

      if (!box) return null;

      const boxRect = box.getBoundingClientRect();
      const flowRect = flow.getBoundingClientRect();

      return {
        left: boxRect.left - flowRect.left,
        right: boxRect.right - flowRect.left,
        centerY: boxRect.top - flowRect.top + boxRect.height / 2,
      };
    };

    const drawSegment = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      progress: number,
      curveUp: boolean,
    ) => {
      const cpX = (x1 + x2) / 2;
      const gap = Math.abs(x2 - x1);
      const offset = Math.max(50, gap * 0.25);
      const cpY = curveUp
        ? Math.min(y1, y2) - offset
        : Math.max(y1, y2) + offset;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpX, cpY, x2, y2);
      ctx.strokeStyle = "#CFCFC2";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 7]);
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      if (progress <= 0) return;

      const totalPoints = 120;
      const points: [number, number][] = [];

      for (let i = 0; i <= totalPoints; i++) {
        const current = i / totalPoints;
        const remain = 1 - current;

        points.push([
          remain * remain * x1 +
            2 * remain * current * cpX +
            current * current * x2,
          remain * remain * y1 +
            2 * remain * current * cpY +
            current * current * y2,
        ]);
      }

      const end = Math.min(Math.floor(progress * totalPoints), totalPoints);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);

      for (let i = 1; i <= end; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }

      ctx.strokeStyle = "#107446";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 7]);
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      if (progress >= 1) {
        const [arrowX, arrowY] = points[totalPoints];
        const [prevX, prevY] = points[totalPoints - 4];
        const angle = Math.atan2(arrowY - prevY, arrowX - prevX);

        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-7, -6);
        ctx.lineTo(2, 0);
        ctx.lineTo(-7, 6);
        ctx.strokeStyle = "#107446";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.setLineDash([]);
        ctx.stroke();
        ctx.restore();
      }
    };

    const animate = (timestamp: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      const previousTime = lastTimeRef.current ?? timestamp;
      const delta = Math.min(timestamp - previousTime, 100);

      lastTimeRef.current = timestamp;

      const box1 = getBox(0);
      const box2 = getBox(1);
      const box3 = getBox(2);

      if (animationStateRef.current === "drawing") {
        segmentProgressRef.current = Math.min(
          segmentProgressRef.current + delta * 0.0009,
          1,
        );

        if (segmentProgressRef.current >= 1) {
          animationStateRef.current = "pause";
          pauseUntilRef.current = timestamp + 900;

          const highlightStep = segmentIndexRef.current === 0 ? 2 : 3;
          setActiveStep(highlightStep);
        }
      } else if (animationStateRef.current === "pause") {
        if (timestamp >= pauseUntilRef.current) {
          animationStateRef.current = "drawing";
          setActiveStep(null);

          segmentIndexRef.current += 1;

          if (segmentIndexRef.current >= 2) {
            segmentIndexRef.current = 0;
          }

          segmentProgressRef.current = 0;
        }
      }

      if (box1 && box2) {
        const firstProgress =
          segmentIndexRef.current === 0 ? segmentProgressRef.current : 1;

        drawSegment(
          box1.right + LINE_GAP,
          box1.centerY,
          box2.left - LINE_GAP,
          box2.centerY,
          firstProgress,
          true,
        );
      }

      if (box2 && box3) {
        const secondProgress =
          segmentIndexRef.current === 1
            ? segmentProgressRef.current
            : segmentIndexRef.current === 0
              ? 0
              : 1;

        drawSegment(
          box2.right + LINE_GAP,
          box2.centerY,
          box3.left - LINE_GAP,
          box3.centerY,
          secondProgress,
          false,
        );
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDesktopFlow, inView, ready]);

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#fbf9f5] ${fontClass}`}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/home_page/image_bg.png"
          alt=""
          fill
          priority
          quality={10}
          unoptimized
          sizes="100vw"
          className="object-cover object-bottom opacity-70"
        />
      </div>

      <div className="relative z-10 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-15">
        <div className="mx-auto max-w-262.5 text-center">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-primary sm:mb-4 sm:text-sm md:text-base">
            {t("home.how.label")}
          </p>

          <h2 className="text-[30px] font-extrabold leading-tight text-[#1F2024] sm:text-4xl md:text-5xl">
            {t("home.how.title")}
          </h2>

          <p className="mx-auto mt-4 max-w-195 text-[14px] font-medium leading-6 text-[#4F5358] sm:mt-5 sm:text-base sm:leading-7 md:text-lg">
            {t("home.how.description")}
          </p>

          <div
            ref={flowRef}
            className="relative mt-9 w-full overflow-hidden sm:mt-12 md:mt-16"
          >
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 z-1 hidden md:block"
            />

            <div className="relative z-10 mx-auto max-w-225 px-0 py-4 sm:px-4 sm:py-8 md:px-6 md:py-14">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className="flex w-full flex-col items-center px-4 text-center md:px-0">
                      <div
                        data-step-box
                        className={`relative z-10 flex h-13.5 w-13.5 items-center justify-center rounded-[13px] text-[22px] font-extrabold text-black shadow-sm transition-transform duration-300 sm:h-14.5 sm:w-14.5 sm:text-2xl ${
                          activeStep === step.number ? "scale-105" : ""
                        }`}
                        style={{ backgroundColor: step.bgColor }}
                      >
                        {step.number}
                      </div>

                      <h3
                        className="mt-5 max-w-70 wrap-break-word text-center text-[17px] font-bold leading-snug sm:text-[18px] md:mt-10 md:max-w-none"
                        style={{ color: step.titleColor }}
                      >
                        {step.title}
                      </h3>

                      <p className="mt-3 max-w-75 wrap-break-word text-center text-[14px] font-medium leading-6 text-[#30343A] sm:max-w-82.5 md:mt-4 md:max-w-62.5">
                        {step.description}
                      </p>
                    </div>

                    {index !== steps.length - 1 ? (
                      <div className="relative flex h-14.5 w-full items-center justify-center md:hidden">
                        <div className="h-full border-l-2 border-dashed border-[#CFCFC2]" />

                        <span
                          className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-[#CFCFC2]"
                          aria-hidden="true"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}