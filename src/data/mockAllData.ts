// Mock data for the admin dashboard.
// Modeled after the Kasephal ERD. Use these arrays directly from admin pages
// until the API is wired up.

// ---------- Shared enums ----------

export type UserRole = "ADMIN" | "GOVERNMENT" | "BUYER" | "FARMER";
export type UserStatus = "ACTIVE" | "WARNING" | "SUSPENDED" | "BANNED";
export type ProfileStatus = "ACTIVE" | "SUSPENDED" | "BANNED";
export type IdentityDocumentType = "ID_CARD" | "PASSPORT";
export type IdentityDocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type MedalType = "GOLD" | "SILVER" | "BRONZE";
export type TrustLevel = "HIGH" | "MEDIUM" | "LOW";
export type CurrencyCode = "KHR" | "USD";
export type UnitType = "KG" | "TON";
export type PolicyStatus = "DRAFT" | "PUBLISHED";

export type ReportIssueType =
  | "CONTRACT"
  | "ESCROW"
  | "DELIVERY"
  | "VIOLATION_TERMS"
  | "OTHER";
export type ReportIssueStatus =
  | "PENDING"
  | "WAITING_PROOF"
  | "APPROVED"
  | "REJECTED"

// Account action taken when resolving a report. Absent when the report was
// approved/rejected without warning or banning the reported user.
export type ReportResolutionAction = "WARNING" | "BANNED";

export type EscrowTransactionType = "LOCKED" | "RELEASE" | "REFUND";
export type EscrowStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PENDING" | "FAILED" | "PAID";

export type PaymentRequestType = "REFUND" | "WITHDRAW";
export type PaymentRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type Region =
  | "BANTEAY_MEANCHEY"
  | "BATTAMBANG"
  | "KAMPONG_CHAM"
  | "KAMPONG_CHHNANG"
  | "KAMPONG_SPEU"
  | "KAMPONG_THOM"
  | "KAMPOT"
  | "KANDAL"
  | "KOH_KONG"
  | "KRATIE"
  | "MONDULKIRI"
  | "PHNOM_PENH"
  | "PREAH_VIHEAR"
  | "PREY_VENG"
  | "PURSAT"
  | "RATANAKIRI"
  | "SIEM_REAP"
  | "SIHANOUKVILLE"
  | "STUNG_TRENG"
  | "SVAY_RIENG"
  | "TAKEO"
  | "TBOUNG_KHMUM"
  | "ODDAR_MEANCHEY"
  | "KEP"
  | "PAILIN";

// ---------- Entity types ----------

export interface AdminUser {
  user_id: string;
  email: string;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  avatar_url?: string;
  is_otp_verified: boolean;
}

