import { CropDemandPost } from "@/types/crop-demand";

const baseCropDemand: CropDemandPost = {
  cropDemandPostId: "1",
  title: "High Demand for Jasmine Rice",
  cropName: "Jasmine Rice",
  cropType: "RICE CROPS",
  buyerName: "Golden Import Export",
  buyerProfileUrl: "buyer-profile-1",
  quantityNeeded: 200,
  unitType: "TONS",
  maxPricePerUnit: 2400,
  currencyCode: "USD",
  locationPreferences: "Battambang, Cambodia",
  expectedDeliveryDate: "2026-05-20T00:00:00Z",
  demandLevel: "LOW",
  status: "MATCHED",
  createdAt: "2026-05-10T09:00:00Z",
  isOffered: false,
  imageUrls: ["/image-demand/product1.jpg"],
  description: "Looking for high-quality premium Jasmine Rice from reliable farming communities.",
  isSaved: false,
};

export const cropDemands: CropDemandPost[] = Array.from(
  { length: 35 }, // Generated 35 rows to test pagination across pages 1, 2, and 3
  (_, index) => {
    const id = String(index + 1);
    
    // Cycle variations to provide realistic mock distributions for filtering
    const cycle = index % 3; 

    let cropName = "Jasmine Rice";
    let cropType = "RICE CROPS";
    let location = "Battambang, Cambodia";
    let price = 2400;
    let unitType: "TONS" | "KG" = "KG";
    let demandLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
    let status: "OPEN" | "CLOSED" | "MATCHED" = "MATCHED";
    let imageUrl = "/image-demand/product1.jpg";

    if (cycle === 1) {
      cropName = "Pailin Longan";
      cropType = "FRUIT CROP";
      location = "Pursat, Cambodia";
      price = 3500;
      unitType = "TONS";
      demandLevel = "HIGH";
      status = "OPEN";
      imageUrl = "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=150&q=80";
    } else if (cycle === 2) {
      cropName = "Organic Broccoli";
      cropType = "VEGETABLES";
      location = "Siem Reap, Cambodia";
      price = 1200;
      unitType = "TONS";
      demandLevel = "MODERATE";
      status = "CLOSED";
      imageUrl = "https://images.unsplash.com/photo-1515252531985-762326e66173?auto=format&fit=crop&w=150&q=80";
    }

    // Explicit overrides to make specific rows stand out (like your snapshot layout)
    if (index === 0) {
      status = "MATCHED";
      demandLevel = "LOW";
    }

    return {
      ...baseCropDemand,
      cropDemandPostId: id,
      title: `Urgent Requirement for ${cropName}`,
      cropName,
      cropType,
      locationPreferences: location,
      maxPricePerUnit: price,
      unitType,
      demandLevel,
      status,
      imageUrls: [imageUrl],
      expectedDeliveryDate: `2026-05-${20 + (index % 10)}T00:00:00Z`,
    };
  }
);