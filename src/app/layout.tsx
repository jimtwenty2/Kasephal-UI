import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { auth } from "@/auth";
import { cookies } from "next/headers";
const thicccboi = localFont({
  src: [
    {
      path: "./fonts/Thicccboi/THICCCBOI_Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Thicccboi/THICCCBOI_Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Thicccboi/THICCCBOI_Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/Thicccboi/THICCCBOI_SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Thicccboi/THICCCBOI_Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-thicccboi",
  display: "swap",
});

const kantumruyPro = localFont({
  src: [
    {
      path: "./fonts/Kantumruy_Pro/static/KantumruyPro_Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Kantumruy_Pro/static/KantumruyPro_Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Kantumruy_Pro/static/KantumruyPro_SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Kantumruy_Pro/static/KantumruyPro_Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-kantumruy-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kasephal",
  description: "Kasephal marketplace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedLang = cookieStore.get("language")?.value;
  const initialLanguage: "en" | "kh" = savedLang === "kh" ? "kh" : "en";
  const session = await auth();

  return (
    <html
      lang="en"
      className={`
        ${thicccboi.className}
        ${thicccboi.variable}
        ${kantumruyPro.variable}
        h-full antialiased
      `}
    >
      <body className="min-h-full flex flex-col">
        <Providers session={session} initialLanguage={initialLanguage}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
