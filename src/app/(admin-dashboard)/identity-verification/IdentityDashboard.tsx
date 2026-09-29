"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import SmallStatCard from "../_components/SmallStatCard";
import TableSection from "../_components/TableSection";
import IdentityVerificationPopup from "./IdentityModal";
import type { Tab } from "../../../types/adminType";
import {
  BadgeCheck,
  Clock,
  LayoutGrid,
  Store,
  Tractor,
  XCircle,
} from "lucide-react";
import {
  getVerificationStatsClientService,
  getIdentityVerificationsClientService,
  normalizeIdentityAddress,
  type IdentityVerification,
  type IdentityVerificationItem,
  type IdentityVerificationPagination,
  type VerificationStats,
} from "@/services/admin/identityVerification.service";

const ITEMS_PER_PAGE = 10;

function mapToVerification(
  item: IdentityVerificationItem,
): IdentityVerification {
  const address = normalizeIdentityAddress(item);

  return {
    user_id: item.userId,
    name: item.fullName,
    email: item.email,
    phoneNumber: item.phoneNumber,
    profile: item.profileUrl ?? null,
    document: item.identityDocumentId,
    documentType: item.documentType,
    role: item.role,
    status: item.status,
    submissionDate: item.submittedAt
      ? new Date(item.submittedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",
    ...(address && { address }),
  };
}

type Props = {
  initialItems: IdentityVerificationItem[];
  initialPagination: IdentityVerificationPagination | null;
  initialStats: VerificationStats;
};

export default function IdentityDashboard({
  initialItems,
  initialStats,
}: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] =
    useState<IdentityVerification | null>(null);

  // ── Now has a setter so the list can be refreshed ──────────────────────────
  const [allVerifications, setAllVerifications] = useState<
    IdentityVerification[]
  >(initialItems.map(mapToVerification));

  const [stats, setStats] = useState<VerificationStats>(initialStats);

  const tabs: Tab[] = [
    { id: "all", label: "All Users", icon: <LayoutGrid size={18} /> },
    { id: "farmer", label: "Farmers", icon: <Tractor size={18} /> },
    { id: "buyer", label: "Buyers", icon: <Store size={18} /> },
  ];

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrentPage(1);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, searchQuery]);

  // ── Single refresh function — fetches both stats and verifications ──────────
  const refreshData = useCallback(async () => {
    try {
      const [latestStats, latestResult] = await Promise.all([
        getVerificationStatsClientService(),
        getIdentityVerificationsClientService({ size: 9999 }), // fetch all for client-side pagination
      ]);
      setStats(latestStats);
      setAllVerifications(latestResult.items.map(mapToVerification));
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  }, []);

  // Step 1: filter by tab + search with null guards
  const filteredVerifications = useMemo(() => {
    return allVerifications.filter((v) => {
      const matchesTab =
        activeTab === "all" ||
        (v.role ?? "").toLowerCase() === activeTab.toLowerCase();

      const matchesSearch =
        (v.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.phoneNumber ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.document ?? "").toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, allVerifications]);

  // Step 2: slice for current page
  const paginatedVerifications = useMemo(() => {
    return filteredVerifications.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [filteredVerifications, currentPage]);

  const handleReviewClick = (userId: string) => {
    const found = allVerifications.find((v) => v.user_id === userId);
    if (!found) return;
    setSelectedVerification(found);
    setIsModalOpen(true);
  };

  // ── Now calls refreshData instead of only fetching stats ──────────────────
  const handleVerificationUpdated = async () => {
    setIsModalOpen(false);
    setSelectedVerification(null);
    await refreshData();
  };

  const statCards = [
    {
      id: "await",
      title: "Await Reviews",
      value: String(stats.awaitReviews),
      icon: <Clock size={20} />,
      iconBgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      id: "verified",
      title: "Total Verified",
      value: String(stats.totalVerified),
      icon: <BadgeCheck size={20} />,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "rejected",
      title: "Rejected Requests",
      value: String(stats.rejectedRequests),
      icon: <XCircle size={20} />,
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <SmallStatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBgColor={stat.iconBgColor}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      <TableSection
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlacement="right"
        verifications={paginatedVerifications}
        onViewDetail={handleReviewClick}
        onReview={handleReviewClick}
        currentPage={currentPage}
        totalItems={filteredVerifications.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {isModalOpen && selectedVerification && (
        <IdentityVerificationPopup
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedVerification(null);
          }}
          verificationData={selectedVerification}
          onUpdated={handleVerificationUpdated}
        />
      )}

    </>
  );
}
