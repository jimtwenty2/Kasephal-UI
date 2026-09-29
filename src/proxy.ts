import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@/types/user-role";

const ROUTE_ROLES: Record<string, UserRole[]> = {
  "/dashboard": [UserRole.ADMIN],
  "/escrow-management": [UserRole.ADMIN],
  "/policy-management": [UserRole.ADMIN],
  "/crop-management": [UserRole.ADMIN],
  "/identity-verification": [UserRole.ADMIN],
  "/report-management": [UserRole.ADMIN],
  "/user-management": [UserRole.ADMIN],
  "/request-payment-management": [UserRole.ADMIN],

  "/crop-product-management": [UserRole.FARMER],
  "/crop-product-edit": [UserRole.FARMER],
  "/withdraw": [UserRole.FARMER, UserRole.BUYER,UserRole.GOVERNMENT],
  "/payment-product": [UserRole.BUYER,UserRole.GOVERNMENT],
  "/order-crop-product": [UserRole.BUYER,UserRole.GOVERNMENT],

  "/crop-demands-management": [UserRole.BUYER, UserRole.GOVERNMENT],
  "/crop-demands-edit": [UserRole.BUYER, UserRole.GOVERNMENT],
  "/payment-demands": [UserRole.BUYER, UserRole.GOVERNMENT],
  "/order-crop-demands": [UserRole.BUYER, UserRole.GOVERNMENT],

  "/order-history": [UserRole.GOVERNMENT, UserRole.FARMER, UserRole.BUYER],
  "/delivery": [UserRole.GOVERNMENT, UserRole.FARMER, UserRole.BUYER],
  "/chat": [UserRole.GOVERNMENT, UserRole.FARMER, UserRole.BUYER],
  "/digital-contract": [UserRole.GOVERNMENT, UserRole.FARMER, UserRole.BUYER],
  "/rating": [UserRole.FARMER, UserRole.BUYER,UserRole.GOVERNMENT],

  "/overview-dashboard/crop-management": [UserRole.GOVERNMENT],
  "/overview-dashboard": [UserRole.GOVERNMENT, UserRole.FARMER, UserRole.BUYER],
  "/own-profile": [UserRole.GOVERNMENT, UserRole.FARMER, UserRole.BUYER],
  "/report": [UserRole.GOVERNMENT, UserRole.FARMER, UserRole.BUYER],
};

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/listing-product",
  "/listing-crop-demands",
  "/market-price",
  "/aboutUs",
  "/forgot-password",
  "/unauthorized",
];

function matchRoute(pathname: string): UserRole[] | null {
  if (ROUTE_ROLES[pathname]) {
    return ROUTE_ROLES[pathname];
  }

  const matched = Object.keys(ROUTE_ROLES)
    .filter((route) => route !== "/" && pathname.startsWith(route + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return matched ? ROUTE_ROLES[matched] : null;
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;

  // Admin can only access admin pages + login + unauthorized
  if (role === UserRole.ADMIN) {
    const allowedAdminRoutes = [
      "/login",
      "/dashboard",
      "/crop-management",
      "/identity-verification",
      "/escrow-management",
      "/policy-management",
      "/report-management",
      "/user-management",
      "/request-payment-management",
    ];

    const canAccess = allowedAdminRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );

    if (!canAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Public pages for non-admins
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const allowedRoles = matchRoute(pathname);

  if (allowedRoles && !allowedRoles.includes(role!)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|otf)$).*)",
  ],
};
