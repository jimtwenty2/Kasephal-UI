export type Role = "farmer" | "buyer";
export type RegisterStep = 1 | 2 | 3 | 4 | 5;

export const registerMock = {
  farmer: {
    roleTitle: "Farmer",
    steps: [
      "Account Creation",
      "OTP Verification",
      "Personal Information",
      "Identity Verification",
      "Completed"
    ],
    stepUi: {
      1: {
        sidebarTitle: "Sell Your Harvest",
        sidebarDescription:
          "Access the digital market to negotiate fair prices and secure steady buyers.",
        sidebarImage: "/assets/farmer-register.png",
        formTitle: "Create your account",
        formDescription:
          "Fill in your details to set up your digital marketplace.",
      },
      2: {
        sidebarTitle: "Verify Your Number",
        sidebarDescription:
          "Secure your farmer account with OTP verification.",
        sidebarImage: "/assets/farmer-register.png",
        formTitle: "OTP Verification",
        formDescription:
          "We’ve sent a secure 6-digit code to your registered number.",
      },
      3: {
        sidebarTitle: "Farm Information",
        sidebarDescription:
          "Tell buyers about your farm and crop production details.",
        sidebarImage: "/assets/farmer-register.png",
        formTitle: "Personal and Farm Information",
        formDescription:
          "Fill in your details to set up your digital marketplace.",
      },
      4: {
        sidebarTitle: "Secure Your Profile",
        sidebarDescription:
          "Verify your identity to build trust with buyers.",
        sidebarImage: "/assets/farmer-register.png",
        formTitle: "Identity Verification",
        formDescription:
          "Upload a valid government-issued document to secure your profile.",
      },
    },
  },

  buyer: {
    roleTitle: "Buyer",
    steps: [
      "Account Creation",
      "OTP Verification",
      "Business Information",
      "Identity Verification",
    ],
    stepUi: {
      1: {
        sidebarTitle: "Source Local Crops",
        sidebarDescription:
          "Connect directly with local farmers and secure quality agricultural products.",
        sidebarImage: "/assets/buyer-register.png",
        formTitle: "Create your account",
        formDescription:
          "Fill in your details to start buying agricultural products.",
      },
      2: {
        sidebarTitle: "Verify Your Number",
        sidebarDescription:
          "Secure your buyer account with OTP verification.",
        sidebarImage: "/assets/buyer-register.png",
        formTitle: "OTP Verification",
        formDescription:
          "We’ve sent a secure 6-digit code to your registered number.",
      },
      3: {
        sidebarTitle: "Business Information",
        sidebarDescription:
          "Tell farmers about your business and buying needs.",
        sidebarImage: "/assets/buyer-register.png",
        formTitle: "Personal and Business Information",
        formDescription:
          "Fill in your business details to set up your marketplace account.",
      },
      4: {
        sidebarTitle: "Secure Your Account",
        sidebarDescription:
          "Verify your identity to build trust with farmers.",
        sidebarImage: "/assets/buyer-register.png",
        formTitle: "Identity Verification",
        formDescription:
          "Upload a valid government-issued document to secure your profile.",
      },
    },
  },
};