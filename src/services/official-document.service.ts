import headerToken from "@/lib/headerToken";
import { env } from "@/lib/env";
import { ApiResponse } from "@/types/api-response";
import {
  CreateOfficialDocumentRequest,
  UpdateOfficialDocumentRequest,
  OfficialDocument,
} from "@/types/official-document";

export async function getOfficialDocuments(): Promise<OfficialDocument[]> {
  const headers = await headerToken();

  const res = await fetch(
    `${env.NEXT_BASE_API_URL}/official-document?page=1&size=100`,
    {
      cache: "no-store",
      headers,
    },
  );

  const body = await res.text();

  if (res.status === 401 || res.status === 403) {
    console.error("Official documents are not public yet:", body);
    return [];
  }

  if (!res.ok) {
    console.error(`Failed to fetch official documents (${res.status}):`, body);
    return [];
  }

  if (!body) return [];

  const result: ApiResponse<OfficialDocument[]> = JSON.parse(body);

  return result.payload ?? [];
}

export async function createOfficialDocument(
  payload: CreateOfficialDocumentRequest,
): Promise<OfficialDocument> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/official-document`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json();

    throw new Error(body.detail || "Failed to create official document");
  }

  const result: ApiResponse<OfficialDocument> = await res.json();

  return result.payload;
}

export async function updateOfficialDocument(
  id: string,
  payload: UpdateOfficialDocumentRequest,
): Promise<OfficialDocument> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/official-document/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update document");
  }

  const result: ApiResponse<OfficialDocument> = await res.json();

  return result.payload;
}

export async function deleteOfficialDocument(id: string): Promise<void> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/official-document/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to delete document");
  }
}
