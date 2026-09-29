import {
  Bell,
  CreditCard,
  FileCheck2,
  FileText,
  HandCoins,
  type LucideIcon,
  MessageCircle,
  Megaphone,
  Package,
  ShieldCheck,
  Sprout,
  Star,
  Truck,
  UserPlus,
} from "lucide-react";

const notificationReferenceIcons: Record<string, LucideIcon> = {
  CHAT_ROOM: MessageCircle,
  CONTRACT: FileCheck2,
  OFFER: HandCoins,
  CROP_PRODUCT: Package,
  CROP_DEMAND: Sprout,
  FOLLOWER: UserPlus,
  POLICY: FileText,
  SYSTEM: Megaphone,
  IDENTITY_VERIFICATION: ShieldCheck,
  PAYMENT: CreditCard,
  DELIVERY: Truck,
  REVIEW: Star,
  REPORT: FileText,
};

export function getNotificationReferenceIcon(
  referenceType?: string | null,
): LucideIcon {
  if (!referenceType) return Bell;
  return notificationReferenceIcons[referenceType.toUpperCase()] ?? Bell;
}
