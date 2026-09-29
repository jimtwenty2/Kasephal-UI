"use client";
import React, { useState } from "react";
import {
  Sprout,
  Users,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Search,
  Shield,
  TrendingUp,
  MapPin,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";

const EASE = [0.22, 1, 0.36, 1];

// Reusable, consistent section heading (clean & minimal) — reveals on scroll
function SectionHeading({ eyebrow, title, subtitle }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="max-w-2xl mx-auto text-center"
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          <Leaf className="w-3.5 h-3.5 fill-primary" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-slate-500 text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  // 100% matched Team Members from image_f39ebe.jpg
  const teamMembers = [
    {
      name: "Chhim Pojim",
      role: "Backend ",
      image: "/aboutUs/pojim.jpg",
      bio: "Leads the product development timeline of Kasephal. Ensures all feature releases align perfectly with Cambodian agriculture goals.",
      favCrop: "Kampot Pepper (ម្រេចកំពត)",
      skills: ["Product Roadmap", "Agile Management", "Market Validation"],
    },
    {
      name: "Korn Sophanrottany",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/rottany.jpg",
      bio: "Crafts the responsive client interface of Kasephal. Passionate about beautiful, low-bandwidth optimized agricultural listings.",
      favCrop: "Battambang Oranges (ក្រូចពោធិ៍សាត់)",
      skills: ["React", "Tailwind CSS", "Mobile Responsiveness"],
    },
    {
      name: "Pat Konsela",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/sela.jpg",
      bio: "Engineers database schemas, secure payment gateways, and real-time chat APIs behind Kasephal's core platform.",
      favCrop: "Pka Rumduol Rice (ស្រូវផ្ការំដួល)",
      skills: ["Node.js", "PostgreSQL", "System Security"],
    },
    {
      name: "Put Sovannary",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/nary.jpg",
      bio: "Fosters user empathy. Designed the intuitive layout flows crafted specifically for high-accessibility across Cambodian provinces.",
      favCrop: "Koh Dach Pomelo (ក្រូចថ្លុងកោះដាច់)",
      skills: [
        "User Flow Mockups",
        "Figma Design Systems",
        "Interactive Prototypes",
      ],
    },
    {
      name: "Tha Lina",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/lina.jpg",
      bio: "Maintains platform reliability and tests over 100 edge cases to guarantee transaction safety during crop list updates.",
      favCrop: "Phnom Sruoch Mango (ស្វាយកែវចិន)",
      skills: ["Automated Testing", "Jest", "UX Quality Audit"],
    },
    {
      name: "Un Sovannara",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/sovannara.jpg",
      bio: "Bridges the gap between local farming cooperatives and the digital marketplace by leading physical training bootcamps.",
      favCrop: "Mondulkiri Strawberries (ស្ត្រប៊ែរី)",
      skills: ["Public Relations", "Field Training", "Farmer Onboarding"],
    },
    {
      name: "Khin Sakphearoth",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/sakphearoth.jpg",
      bio: "Analyses live market trends and compiles localized price indexes to guide growers in choosing high-demand crop seasons.",
      favCrop: "Kirirom Avocado (អាវ៉ូកាដូគីរីរម្យ)",
      skills: [
        "Data Visualization",
        "Price Forecast Systems",
        "Market Analysis",
      ],
    },
    {
      name: "Ngim Panha",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/panha.jpg",
      bio: "Manages day-to-day administrative alignments, keeping Kasephal collaborative workflows running perfectly on budget and time.",
      favCrop: "Kampong Cham Cashew (ស្វាយចន្ទី)",
      skills: [
        "Stakeholder Relations",
        "Project Budgeting",
        "Agile Operations",
      ],
    },
    {
      name: "Horn Tola",
      role: "Frontend , UX/ UI Designer",
      image: "/aboutUs/tola.jpg",
      bio: "Manages day-to-day administrative alignments, keeping Kasephal collaborative workflows running perfectly on budget and time.",
      favCrop: "Kampong Cham Cashew (ស្វាយចន្ទី)",
      skills: [
        "Stakeholder Relations",
        "Project Budgeting",
        "Agile Operations",
      ],
    },
    {
      name: "Nut Yulong",
      role: "Backend",
      image: "/aboutUs/yulong.jpg",
      bio: "Manages day-to-day administrative alignments, keeping Kasephal collaborative workflows running perfectly on budget and time.",
      favCrop: "Kampong Cham Cashew (ស្វាយចន្ទី)",
      skills: [
        "Stakeholder Relations",
        "Project Budgeting",
        "Agile Operations",
      ],
    },
  ];

  const mentorHelp = ["Backend", "Frontend", "Documentation", "UX/UI"];

  const advisors = [
    {
      name: "Mr. Doeun Kongden",
      role: "Agricultural Economics Expert",
      image: "aboutUs/cherkongden.jpg",
      bio: "Expert in agricultural markets, value chains, and rural development in Cambodia.",
      avatar: "👨‍🏫",
      helped: mentorHelp,
    },
    {
      name: "Mr. Leng Hong Meng",
      role: "Digital Agriculture Specialist",
      image: "aboutUs/cherhongmeng.jpg",
      bio: "Specialist in digital solutions for agriculture and smallholder empowerment.",
      avatar: "👩‍🏫",
      helped: mentorHelp,
    },
    {
      name: "Ms. Lim Houy Hyong",
      role: "Agri-Tech Mentor",
      image: "aboutUs/cherhyong.jpg",
      bio: "Mentor guiding startups on agricultural innovation and sustainable farming technology.",
      avatar: "👨‍🌾",
      helped: mentorHelp,
    },
  ];

  const filteredTeam = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ── Animation (subtle & smooth, respects reduced motion) ──────────────────
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : 0.15, delayChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };
  const reveal = {
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.8, ease: EASE },
  };
  const hoverLift = reduce ? undefined : { y: -4 };
  const hoverNudge = reduce ? undefined : { x: 4 };
  const hoverScale = reduce ? undefined : { scale: 1.03 };
  const tap = reduce ? undefined : { scale: 0.97 };

  return (
    <main>
      <div className="mt-9 min-w-full px-6">
        <div className="relative z-0 -mt-30 h-20 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>{" "}
      <div className="min-h-screen bg-background text-slate-800 font-thicccboi selection:bg-primary selection:text-white">
        {/* 1. HERO */}
        <header className="relative overflow-hidden border-b border-slate-100">
          <div className="pointer-events-none absolute right-0 top-[10%] z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] translate-x-1/2 rounded-full bg-amber-300 opacity-15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[4%] left-0 z-0 h-[clamp(240px,32vw,480px)] w-[clamp(240px,32vw,480px)] -translate-x-1/2 rounded-full bg-yellow-300 opacity-15 blur-3xl" />

          {/* Decorative background crops */}
          <Image
            src="/assets/srov.png"
            width={260}
            height={260}
            alt="srov"
            className="pointer-events-none absolute right-0 top-[15%] z-0 h-auto max-h-[50%] w-[clamp(240px,9vw,200px)] object-contain opacity-50"
          />
          <Image
            src="/assets/srov2.png"
            width={260}
            height={260}
            alt="srov2"
            className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto max-h-[50%] w-[clamp(240px,11vw,200px)] object-contain opacity-50"
          />
          <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left */}
            <motion.div
              className="lg:col-span-6 space-y-7"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              <motion.span
                variants={item}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
              >
                <Leaf className="w-3.5 h-3.5 fill-primary" />
                About Us
              </motion.span>

              <motion.h1
                variants={item}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]"
              >
                About <span className="text-primary">Kasephal</span>
              </motion.h1>

              <motion.p
                variants={item}
                className="text-slate-500 text-base md:text-lg leading-relaxed max-w-md"
              >
                Cambodia’s digital crop marketplace connecting farmers, buyers,
                and government for fairer trade and better market access.
              </motion.p>

              <motion.div
                variants={container}
                className="grid grid-cols-3 gap-3 max-w-md pt-2"
              >
                {[
                  {
                    icon: <Sprout className="w-5 h-5" />,
                    label: "Empower Farmers",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    label: "Connect Buyers",
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    label: "Build Trust",
                  },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    variants={item}
                    whileHover={hoverLift}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-3 text-center"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      {f.icon}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                      {f.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — illustration in a clean card */}
            <motion.div
              className="lg:col-span-6 flex justify-center"
              initial={{
                opacity: 0,
                scale: reduce ? 1 : 0.96,
                y: reduce ? 0 : 20,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
            >
              <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-slate-50 p-6 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="0 0 400 300"
                  className="w-full h-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="skyGrad"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ebf5ee" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width="400"
                    height="300"
                    rx="20"
                    fill="url(#skyGrad)"
                  />
                  <path
                    d="M 120 180 L 130 160 L 140 160 L 145 150 L 155 150 L 160 160 L 170 160 L 180 180 Z"
                    fill="#d2e3dc"
                  />
                  <path
                    d="M 140 180 L 145 145 L 155 145 L 160 180 Z"
                    fill="#b9d5cc"
                  />
                  <circle
                    cx="200"
                    cy="180"
                    r="120"
                    fill="#e2f0e9"
                    opacity="0.5"
                  />
                  <rect
                    x="230"
                    y="40"
                    width="100"
                    height="190"
                    rx="15"
                    fill="#1e293b"
                  />
                  <rect
                    x="235"
                    y="45"
                    width="90"
                    height="180"
                    rx="10"
                    fill="#ffffff"
                  />
                  <rect
                    x="245"
                    y="55"
                    width="70"
                    height="15"
                    rx="4"
                    fill="#107446"
                  />
                  <text
                    x="250"
                    y="66"
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    Kasephal
                  </text>
                  <rect
                    x="245"
                    y="78"
                    width="70"
                    height="35"
                    rx="5"
                    fill="#f4fbf7"
                  />
                  <rect
                    x="245"
                    y="120"
                    width="70"
                    height="35"
                    rx="5"
                    fill="#f4fbf7"
                  />
                  <circle cx="260" cy="95" r="10" fill="#f9c156" />
                  <circle cx="260" cy="138" r="10" fill="#107446" />
                  <path
                    d="M 60 250 C 60 190, 110 190, 110 250 Z"
                    fill="#107446"
                  />
                  <circle cx="85" cy="165" r="22" fill="#ffd0a1" />
                  <path d="M 50 155 Q 85 130 120 155 Z" fill="#e0a651" />
                  <ellipse cx="85" cy="155" rx="28" ry="6" fill="#ca913b" />
                  <path
                    d="M 115 250 C 115 200, 160 200, 160 250 Z"
                    fill="#107446"
                  />
                  <circle cx="137" cy="175" r="20" fill="#ffd0a1" />
                  <path
                    d="M 120 165 Q 137 150 154 165 Q 137 160 120 165"
                    fill="#e05151"
                  />
                  <ellipse cx="110" cy="235" rx="25" ry="15" fill="#d29a53" />
                  <circle cx="100" cy="225" r="6" fill="#f9c156" />
                  <circle cx="112" cy="223" r="6" fill="#107446" />
                  <circle cx="120" cy="226" r="6" fill="#e05151" />
                  <path
                    d="M 160 160 L 230 100"
                    stroke="#107446"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                  <path
                    d="M 230 180 L 160 230"
                    stroke="#f9c156"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        </header>

        {/* 2. OUR MISSION */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-24">
          <SectionHeading
            eyebrow="Our Mission"
            title="Built for fairer trade"
            subtitle="Connecting the people who grow Cambodia’s food with the people who buy it — directly, transparently, and with trust."
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Card 1 */}
            <motion.div
              variants={item}
              whileHover={hoverLift}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition-shadow duration-300 hover:shadow-md"
            >
              <div className="flex items-start gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Sprout className="w-6 h-6" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Empower Farmers
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Easy-to-use digital tools to showcase crops, reach more
                    buyers, and earn better prices with confidence.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={item}
              whileHover={hoverLift}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition-shadow duration-300 hover:shadow-md"
            >
              <div className="flex items-start gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-primary">
                  <BookOpen className="w-6 h-6" />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Connect Buyers
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Reliable crop supply, real-time information, and verified
                    farmers for efficient and secure trade.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 3. HOW KASEPHAL WORKS */}
        <section
          id="how"
          className="relative overflow-hidden bg-linear-to-b from-[#fbf6e9] via-[#F9EAC9] to-[#fbf6e9]"
        >
          {/* Decorative homepage corner accents */}
          <img
            src="/assets/home_page/bg2.png"
            alt=""
            className="pointer-events-none absolute top-0 right-0 z-0 h-auto w-[clamp(160px,18vw,260px)] object-contain opacity-40 -translate-y-4 translate-x-4"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <img
            src="/assets/home_page/bg1.png"
            alt=""
            className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-[clamp(160px,18vw,260px)] object-contain opacity-40 translate-y-4 -translate-x-4"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-24">
            <SectionHeading
              eyebrow="How it works"
              title="From harvest to handshake"
              subtitle="Four simple steps that take a crop from a farmer’s field to a fair, transparent deal."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-14">
              {/* Phone mockup */}
              <motion.div
                className="lg:col-span-5 flex justify-center"
                initial={{ opacity: 0, x: reduce ? 0 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <div className="w-full max-w-sm bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-3 relative">
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-20" />
                  <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100">
                    <div className="bg-primary p-4 text-white pt-6 flex justify-between items-center">
                      <span className="text-xs font-semibold">Kasephal</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
                        Khmer
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center space-y-3">
                        <span className="text-4xl inline-block">🤝</span>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                          Direct Farm Contract Secure
                        </h4>
                        <p className="text-[9px] text-slate-500 leading-relaxed">
                          Farmers &amp; buyers shaking hands seamlessly without
                          local middlemen intervention.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                        <span className="text-2xl">🚛</span>
                        <div className="text-left">
                          <h5 className="text-[10px] font-semibold text-slate-800">
                            Fresh Crop Logistics Dispatch
                          </h5>
                          <p className="text-[8px] text-slate-400">
                            Kampot Pepper batch arriving in Phnom Penh center
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Steps */}
              <motion.div
                className="lg:col-span-7 space-y-4"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {[
                  {
                    n: "01",
                    icon: <Sprout className="w-5 h-5" />,
                    title: "Farmers list crop products",
                    text: "Farmers create product listings with details, quantity, and price.",
                  },
                  {
                    n: "02",
                    icon: <Search className="w-5 h-5" />,
                    title: "Buyers post crop demand",
                    text: "Buyers post their requirements and specifications.",
                  },
                  {
                    n: "03",
                    icon: <MessageSquare className="w-5 h-5" />,
                    title: "Connect, chat, and agree",
                    text: "Both sides communicate, negotiate, and agree on the terms.",
                  },
                  {
                    n: "04",
                    icon: <Shield className="w-5 h-5" />,
                    title: "Trade with trust and transparency",
                    text: "Complete the trade with secure processes and fair transactions.",
                  },
                ].map((step) => (
                  <motion.div
                    key={step.n}
                    variants={item}
                    whileHover={hoverNudge}
                    className="flex gap-4 items-center bg-white p-5 rounded-2xl border border-slate-200 transition-shadow duration-300 hover:shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      {step.icon}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-primary">
                          {step.n}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. MENTORS */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-24">
          <SectionHeading
            eyebrow="Mentors"
            title="Guided by experts"
            subtitle="The mentors who supported our team across the entire build."
          />

          <div className="flex flex-col items-center gap-6 mt-14">
            {/* Top center card */}
            <motion.div
              className="w-full max-w-md"
              initial={reveal.initial}
              whileInView={reveal.whileInView}
              viewport={reveal.viewport}
              transition={reveal.transition}
            >
              <motion.div
                whileHover={hoverLift}
                className="bg-white rounded-2xl border border-slate-200 flex items-stretch gap-4 overflow-hidden transition-shadow duration-300 hover:shadow-md"
              >
                <img
                  src={advisors[0].image}
                  alt={advisors[0].name}
                  className="w-28 h-32 self-center object-cover shrink-0"
                />
                <div className="py-6 pr-6">
                  <h3 className="font-semibold text-slate-900">
                    {advisors[0].name}
                  </h3>
                  {advisors[0].helped && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Helped us with
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {advisors[0].helped.map((task, i) => (
                          <span
                            key={i}
                            className="bg-primary/5 text-primary border border-primary/10 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom row */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {advisors.slice(1).map((advisor, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={hoverLift}
                  className="bg-white rounded-2xl border border-slate-200 flex items-stretch gap-4 overflow-hidden w-full max-w-md mx-auto transition-shadow duration-300 hover:shadow-md"
                >
                  <img
                    src={advisor.image}
                    alt={advisor.name}
                    className="w-28 h-32 self-center object-cover shrink-0"
                  />
                  <div className="py-6 pr-6">
                    <h3 className="font-semibold text-slate-900">
                      {advisor.name}
                    </h3>
                    {advisor.helped && (
                      <div className="mt-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Helped us with
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {advisor.helped.map((task, i) => (
                            <span
                              key={i}
                              className="bg-primary/5 text-primary border border-primary/10 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            >
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 5. OUR TEAM */}
        <section
          id="team"
          className="relative overflow-hidden bg-linear-to-b from-[#fbf6e9] via-[#F9EAC9] to-[#fbf6e9]"
        >
          {/* Decorative homepage corner accents */}
          <img
            src="/assets/home_page/bg2.png"
            alt=""
            className="pointer-events-none absolute top-0 right-0 z-0 h-auto w-[clamp(160px,18vw,260px)] object-contain opacity-40 -translate-y-4 translate-x-4"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <img
            src="/assets/home_page/bg1.png"
            alt=""
            className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-[clamp(160px,18vw,260px)] object-contain opacity-40 translate-y-4 -translate-x-4"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-24">
            <SectionHeading
              eyebrow="Our Team"
              title="The people behind Kasephal"
              subtitle="A small team building a fairer marketplace for Cambodian agriculture."
            />

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mt-14"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={hoverLift}
                  className="relative group"
                >
                  <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-100">
                      <h3 className="text-xs font-semibold text-slate-900 truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 6. OUR IMPACT */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-24">
          <SectionHeading
            eyebrow="Our Impact"
            title="Growing, season by season"
            subtitle="Real numbers from a fairer marketplace for Cambodian agriculture."
          />

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-14"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                icon: <Users className="w-5 h-5" />,
                value: "5,000+",
                label: "Farmers Connected",
              },
              {
                icon: <Sprout className="w-5 h-5" />,
                value: "12,000+",
                label: "Crops Listed",
              },
              {
                icon: <MapPin className="w-5 h-5" />,
                value: "25",
                label: "Provinces Covered",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                value: "8,500+",
                label: "Successful Trades",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={hoverLift}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col items-center text-center gap-3 transition-shadow duration-300 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  {stat.icon}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-slate-900">
                  {stat.value}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 7. CALL TO ACTION — hidden when logged in */}
        {!isLoggedIn && (
          <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 pb-24">
            <motion.div
              className="rounded-3xl border border-slate-200 bg-slate-50 px-8 py-14 md:px-16 text-center"
              initial={reveal.initial}
              whileInView={reveal.whileInView}
              viewport={reveal.viewport}
              transition={reveal.transition}
            >
              <div className="max-w-2xl mx-auto space-y-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mx-auto">
                  <Sprout className="w-6 h-6" />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Join the Kasephal Movement
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                  Whether you grow it or buy it, Kasephal connects you to a
                  fairer, more transparent crop marketplace. Be part of
                  Cambodia’s digital agriculture future today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                  <motion.div
                    whileHover={hoverScale}
                    whileTap={tap}
                    className="inline-flex"
                  >
                    <Link
                      href="/listing-product"
                      className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#0c5131] text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
                    >
                      Explore Crops
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                  <motion.a
                    href="/register"
                    whileHover={hoverScale}
                    whileTap={tap}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-primary border border-slate-200 font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
                  >
                    Get Started
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </div>
    </main>
  );
}
