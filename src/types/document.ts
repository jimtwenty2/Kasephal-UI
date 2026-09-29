export interface DocumentItem {
  id: number;
  officialDocumentId: string;
  title: string;
  date: string;
  description: string;
  attachmentFileName: string;
  fileUrl?: string;
  uploadDate: string;
}
