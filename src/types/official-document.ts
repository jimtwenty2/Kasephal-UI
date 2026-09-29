export interface OfficialDocumentAttachment {
  fileName: string;
}

export interface OfficialDocument {
  officialDocumentId: string;
  title: string;
  description: string;
  attachments: OfficialDocumentAttachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateOfficialDocumentRequest {
  title: string;
  description: string;
  fileName: {
    fileName: string;
  }[];
}

export interface UpdateOfficialDocumentRequest {
  title: string;
  description: string;
  fileName: {
    fileName: string;
  }[];
}
