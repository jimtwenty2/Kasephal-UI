import { NextRequest } from "next/server";

import headerToken from "@/lib/headerToken";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get("file")?.trim();

  if (!file || file.toLowerCase() === "string") {
    return new Response("Missing attachment file.", { status: 400 });
  }

  const targetUrl = getAttachmentTargetUrl(file);
  const headers = new Headers(await headerToken());
  headers.delete("Content-Type");

  const response = await fetch(targetUrl, {
    cache: "no-store",
    headers,
  });

  if (!response.ok || !response.body) {
    return new Response("Attachment image could not be loaded.", {
      status: response.status || 502,
    });
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": response.headers.get("Content-Type") ?? "image/*",
    },
  });
}

function getAttachmentTargetUrl(file: string) {
  const base = env.NEXT_BASE_API_URL.replace(/\/+$/, "");

  if (/^https?:\/\//i.test(file)) {
    return file;
  }

  if (file.includes("/uploads/view/")) {
    return `${base}/${file.replace(/^\/+/, "")}`;
  }

  if (file.includes("/")) {
    return `${base}/${file.replace(/^\/+/, "")}`;
  }

  return `${base}/uploads/view/${encodeURIComponent(file)}`;
}
