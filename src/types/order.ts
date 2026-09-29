export type UnitType = "KG" | "TONS" | "BAG";

export interface Order {
  orderId: string;
  quantity: number;
  unitType: UnitType;
  pricePerUnit: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  buyerId: string;
  farmerId: string;
  chatRoomId: string;

  // nested post data
  post?: {
    postId: string;
    postType: string;
    title: string;
    description: string;
    createdBy: string;
    images: string[];
    cropProduct?: {
      cropProductId: string;
      unitType: string;
      currencyCode: string;
      pricePerUnit: number;
      totalQuantity: number;
      stockLeft: number;
      status: string;
      crop: {
        cropId: string;
        cropName: string;
        cropTypeId: string;
        cropTypeName: string;
      };
    };
  };

  // optional fields
  postId?: string;
  contractId?: string;
  currencyCode?: string;
  buyerName?: string;
  buyerProfileUrl?: string | string[];
  farmerName?: string;
  farmerProfileUrl?: string | string[];

  // derived fields mapped in service
  cropName: string;
  cropType: string;
  imageUrls: string[];
}