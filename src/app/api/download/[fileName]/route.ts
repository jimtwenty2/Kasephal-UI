import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> },
) {
  const { fileName } = await params;

  const response = await fetch(
    `${BASE_URL}/uploads/download/${encodeURIComponent(fileName)}`,
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        success: false,
        message: "Document not found",
      },
      {
        status: 404,
      },
    );
  }

  return new Response(response.body, {
    headers: response.headers,
  });
}