export interface FarmerProfile {
  farmer_profile_id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  place_of_birth: string;
  farm_location: string;
  farm_size: number;
  bakong_account_id: string;
  trust_score: number;
  medal_type: MedalType;
  trust_level: TrustLevel;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface BuyerProfile {
  buyer_profile_id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  place_of_birth: string;
  business_type: string;
  business_name: string;
  business_address: string;
  bakong_account_id: string;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface GovernmentProfile {
  government_profile_id: string;
  user_id: string;
  ministry_name: string;
  address: string;
  bakong_account_id: string;
  created_at: string;
  updated_at: string;
}

export interface IdentityDocument {
  identity_document_id: string;
  user_id: string;
  document_type: IdentityDocumentType;
  status: IdentityDocumentStatus;
  rejection_reason?: string;
  file_name: string;
  created_at: string;
  updated_at: string;
}

export interface SystemPolicy {
  policy_id: string;
  title: string;
  content: string;
  status: PolicyStatus;
  created_by: string; // admin user_id
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ReportIssueAttachment {
  report_attachment_id: string;
  report_issue_id: string;
  image_url: string;
}

export interface ReportIssue {
  report_issue_id: string;
  title: string;
  description: string;
  issue_type: ReportIssueType;
  status: ReportIssueStatus;
  order_id?: string;
  reporter_id: string;
  reported_user_id: string;
  attachments: ReportIssueAttachment[];
  created_at: string;
  resolution_action?: ReportResolutionAction;
}


export interface Payment {
  payment_id: string;
  order_id: string;
  paid_by: string; // user_id
  amount: number;
  currency_code: CurrencyCode;
  qr_string: string;
  md5: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  escrow_transaction_id: string;
  transaction_type: EscrowTransactionType;
  amount: number;
  currency_code: CurrencyCode;
  status: EscrowStatus;
  payment_id?: string;
  order_id: string;
  payment_request_id?: string;
  created_at: string;
}

export interface PaymentRequest {
  payment_request_id: string;
  requested_by: string; // user_id
  order_id?: string;
  request_type: PaymentRequestType;
  amount: number;
  reason: string;
  status: PaymentRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_farmers: number;
  total_buyers: number;
  total_government: number;
  active_users: number;
  suspended_users: number;
  pending_identity_documents: number;
  pending_reports: number;
  pending_payment_requests: number;
  escrow_locked_amount_usd: number;
  escrow_released_amount_usd: number;
  total_orders_this_month: number;
  total_revenue_usd_this_month: number;
}

export interface MonthlyMetric {
  month: string; // YYYY-MM
  new_users: number;
  orders: number;
  revenue_usd: number;
}

// ---------- Mock data ----------

export const adminUsers: AdminUser[] = [
  {
    user_id: "u-0001",
    email: "admin@kasephal.kh",
    phone_number: "+855 12 000 001",
    role: "ADMIN",
    status: "ACTIVE",
    bio: "Platform administrator",
    avatar_url: "/avatars/admin-01.png",
    is_otp_verified: true,
  },
  {
    user_id: "u-0002",
    email: "moa.contact@gov.kh",
    phone_number: "+855 23 211 100",
    role: "GOVERNMENT",
    status: "ACTIVE",
    bio: "Ministry of Agriculture, Forestry and Fisheries",
    avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0BIpRuFK2wEMkxfKc_nKGa-F8uBiOshUbTQ&s",
    is_otp_verified: true,
  },
  {
    user_id: "u-0003",
    email: "chanthy.farm@gmail.com",
    phone_number: "+855 92 334 558",
    role: "FARMER",
    status: "ACTIVE",
    bio: "Rice & cassava farmer in Battambang",
    avatar_url: "https://media.istockphoto.com/id/1188429880/photo/thai-farmer.jpg?s=612x612&w=0&k=20&c=xV5BU-hAv0ZAp2UiXhHLiUwtfpaGEyD7vdyoNT1i6Zo=",
    is_otp_verified: true,
  },
  {
    user_id: "u-0004",
    email: "dara.mango@gmail.com",
    phone_number: "+855 88 661 220",
    role: "FARMER",
    status: "WARNING",
    bio: "Mango grower",
    avatar_url: "https://thumbs.dreamstime.com/b/young-asia-farmer-carrying-full-basket-vegetable-smiling-happy-face-organic-farm-happy-asia-farmer-smiling-hold-148982776.jpg",
    is_otp_verified: true,
  },
  {
    user_id: "u-0005",
    email: "sreypov.fields@gmail.com",
    phone_number: "+855 17 882 991",
    role: "FARMER",
    status: "ACTIVE",
    bio: "Vegetables and pepper",
    avatar_url: "https://thumbs.dreamstime.com/b/traditional-young-asian-burmese-female-farmer-portrait-girl-thanaka-powdered-face-harvesting-field-64700001.jpg",
    is_otp_verified: true,
  },
  {
    user_id: "u-0006",
    email: "vibol.harvest@gmail.com",
    phone_number: "+855 11 700 882",
    role: "FARMER",
    status: "SUSPENDED",
    bio: "Suspended pending identity re-verification",
    avatar_url: "https://www.shutterstock.com/image-photo/old-indonesian-man-farmer-serious-260nw-2740321741.jpg",
    is_otp_verified: false,
  },
  {
    user_id: "u-0007",
    email: "procurement@angkorfoods.com",
    phone_number: "+855 23 990 110",
    role: "BUYER",
    status: "ACTIVE",
    bio: "B2B food distributor",
    avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0BIpRuFK2wEMkxfKc_nKGa-F8uBiOshUbTQ&s",
    is_otp_verified: true,
  },
  {
    user_id: "u-0008",
    email: "ops@mekongtrading.kh",
    phone_number: "+855 23 555 312",
    role: "BUYER",
    status: "ACTIVE",
    bio: "Export-focused buyer",
    avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0BIpRuFK2wEMkxfKc_nKGa-F8uBiOshUbTQ&s",
    is_otp_verified: true,
  },
  {
    user_id: "u-0009",
    email: "supply@sokimexagri.com",
    phone_number: "+855 78 410 220",
    role: "BUYER",
    status: "BANNED",
    bio: "Banned after repeated terms violations",
    avatar_url: "https://thumbs.dreamstime.com/b/face-asian-business-man-22264633.jpg",
    is_otp_verified: true,
  },
  {
    user_id: "u-0010",
    email: "nary.rice@gmail.com",
    phone_number: "+855 96 224 887",
    role: "FARMER",
    status: "ACTIVE",
    bio: "Organic jasmine rice",
    avatar_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0BIpRuFK2wEMkxfKc_nKGa-F8uBiOshUbTQ&s",
    is_otp_verified: true,
  },
];

export const farmerProfiles: FarmerProfile[] = [
  {
    farmer_profile_id: "fp-0001",
    user_id: "u-0003",
    full_name: "Pich Chanthy",
    date_of_birth: "Jan 01, 1985",
    place_of_birth: "Battambang",
    farm_location: "Rattanak Mondol, Battambang",
    farm_size: 12.5,
    bakong_account_id: "chanthy@aclb",
    trust_score: 4.72,
    medal_type: "GOLD",
    trust_level: "HIGH",
    status: "ACTIVE",
    created_at: "2025-10-04T02:14:00Z",
    updated_at: "2026-05-10T07:45:00Z",
  },
  {
    farmer_profile_id: "fp-0002",
    user_id: "u-0004",
    full_name: "Hun Dara",
    date_of_birth: "Jun 13, 1990",
    place_of_birth: "Kampong Speu",
    farm_location: "Phnom Sruoch, Kampong Speu",
    farm_size: 6.0,
    bakong_account_id: "dara@aclb",
    trust_score: 3.10,
    medal_type: "SILVER",
    trust_level: "MEDIUM",
    status: "ACTIVE",
    created_at: "2025-11-19T05:30:00Z",
    updated_at: "2026-05-05T10:00:00Z",
  },
  {
    farmer_profile_id: "fp-0003",
    user_id: "u-0005",
    full_name: "Lim Sreypov",
    date_of_birth: "Jul 09, 1992",
    place_of_birth: "Kampot",
    farm_location: "Chhuk, Kampot",
    farm_size: 3.2,
    bakong_account_id: "sreypov@wing",
    trust_score: 4.20,
    medal_type: "GOLD",
    trust_level: "HIGH",
    status: "ACTIVE",
    created_at: "2025-12-01T01:10:00Z",
    updated_at: "2026-05-09T13:20:00Z",
  },
  {
    farmer_profile_id: "fp-0004",
    user_id: "u-0006",
    full_name: "Ouk Vibol",
    date_of_birth: "Aug 20, 1986",
    place_of_birth: "Siem Reap",
    farm_location: "Puok, Siem Reap",
    farm_size: 8.0,
    bakong_account_id: "vibol@aclb",
    trust_score: 1.80,
    medal_type: "BRONZE",
    trust_level: "LOW",
    status: "SUSPENDED",
    created_at: "2026-01-08T04:00:00Z",
    updated_at: "2026-04-30T09:15:00Z",
  },
  {
    farmer_profile_id: "fp-0005",
    user_id: "u-0010",
    full_name: "Sok Nary",
    date_of_birth: "Nov 23, 1995",
    place_of_birth: "Prey Veng",
    farm_location: "Kamchay Mear, Prey Veng",
    farm_size: 4.5,
    bakong_account_id: "nary@aclb",
    trust_score: 3.85,
    medal_type: "SILVER",
    trust_level: "MEDIUM",
    status: "ACTIVE",
    created_at: "2026-02-14T02:00:00Z",
    updated_at: "2026-05-12T08:30:00Z",
  },
];


export const buyerProfiles: BuyerProfile[] = [
  {
    buyer_profile_id: "bp-0001",
    user_id: "u-0007",
    full_name: "Tep Sopheaktra",
    date_of_birth: "May 15, 1990",
    place_of_birth: "Phnom Penh",
    business_type: "Distributor",
    business_name: "Angkor Foods Co., Ltd.",
    business_address: "St. 271, Phnom Penh",
    bakong_account_id: "angkorfoods@aclb",
    status: "ACTIVE",
    created_at: "2025-09-25T06:30:00Z",
    updated_at: "2026-05-11T12:00:00Z",
  },
  {
    buyer_profile_id: "bp-0002",
    user_id: "u-0008",
    full_name: "Chea Sokha",
    date_of_birth: "Apr 13, 1983",
    place_of_birth: "Phnom Penh",
    business_type: "Exporter",
    business_name: "Mekong Trading House",
    business_address: "Russian Blvd., Phnom Penh",
    bakong_account_id: "mekongth@aclb",
    status: "ACTIVE",
    created_at: "2025-10-30T07:45:00Z",
    updated_at: "2026-05-13T09:00:00Z",
  },
  {
    buyer_profile_id: "bp-0003",
    user_id: "u-0009",
    full_name: "Heng Bunly",
    date_of_birth: "Dec 12, 1978",
    place_of_birth: "Kandal",
    business_type: "Wholesaler",
    business_name: "Sokimex Agri Supply",
    business_address: "NR2, Kandal",
    bakong_account_id: "sokimex@aclb",
    status: "BANNED",
    created_at: "2025-08-18T03:00:00Z",
    updated_at: "2026-03-12T15:10:00Z",
  },
];

export const governmentProfiles: GovernmentProfile[] = [
  {
    government_profile_id: "gp-0001",
    user_id: "u-0002",
    ministry_name: "Ministry of Agriculture, Forestry and Fisheries",
    address: "#200, Preah Norodom Blvd, Phnom Penh",
    bakong_account_id: "moaff@nbc",
    created_at: "2025-09-12T08:00:00Z",
    updated_at: "2026-04-22T11:30:00Z",
  },
];

export const identityDocuments: IdentityDocument[] = [
  {
    identity_document_id: "id-0001",
    user_id: "u-0003",
    document_type: "ID_CARD",
    status: "APPROVED",
    file_name: "chanthy-idcard.jpg",
    created_at: "2025-10-05T03:00:00Z",
    updated_at: "2025-10-06T05:20:00Z",
  },
  {
    identity_document_id: "id-0002",
    user_id: "u-0004",
    document_type: "ID_CARD",
    status: "APPROVED",
    file_name: "dara-idcard.jpg",
    created_at: "2025-11-20T01:00:00Z",
    updated_at: "2025-11-21T02:10:00Z",
  },
  {
    identity_document_id: "id-0003",
    user_id: "u-0005",
    document_type: "PASSPORT",
    status: "APPROVED",
    file_name: "sreypov-passport.pdf",
    created_at: "2025-12-02T04:00:00Z",
    updated_at: "2025-12-03T07:00:00Z",
  },
  {
    identity_document_id: "id-0004",
    user_id: "u-0006",
    document_type: "ID_CARD",
    status: "REJECTED",
    rejection_reason: "Photo is blurry; please re-upload a clearer scan.",
    file_name: "vibol-idcard.jpg",
    created_at: "2026-01-09T08:00:00Z",
    updated_at: "2026-01-10T09:30:00Z",
  },
  {
    identity_document_id: "id-0005",
    user_id: "u-0010",
    document_type: "ID_CARD",
    status: "PENDING",
    file_name: "nary-idcard.jpg",
    created_at: "2026-05-08T02:00:00Z",
    updated_at: "2026-05-08T02:00:00Z",
  },
  {
    identity_document_id: "id-0006",
    user_id: "u-0007",
    document_type: "PASSPORT",
    status: "PENDING",
    file_name: "angkor-passport.pdf",
    created_at: "2026-05-10T05:30:00Z",
    updated_at: "2026-05-10T05:30:00Z",
  },
];


export const systemPolicies: SystemPolicy[] = [
  {
    policy_id: "pol-0001",
    title: "Terms of Service",
    content:
      "By using Kasephal, you agree to fair trading practices, accurate listings, and timely fulfillment of contracts...",
    status: "PUBLISHED",
    created_by: "u-0001",
    created_at: "2025-08-05T03:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
    published_at: "2025-08-10T03:00:00Z",
  },
  {
    policy_id: "pol-0002",
    title: "Privacy Policy",
    content:
      "Kasephal collects only the data required to operate the marketplace. Identity documents are reviewed by admins and stored encrypted...",
    status: "PUBLISHED",
    created_by: "u-0001",
    created_at: "2025-08-05T03:05:00Z",
    updated_at: "2026-02-02T10:30:00Z",
    published_at: "2025-08-10T03:05:00Z",
  },
  {
    policy_id: "pol-0003",
    title: "Escrow & Refund Policy",
    content:
      "Funds are locked when an order is confirmed. Release occurs after both farmer and buyer confirm delivery. Refunds require admin review of evidence...",
    status: "PUBLISHED",
    created_by: "u-0001",
    created_at: "2025-09-01T03:00:00Z",
    updated_at: "2026-03-18T08:00:00Z",
    published_at: "2025-09-03T03:00:00Z",
  },
  {
    policy_id: "pol-0004",
    title: "Community Guidelines (2026 update)",
    content:
      "Updated guidelines on chat etiquette, prohibited products, and dispute escalation...",
    status: "DRAFT",
    created_by: "u-0001",
    created_at: "2026-04-22T03:00:00Z",
    updated_at: "2026-05-10T07:00:00Z",
  },
];

export const reportIssues: ReportIssue[] = [
  {
    report_issue_id: "rep-0001",
    title: "Buyer never paid deposit",
    description:
      "Buyer agreed to a 200kg rice contract but ignored deposit deadline. Requesting cancellation.",
    issue_type: "CONTRACT",
    status: "PENDING",
    order_id: "ord-1001",
    reporter_id: "u-0003",
    reported_user_id: "u-0009",
    attachments: [
      {
        report_attachment_id: "ratt-0001",
        report_issue_id: "rep-0001",
        image_url: "https://mllevut1po0y.i.optimole.com/w:1024/h:539/q:mauto/f:best/https://spatz.ai/wp-content/uploads/2025/05/demo8-2.jpg",
      },
    ],
    created_at: "2026-05-12T02:30:00Z",
  },
  {
    report_issue_id: "rep-0002",
    title: "Delivery quantity short by 30kg",
    description:
      "Received 170kg instead of 200kg. Photos and weight log attached.",
    issue_type: "DELIVERY",
    status: "WAITING_PROOF",
    order_id: "ord-1002",
    reporter_id: "u-0007",
    reported_user_id: "u-0004",
    attachments: [
      {
        report_attachment_id: "ratt-0002",
        report_issue_id: "rep-0002",
        image_url: "https://www.simplyseed.co.uk/user/blog-images/Storing%20Seed%20Potatoes%20After%20Delivery.webp",
      },
      {
        report_attachment_id: "ratt-0003",
        report_issue_id: "rep-0002",
        image_url: "https://www.simplyseed.co.uk/user/blog-images/Storing%20Seed%20Potatoes%20After%20Delivery.webp",
      },
    ],
    created_at: "2026-05-09T07:15:00Z",
  },
  {
    report_issue_id: "rep-0003",
    title: "Escrow not released after confirmed delivery",
    description: "Both parties confirmed but funds still locked after 48h.",
    issue_type: "ESCROW",
    status: "APPROVED",
    order_id: "ord-1003",
    reporter_id: "u-0005",
    reported_user_id: "u-0008",
    attachments: [],
    created_at: "2026-05-05T09:00:00Z",
  },
  {
    report_issue_id: "rep-0004",
    title: "Offensive language in chat",
    description: "User sent threatening messages in the order chat room.",
    issue_type: "VIOLATION_TERMS",
    status: "REJECTED",
    reporter_id: "u-0010",
    reported_user_id: "u-0009",
    attachments: [
      
    ],
    created_at: "2026-04-28T05:40:00Z",
  },
  {
    report_issue_id: "rep-0005",
    title: "Other - app shows wrong unit",
    description: "UI displays KG but contract was in TON.",
    issue_type: "OTHER",
    status: "PENDING",
    reporter_id: "u-0007",
    reported_user_id: "u-0001",
    attachments: [],
    created_at: "2026-05-13T01:10:00Z",
  },
];


export const payments: Payment[] = [
  {
    payment_id: "pay-0001",
    order_id: "ord-1001",
    paid_by: "u-0007",
    amount: 1200,
    currency_code: "USD",
    qr_string: "00020101021229...KHQR-1",
    md5: "8b1e5c9f2a3d4e6f7a8b9c0d1e2f3a4b",
    status: "PAID",
    paid_at: "2026-05-01T03:20:00Z",
    created_at: "2026-05-01T03:15:00Z",
    updated_at: "2026-05-01T03:20:00Z",
  },
  {
    payment_id: "pay-0002",
    order_id: "ord-1002",
    paid_by: "u-0008",
    amount: 3400,
    currency_code: "USD",
    qr_string: "00020101021229...KHQR-2",
    md5: "0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    status: "PAID",
    paid_at: "2026-05-04T06:00:00Z",
    created_at: "2026-05-04T05:55:00Z",
    updated_at: "2026-05-04T06:00:00Z",
  },
  {
    payment_id: "pay-0003",
    order_id: "ord-1003",
    paid_by: "u-0008",
    amount: 8500,
    currency_code: "USD",
    qr_string: "00020101021229...KHQR-3",
    md5: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
    status: "PAID",
    paid_at: "2026-05-02T09:00:00Z",
    created_at: "2026-05-02T08:55:00Z",
    updated_at: "2026-05-02T09:00:00Z",
  },
  {
    payment_id: "pay-0004",
    order_id: "ord-1004",
    paid_by: "u-0007",
    amount: 600,
    currency_code: "USD",
    qr_string: "00020101021229...KHQR-4",
    md5: "1f2e3d4c5b6a7988aabbccddeeff0011",
    status: "PENDING",
    created_at: "2026-05-13T02:00:00Z",
    updated_at: "2026-05-13T02:00:00Z",
  },
  {
    payment_id: "pay-0005",
    order_id: "ord-1005",
    paid_by: "u-0008",
    amount: 220,
    currency_code: "USD",
    qr_string: "00020101021229...KHQR-5",
    md5: "aabbccddeeff00112233445566778899",
    status: "FAILED",
    created_at: "2026-05-10T08:00:00Z",
    updated_at: "2026-05-10T08:10:00Z",
  },
];

export const escrowTransactions: EscrowTransaction[] = [
  {
    escrow_transaction_id: "esc-0001",
    transaction_type: "LOCKED",
    amount: 1200,
    currency_code: "USD",
    status: "APPROVED",
    payment_id: "pay-0001",
    order_id: "ord-1001",
    created_at: "2026-05-01T03:21:00Z",
  },
  {
    escrow_transaction_id: "esc-0002",
    transaction_type: "LOCKED",
    amount: 3400,
    currency_code: "USD",
    status: "APPROVED",
    payment_id: "pay-0002",
    order_id: "ord-1002",
    created_at: "2026-05-04T06:01:00Z",
  },
  {
    escrow_transaction_id: "esc-0003",
    transaction_type: "RELEASE",
    amount: 8500,
    currency_code: "USD",
    status: "APPROVED",
    payment_id: "pay-0003",
    order_id: "ord-1003",
    created_at: "2026-05-07T10:00:00Z",
  },
  {
    escrow_transaction_id: "esc-0004",
    transaction_type: "REFUND",
    amount: 220,
    currency_code: "USD",
    status: "PENDING",
    payment_id: "pay-0005",
    order_id: "ord-1005",
    payment_request_id: "preq-0002",
    created_at: "2026-05-11T09:00:00Z",
  },
  {
    escrow_transaction_id: "esc-0005",
    transaction_type: "LOCKED",
    amount: 600,
    currency_code: "USD",
    status: "PENDING",
    payment_id: "pay-0004",
    order_id: "ord-1004",
    created_at: "2026-05-13T02:01:00Z",
  },
];


export const paymentRequests: PaymentRequest[] = [
  {
    payment_request_id: "preq-0001",
    requested_by: "u-0003",
    order_id: "ord-1003",
    request_type: "WITHDRAW",
    amount: 8500,
    reason: "Withdraw earnings from completed rice order to Bakong account.",
    status: "APPROVED",
    created_at: "2026-05-07T10:30:00Z",
    updated_at: "2026-05-08T03:15:00Z",
  },
  {
    payment_request_id: "preq-0002",
    requested_by: "u-0008",
    order_id: "ord-1005",
    request_type: "REFUND",
    amount: 220,
    reason: "Order cancelled because farmer failed to dispatch on agreed date.",
    status: "APPROVED",
    created_at: "2026-05-11T08:45:00Z",
    updated_at: "2026-05-12T01:00:00Z",
  },
  {
    payment_request_id: "preq-0004",
    requested_by: "u-0004",
    order_id: "ord-1002",
    request_type: "REFUND",
    amount: 150,
    reason: "Buyer over-deducted for short delivery; disputing 30kg shortage claim.",
    status: "REJECTED",
    created_at: "2026-05-09T10:00:00Z",
    updated_at: "2026-05-10T06:00:00Z",
  },
  {
    "payment_request_id": "preq-0005",
    "requested_by": "u-0004",
    "order_id": "ord-1004",
    "request_type": "WITHDRAW",
    "amount": 4200,
    "reason": "Withdrawal of remaining balance from sweet corn harvest payout.",
    "status": "APPROVED",
    "created_at": "2026-05-10T08:15:00Z",
    "updated_at": "2026-05-11T02:30:00Z"
  },
  {
    "payment_request_id": "preq-0006",
    "requested_by": "u-0005",
    "order_id": "ord-1005",
    "request_type": "REFUND",
    "amount": 320,
    "reason": "Disputing weight deduction; moisture meter calibration error at buyer warehouse.",
    "status": "PENDING",
    "created_at": "2026-05-12T14:22:00Z",
    "updated_at": "2026-05-12T14:22:00Z"
  },
  {
    "payment_request_id": "preq-0007",
    "requested_by": "u-0006",
    "order_id": "ord-1006",
    "request_type": "WITHDRAW",
    "amount": 12500,
    "reason": "Bulk payout withdrawal for seasonal organic fertilizer advance purchase.",
    "status": "APPROVED",
    "created_at": "2026-05-13T09:00:00Z",
    "updated_at": "2026-05-14T04:10:00Z"
  },
  {
    "payment_request_id": "preq-0008",
    "requested_by": "u-0007",
    "order_id": "ord-1007",
    "request_type": "REFUND",
    "amount": 550,
    "reason": "Requesting compensation for logistics delay causing partial crop spoilage.",
    "status": "REJECTED",
    "created_at": "2026-05-15T11:45:00Z",
    "updated_at": "2026-05-16T16:20:00Z"
  },
  {
    "payment_request_id": "preq-0009",
    "requested_by": "u-0008",
    "order_id": "ord-1008",
    "request_type": "WITHDRAW",
    "amount": 6100,
    "reason": "Standard withdrawal of earnings to personal Wing wallet.",
    "status": "PENDING",
    "created_at": "2026-05-17T07:30:00Z",
    "updated_at": "2026-05-17T07:30:00Z"
  },
  {
    "payment_request_id": "preq-0010",
    "requested_by": "u-0009",
    "order_id": "ord-1009",
    "request_type": "REFUND",
    "amount": 180,
    "reason": "Buyer platform service fee double-charged on invoice transaction.",
    "status": "APPROVED",
    "created_at": "2026-05-19T13:10:00Z",
    "updated_at": "2026-05-20T08:45:00Z"
  },
  {
    "payment_request_id": "preq-0011",
    "requested_by": "u-0010",
    "order_id": "ord-1010",
    "request_type": "WITHDRAW",
    "amount": 9300,
    "reason": "Withdraw earnings from premium grade Jasmine rice export delivery.",
    "status": "APPROVED",
    "created_at": "2026-05-21T10:00:00Z",
    "updated_at": "2026-05-22T02:00:00Z"
  },
  {
    "payment_request_id": "preq-0012",
    "requested_by": "u-0004",
    "order_id": "ord-1011",
    "request_type": "REFUND",
    "amount": 890,
    "reason": "Claiming refund for unreturned empty plastic crates/pallets by logistics team.",
    "status": "REJECTED",
    "created_at": "2026-05-23T15:40:00Z",
    "updated_at": "2026-05-24T11:15:00Z"
  },
  {
    "payment_request_id": "preq-0013",
    "requested_by": "u-0005",
    "order_id": "ord-1012",
    "request_type": "WITHDRAW",
    "amount": 2700,
    "reason": "Partial withdrawal to cover immediate tractor maintenance costs.",
    "status": "PENDING",
    "created_at": "2026-05-25T06:50:00Z",
    "updated_at": "2026-05-25T06:50:00Z"
  },
  {
    "payment_request_id": "preq-0014",
    "requested_by": "u-0006",
    "order_id": "ord-1013",
    "request_type": "REFUND",
    "amount": 420,
    "reason": "Disputing excessive quality-drop markdown on cassava consignment.",
    "status": "PENDING",
    "created_at": "2026-05-26T12:18:00Z",
    "updated_at": "2026-05-26T12:18:00Z"
  }
  
];

export const dashboardStats: DashboardStats = {
  total_users: adminUsers.length,
  total_farmers: adminUsers.filter((u) => u.role === "FARMER").length,
  total_buyers: adminUsers.filter((u) => u.role === "BUYER").length,
  total_government: adminUsers.filter((u) => u.role === "GOVERNMENT").length,
  active_users: adminUsers.filter((u) => u.status === "ACTIVE").length,
  suspended_users: adminUsers.filter(
    (u) => u.status === "SUSPENDED" || u.status === "BANNED",
  ).length,
  pending_identity_documents: identityDocuments.filter(
    (d) => d.status === "PENDING",
  ).length,
  pending_reports: reportIssues.filter(
    (r) => r.status === "PENDING" || r.status === "WAITING_PROOF",
  ).length,
  pending_payment_requests: paymentRequests.filter(
    (p) => p.status === "PENDING" 
  ).length,
  escrow_locked_amount_usd: escrowTransactions
    .filter((t) => t.transaction_type === "LOCKED" && t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0),
  escrow_released_amount_usd: escrowTransactions
    .filter((t) => t.transaction_type === "RELEASE" && t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0),
  total_orders_this_month: 42,
  total_revenue_usd_this_month: 18750,
};

export const monthlyMetrics: MonthlyMetric[] = [
  { month: "2025-12", new_users: 18, orders: 22, revenue_usd: 9800 },
  { month: "2026-01", new_users: 24, orders: 29, revenue_usd: 12400 },
  { month: "2026-02", new_users: 31, orders: 35, revenue_usd: 14600 },
  { month: "2026-03", new_users: 27, orders: 40, revenue_usd: 16100 },
  { month: "2026-04", new_users: 33, orders: 38, revenue_usd: 15900 },
  { month: "2026-05", new_users: 19, orders: 42, revenue_usd: 18750 },
];
