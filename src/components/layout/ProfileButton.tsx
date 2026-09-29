"use client";

import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { UserRole } from "@/types/user-role";

const FALLBACK_PROFILE_IMAGE = "/assets/no-profile.jpg";

type ProfileButtonProps = {
  profileImage: string;
  role?: UserRole | null;
  profileOpen: boolean;
  onToggle: () => void;
};

export default function ProfileButton({
  profileImage,
  role,
  profileOpen,
  onToggle,
}: ProfileButtonProps) {
  const navbarStyle = {
    [UserRole.BUYER]: { border: "border-[#FBF6E9]" },
    [UserRole.FARMER]: { border: "border-[#F9C156]" },
    [UserRole.GOVERNMENT]: { border: "border-[#00F7FF]" },
    [UserRole.ADMIN]: { border: "border-[#00F7FF]" },
  };

  const currentStyle = role ? navbarStyle[role] : navbarStyle[UserRole.BUYER];
  const resolvedProfileImage = profileImage || FALLBACK_PROFILE_IMAGE;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="relative w-[50px] h-[50px] cursor-pointer"
      >
        <Image
          src={resolvedProfileImage}
          alt="Profile"
          fill
          className={`rounded-full border-2 ${currentStyle.border} object-cover`}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
          }}
        />
        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200">
          <ChevronDownIcon
            className={`w-2 h-2 text-gray-950 transition-transform ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
    </div>
  );
}
