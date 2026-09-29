import { OfficialDocument } from "@/types/official-document";
import { DocumentItem } from "@/types/document";
import { env } from "@/lib/env";

export function mapOfficialDocumentsToCards(
  officialDocuments: OfficialDocument[],
): DocumentItem[] {
  return officialDocuments.map((doc, index) => ({
    id: index + 1,
    officialDocumentId: doc.officialDocumentId,
    title: doc.title,
    description: doc.description,
    date: new Date(doc.createdAt).toLocaleDateString(),
    uploadDate: doc.createdAt,

    fileUrl:
      doc.attachments.length > 0
        ? `${env.NEXT_PUBLIC_BASE_API_URL}/uploads/download/${doc.attachments[0].fileName}`
        : "",

    attachmentFileName: doc.attachments[0]?.fileName ?? "",
  }));
}
