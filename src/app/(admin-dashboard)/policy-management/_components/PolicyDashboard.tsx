"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, File } from "lucide-react";
import { Policy } from "@/types/admin/policy";
import {
  createPolicyService,
  updatePolicyService,
  publishPolicyService,
} from "@/services/admin/policy.service";
import TableSection from "../../_components/TableSection";
import PolicyFormModal from "./PolicyFormModal";

interface PolicyDashboardProps {
  initialPolicies: Policy[];
}

const TABS = [
  { id: "all", label: "All", icon: <LayoutGrid size={18} /> },
  { id: "published", label: "Published", icon: <File size={18} /> },
  { id: "draft", label: "Draft", icon: <File size={18} /> },
];

const ITEMS_PER_PAGE = 8;

export default function PolicyDashboard({
  initialPolicies,
}: PolicyDashboardProps) {
  const [policiesList, setPoliciesList] = useState<Policy[]>(
    Array.isArray(initialPolicies) ? initialPolicies : [],
  );
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(initialPolicies)) {
      setPoliciesList(initialPolicies);
    }
  }, [initialPolicies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const filteredPolicies = policiesList.filter((policy) => {
    const matchesTab =
      activeTab === "all" || policy.status.toLowerCase() === activeTab;
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (policy.content ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleCreateOpen = () => {
    setSelectedPolicy(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (id: string) => {
    const policy = policiesList.find((p) => p.policyId === id);
    if (policy) {
      setSelectedPolicy(policy);
      setError(null);
      setIsModalOpen(true);
    }
  };

  const handleSavePolicy = async (formData: {
    title: string;
    content: string;
    status: "DRAFT" | "PUBLISHED";
  }) => {
    setSaving(true);
    setError(null);
    try {
      if (selectedPolicy) {
        const updated = await updatePolicyService(
          selectedPolicy.policyId,
          formData,
        );
        if (updated) {
          setPoliciesList((prev) =>
            prev.map((p) =>
              p.policyId === selectedPolicy.policyId ? updated : p,
            ),
          );
          setIsModalOpen(false);
        } else {
          setError("Failed to update policy. Please try again.");
        }
      } else {
        const created = await createPolicyService({
          title: formData.title,
          content: formData.content,
        });
        if (created) {
          setPoliciesList((prev) => [created, ...prev]);
          setIsModalOpen(false);
        } else {
          setError("Failed to create policy. Please try again.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPolicy = async (id: string) => {
    const published = await publishPolicyService(id);
    if (published) {
      setPoliciesList((prev) =>
        prev.map((p) => (p.policyId === id ? published : p)),
      );
    } else {
      console.error("Publish failed for policy:", id);
    }
  };

  return (
    <>
      <TableSection
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        buttonLabel="Create New Policy"
        onButtonClick={handleCreateOpen}
        policies={paginatedPolicies}
        onViewDetail={(id) => console.log("Open detail modal:", id)}
        onReview={handleEditOpen}
        onPublish={handlePublishPolicy}
        currentPage={currentPage}
        totalItems={filteredPolicies.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <PolicyFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        onSave={handleSavePolicy}
        initialData={selectedPolicy}
        saving={saving}
        error={error}
      />
    </>
  );
}
