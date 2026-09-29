import { RegisterRole } from "./register.type";

export type DocumentType = "ID_CARD" | "PASSPORT";

export interface IdentityDocumentRequest {
  documentType: DocumentType;
  frontImageUrl: string;
  backImageUrl?: string;
}

export interface IdentityDocument {
  identityDocumentId: string;
  userId: string;
  fullName: string;
  email: string;
  profileUrl: string | null;
  role: RegisterRole;
  documentType: DocumentType;
  frontImageUrl: string;
  backImageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  submittedAt: string;
}

export interface IdentityDocumentResponse {
  status: number;
  message: string;
  payload: IdentityDocument;
  success: boolean;
  timestamp: string;
}