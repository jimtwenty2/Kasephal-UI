import { CropProductPost } from "@/types/crop-product";

const baseCropProduct: CropProductPost = {
  cropProductPostId: "1",
  postId: "p1",
  cropId: "c1",
  unitType: "TON",
  currencyCode: "$",
  pricePerUnit: 500,
  totalQuantity: 2,
  stockLeft: 2,
  status: "AVAILABLE",
  title: "Fresh Durian",
  cropName: "Fresh Durian",
  cropType: "FRUIT CROPS",
  sellerName: "Green Farm Cambodia",
  sellerProfileUrl: "seller-profile-1",
  location: "North",
  imageUrls: ["/image-demand/product1.jpg"],
  createdAt: "2026-05-10T09:00:00Z",
  updatedAt: "2026-05-15T10:00:00Z",
};

export const cropProducts: CropProductPost[] = Array.from(
  { length: 18 },
  (_, index) => {
    const id = String(index + 1);

    const isDurian = index % 9 === 0;

    return {
      ...baseCropProduct,

      cropProductPostId: id,
      postId: `p${isDurian ? 1 : 2}`,
      cropId: `c${isDurian ? 1 : 2}`,

      title: isDurian ? "Fresh Durian" : "Organic Potato",
      cropName: isDurian ? "Fresh Durian" : "Organic Potato",

      cropType: isDurian ? "FRUIT CROPS" : "VEGETABLES",

      unitType: "TON",
      currencyCode: "$",

      pricePerUnit: isDurian ? 500 : 400,
      totalQuantity: isDurian ? 2 : 5,
      stockLeft: isDurian ? 2 : 3,

      status:
        index === 0
          ? "UNAVAILABLE"
          : "AVAILABLE",

      location: isDurian ? "North" : "South",

      imageUrls: isDurian
        ? ["/image-demand/product1.jpg"]
        : [
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=150&q=80",
          ],
    };
  }
);