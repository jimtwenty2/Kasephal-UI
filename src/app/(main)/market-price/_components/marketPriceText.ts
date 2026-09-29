import { useI18n } from "@/lib/i18n/I18nContext";

const MARKET_PRICE_TEXT = {
  "market.hero.title": {
    en: "Official Market Information",
    kh: "ព័ត៌មានទីផ្សារផ្លូវការ",
  },
  "market.hero.khTitle": {
    en: "ព័ត៍មានទីផ្សារផ្លូវការ",
    kh: "ព័ត៍មានទីផ្សារផ្លូវការ",
  },
  "market.hero.description": {
    en: "Access the latest official market price for agricultural products across all region. Stay informed with updated pricing, trends, and government announcements.",
    kh: "ចូលមើលតម្លៃទីផ្សារផ្លូវការចុងក្រោយសម្រាប់ផលិតផលកសិកម្មនៅគ្រប់តំបន់។ ទទួលបានព័ត៌មានថ្មីៗអំពីតម្លៃ និន្នាការ និងសេចក្ដីប្រកាសរបស់រដ្ឋាភិបាល។",
  },

  "market.action.refresh": { en: "Refresh", kh: "ផ្ទុកឡើងវិញ" },
  "market.action.export": { en: "Export", kh: "នាំចេញ" },
  "market.export.csv": { en: "Export as CSV", kh: "នាំចេញជា CSV" },
  "market.export.csv.description": {
    en: "Comma-separated values",
    kh: "តម្លៃបំបែកដោយសញ្ញាក្បៀស",
  },
  "market.export.excel": { en: "Export as Excel", kh: "នាំចេញជា Excel" },
  "market.export.excel.description": {
    en: "Microsoft Excel workbook",
    kh: "សៀវភៅការងារ Microsoft Excel",
  },
  "market.export.pdf": { en: "Export as PDF", kh: "នាំចេញជា PDF" },
  "market.export.pdf.description": {
    en: "Portable document format",
    kh: "ទម្រង់ឯកសារចល័ត",
  },

  "market.action.edit": { en: "Edit", kh: "កែសម្រួល" },
  "market.action.delete": { en: "Delete", kh: "លុប" },
  "market.action.download": { en: "Download", kh: "ទាញយក" },
  "market.action.cancel": { en: "Cancel", kh: "បោះបង់" },
  "market.action.save": { en: "Save", kh: "រក្សាទុក" },
  "market.action.saving": { en: "Saving...", kh: "កំពុងរក្សាទុក..." },
  "market.action.deleting": { en: "Deleting...", kh: "កំពុងលុប..." },
  "market.action.noCancel": { en: "No, Cancel", kh: "ទេ បោះបង់" },
  "market.action.yesDelete": { en: "Yes, Delete", kh: "បាទ/ចាស លុប" },

  "market.select": { en: "Select", kh: "ជ្រើសរើស" },
  "market.select.region": { en: "Select Region", kh: "ជ្រើសរើសតំបន់" },
  "market.all": { en: "All", kh: "ទាំងអស់" },
  "market.search": { en: "Search", kh: "ស្វែងរក" },
  "market.search.crop.placeholder": {
    en: "Search by crop name...",
    kh: "ស្វែងរកតាមរយៈឈ្មោះដំណាំ...",
  },
  "market.search.crop.document-placeholder": {
    en: "Search by document title...",
    kh: "ស្វែងរកតាមរយៈចំណងជើងឯកសារ...",
  },
  "market.search.document.placeholder": {
    en: "Search document...",
    kh: "ស្វែងរកឯកសារ...",
  },

  "market.tab.price": {
    en: "Official Market Price",
    kh: "តម្លៃទីផ្សារផ្លូវការ",
  },
  "market.tab.documents": {
    en: "Official Documents",
    kh: "ឯកសារផ្លូវការ",
  },

  "market.summary.label": {
    en: "DAILY SUMMARY",
    kh: "សេចក្ដីសង្ខេបប្រចាំថ្ងៃ",
  },
  "market.overview.title": {
    en: "Market Overview",
    kh: "ទិដ្ឋភាពទីផ្សារ",
  },
  "market.stats.highest": {
    en: "Highest Price Crop per KG",
    kh: "ដំណាំដែលមានតម្លៃខ្ពស់បំផុតក្នុងមួយគីឡូ",
  },
  "market.stats.lowest": {
    en: "Lowest Price Crop per KG",
    kh: "ដំណាំដែលមានតម្លៃទាបបំផុតក្នុងមួយគីឡូ",
  },
  "market.stats.totalCropType": {
    en: "Total Crop Type",
    kh: "ប្រភេទដំណាំសរុប",
  },
  "market.stats.types": { en: "Types", kh: "ប្រភេទ" },
  "market.stats.noData": { en: "No data", kh: "គ្មានទិន្នន័យ" },
  "market.exchangeRate": { en: "Exchange Rate", kh: "អត្រាប្តូរប្រាក់" },

  "market.section.priceData": {
    en: "PRICE DATA",
    kh: "ទិន្នន័យតម្លៃ",
  },
  "market.section.cropPriceListing": {
    en: "Crop Price Listing",
    kh: "បញ្ជីតម្លៃដំណាំ",
  },
  "market.export.generated": { en: "Generated", kh: "បានបង្កើត" },
  "market.section.resources": { en: "RESOURCES", kh: "ធនធាន" },
  "market.section.governmentAnnouncement": {
    en: "GOVERNMENT ANNOUNCEMENT",
    kh: "សេចក្ដីប្រកាសរបស់រដ្ឋាភិបាល",
  },

  "market.button.addMarketPrice": {
    en: "ADD MARKET PRICE",
    kh: "បន្ថែមតម្លៃទីផ្សារ",
  },
  "market.button.uploadDocument": {
    en: "UPLOAD DOCUMENT",
    kh: "បន្ថែមឯកសារ",
  },

  "market.status.savingChanges": {
    en: "Saving changes…",
    kh: "កំពុងរក្សាទុកការផ្លាស់ប្តូរ…",
  },
  "market.status.changesSaved": {
    en: "Changes saved",
    kh: "បានរក្សាទុកការផ្លាស់ប្តូរ",
  },

  "market.modal.addMarketPrice": {
    en: "Add Market Price",
    kh: "បន្ថែមតម្លៃទីផ្សារ",
  },
  "market.modal.editMarketPrice": {
    en: "Edit Market Price",
    kh: "កែសម្រួលតម្លៃទីផ្សារ",
  },
  "market.modal.deleteMarketPrice": {
    en: "Delete Market Price",
    kh: "លុបតម្លៃទីផ្សារ",
  },
  "market.modal.uploadDocument": {
    en: "Upload Document",
    kh: "ផ្ទុកឯកសារ",
  },
  "market.modal.editDocument": {
    en: "Edit Document",
    kh: "កែសម្រួលឯកសារ",
  },

  "market.confirm.deleteThis": { en: "Delete this?", kh: "លុបមែនទេ?" },
  "market.confirm.deleteItem": {
    en: "Are you sure you want to delete this item?",
    kh: "តើអ្នកប្រាកដថាចង់លុបធាតុនេះមែនទេ?",
  },
  "market.confirm.deleteMarketPricePrefix": {
    en: "Are you sure you want to delete",
    kh: "តើអ្នកប្រាកដថាចង់លុប",
  },
  "market.confirm.deleteMarketPriceSuffix": {
    en: "market price? This action cannot be undone.",
    kh: "តម្លៃទីផ្សារនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
  },

  "market.form.chooseFile": {
    en: "Choose a file or drag and drop here",
    kh: "ជ្រើសរើសឯកសារ​ ឬទាញមកទីនេះ",
  },
  "market.form.supportedFiles": {
    en: "Support: PNG, JPG, PDF, DOC, XLS",
    kh: "គាំទ្រ៖ PNG, JPG, PDF, DOC, XLS",
  },
  "market.form.browse": { en: "Browse File", kh: "រកមើលឯកសារ" },
  "market.form.title": { en: "Title", kh: "ចំណងជើង" },
  "market.form.description": { en: "Description", kh: "ការពិពណ៌នា" },
  "market.form.documentTitle.placeholder": {
    en: "Enter document title",
    kh: "បញ្ចូលចំណងជើងឯកសារ",
  },
  "market.form.documentDescription.placeholder": {
    en: "Enter document description",
    kh: "បញ្ចូលការពិពណ៌នាឯកសារ",
  },

  "market.validation.titleMinLength": {
    en: "Title must be at least 3 characters.",
    kh: "ចំណងជើងត្រូវមានយ៉ាងហោចណាស់ ៣ តួអក្សរ។",
  },

  "market.validation.descriptionMinLength": {
    en: "Description must be at least 3 characters.",
    kh: "ការពិពណ៌នាត្រូវមានយ៉ាងហោចណាស់ ៣ តួអក្សរ។",
  },

  "market.form.cropType": { en: "CROP TYPE", kh: "ប្រភេទដំណាំ" },
  "market.form.cropName": { en: "CROP NAME", kh: "ឈ្មោះដំណាំ" },
  "market.form.region": { en: "REGION", kh: "តំបន់" },
  "market.form.unitType": { en: "Unit Type", kh: "ប្រភេទឯកតា" },
  "market.form.currentPrice": {
    en: "Current Price (KHR)",
    kh: "តម្លៃបច្ចុប្បន្ន (KHR)",
  },
  "market.form.minFloorPrice": {
    en: "Min Floor Price (KHR)",
    kh: "តម្លៃអប្បបរមា (KHR)",
  },
  "market.form.priceThreshold": {
    en: "Price Threshold (KHR)",
    kh: "កម្រិតតម្លៃ (KHR)",
  },
  "market.form.validityDate": {
    en: "Validity Date",
    kh: "កាលបរិច្ឆេទសុពលភាព",
  },
  "market.form.currentPrice.placeholder": {
    en: "Enter current price",
    kh: "បញ្ចូលតម្លៃបច្ចុប្បន្ន",
  },
  "market.form.minFloorPrice.placeholder": {
    en: "Enter minimal floor price",
    kh: "បញ្ចូលតម្លៃអប្បបរមា",
  },
  "market.form.priceThreshold.placeholder": {
    en: "Enter price threshold",
    kh: "បញ្ចូលកម្រិតតម្លៃ",
  },

  "market.table.no": { en: "NO", kh: "ល.រ" },
  "market.table.cropName": { en: "CROP NAME", kh: "ឈ្មោះដំណាំ" },
  "market.table.cropType": { en: "CROP TYPE", kh: "ប្រភេទដំណាំ" },
  "market.table.region": { en: "REGION", kh: "តំបន់" },
  "market.table.unit": { en: "UNIT", kh: "ឯកតា" },
  "market.table.currentPrice": {
    en: "CURRENT PRICE (KHR)",
    kh: "តម្លៃបច្ចុប្បន្ន (KHR)",
  },
  "market.table.minPrice": {
    en: "MIN. PRICE (KHR)",
    kh: "តម្លៃអប្បបរមា (KHR)",
  },
  "market.table.validityDate": {
    en: "VALIDITY DATE",
    kh: "កាលបរិច្ឆេទសុពលភាព",
  },
  "market.table.actions": { en: "Actions", kh: "សកម្មភាព" },

  "market.empty.marketPrices": {
    en: "No market prices found.",
    kh: "រកមិនឃើញតម្លៃទីផ្សារ។",
  },
  "market.empty.documents": {
    en: "No documents found",
    kh: "រកមិនឃើញឯកសារ",
  },

  "market.toast.documentUploaded.title": {
    en: "Document Uploaded",
    kh: "បានផ្ទុកឯកសារ",
  },
  "market.toast.documentUploaded.message": {
    en: "uploaded successfully",
    kh: "បានផ្ទុកឡើងដោយជោគជ័យ",
  },
  "market.toast.uploadFailed.title": {
    en: "Failed to upload document",
    kh: "ផ្ទុកឯកសារមិនបានសម្រេច",
  },
  "market.toast.downloadFailed.title": {
  en: "Document not found",
  kh: "រកមិនឃើញឯកសារ",
},
"market.toast.downloadFailed.message": {
  en: "This document is no longer available.",
  kh: "ឯកសារនេះមិនមានទៀតទេ។",
},
  "market.toast.marketAdded.title": {
    en: "Market Price Added",
    kh: "បានបន្ថែមតម្លៃទីផ្សារ",
  },
  "market.toast.marketAdded.message": {
    en: "market price added successfully",
    kh: "បានបន្ថែមតម្លៃទីផ្សារដោយជោគជ័យ",
  },
  "market.toast.marketAddFailed.title": {
    en: "Failed to Add Market Price",
    kh: "បន្ថែមតម្លៃទីផ្សារមិនបានសម្រេច",
  },
  "market.toast.missingInfo.title": {
    en: "Missing Information",
    kh: "ខ្វះព័ត៌មាន",
  },
  "market.toast.missingInfo.message": {
    en: "Please fill in all required fields.",
    kh: "សូមបំពេញវាលដែលចាំបាច់ទាំងអស់។",
  },
  "market.toast.updateFailed.title": {
    en: "Update Failed",
    kh: "ធ្វើបច្ចុប្បន្នភាពមិនបានសម្រេច",
  },
  "market.toast.marketUpdated.title": {
    en: "Market Price Updated",
    kh: "បានធ្វើបច្ចុប្បន្នភាពតម្លៃទីផ្សារ",
  },
  "market.toast.marketUpdated.message": {
    en: "updated successfully",
    kh: "បានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ",
  },
  "market.toast.deleteFailed.title": {
    en: "Delete Failed",
    kh: "លុបមិនបានសម្រេច",
  },
  "market.toast.marketDeleted.title": {
    en: "Market Price Deleted",
    kh: "បានលុបតម្លៃទីផ្សារ",
  },
  "market.toast.marketDeleted.message": {
    en: "market price deleted successfully",
    kh: "បានលុបតម្លៃទីផ្សារដោយជោគជ័យ",
  },
  "market.toast.validationError.title": {
    en: "Validation Error",
    kh: "កំហុសក្នុងការផ្ទៀងផ្ទាត់",
  },
  "market.toast.titleRequired.message": {
    en: "Title is required",
    kh: "ត្រូវការចំណងជើង",
  },
  "market.toast.documentUpdated.title": {
    en: "Document Updated",
    kh: "បានធ្វើបច្ចុប្បន្នភាពឯកសារ",
  },
  "market.toast.documentUpdated.message": {
    en: "Document updated successfully",
    kh: "បានធ្វើបច្ចុប្បន្នភាពឯកសារដោយជោគជ័យ",
  },
  "market.toast.documentDeleted.title": {
    en: "Document Deleted",
    kh: "បានលុបឯកសារ",
  },
  "market.toast.documentDeleted.message": {
    en: "Document deleted successfully",
    kh: "បានលុបឯកសារដោយជោគជ័យ",
  },
  "market.searchLabel": {
    en: "SEARCH",
    kh: "ស្វែងរក",
  },
  "market.date.label": {
    en: "Date",
    kh: "កាលបរិច្ឆេទ",
  },
  "market.date.start": {
    en: "Start Date",
    kh: "កាលបរិច្ឆេទចាប់ផ្តើម",
  },
  "market.date.end": {
    en: "End Date",
    kh: "កាលបរិច្ឆេទបញ្ចប់",
  },
  "market.date.selectRange": {
    en: "Select date range",
    kh: "ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ",
  },
  "market.date.today": {
    en: "Today",
    kh: "ថ្ងៃនេះ",
  },
  "market.date.next7Days": {
    en: "Next 7 Days",
    kh: "៧ ថ្ងៃបន្ទាប់",
  },
} as const;

export function getMarketPriceText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    MARKET_PRICE_TEXT[key as keyof typeof MARKET_PRICE_TEXT]?.[lang] ?? key;
}

export function useMarketPriceText() {
  const { language } = useI18n();

  const t = getMarketPriceText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  return { language, t, fontClass };
}
