"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ContractLockedNotice from "./ContractLockedNotice";
import RequestChangePopup from "./RequestChangePopup";
import TermsConditionPopup from "./TermsConditionPopup";
import ConfirmActionDialog from "@/app/(admin-dashboard)/request-payment-management/_components/ConfirmActionDialogComponent";

import type {
  ContractDetail,
  ContractStatus as ApiContractStatus,
} from "@/services/contract.service";
import { updateContractStatusService } from "@/action/contract.action";
import { sendChatMessageAction } from "@/app/chat/_actions/sendChatMessageAction";
import { showApiToast } from "@/lib/apiToast";

import { CheckCircleIcon } from "@heroicons/react/24/solid";

import {
  XCircleIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

type ContractStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "REVISION_REQUESTED"
  | "REJECTED"
  | "FINALIZED";

type ViewerRole = "FARMER" | "BUYER";

type Props = {
  contract?: ContractDetail;
  viewerRole?: ViewerRole;
};

// Maps the backend contract status onto this screen's review lifecycle.
function mapApiStatus(status?: ApiContractStatus): ContractStatus {
  switch (status) {
    case "REQUEST_CHANGE":
      return "REVISION_REQUESTED";
    case "REJECTED":
      return "REJECTED";
    case "ACCEPTED":
    case "LOCKED":
    case "COMPLETED":
      return "FINALIZED";
    case "PENDING":
    default:
      return "PENDING_REVIEW";
  }
}

export default function FarmerReviewContract({
  contract,
  viewerRole = "FARMER",
}: Props) {
  const router = useRouter();

  const isBuyerView = viewerRole === "BUYER";

  const [status, setStatus] = useState<ContractStatus>(
    mapApiStatus(contract?.status)
  );
  const [requestOpen, setRequestOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isFinalized = status === "FINALIZED";
  const canReviewContract = !isBuyerView && status === "PENDING_REVIEW";
  const canBuyerEdit = isBuyerView && status === "REVISION_REQUESTED";
  const sidePanelTitle = canReviewContract ? "Review Action" : "Contract Status";
  const sidePanelDescription = canReviewContract
    ? "Choose an action after checking the contract details carefully."
    : isFinalized
      ? "This contract has been accepted and locked. No further review action is available."
      : status === "REVISION_REQUESTED"
        ? isBuyerView
          ? "The farmer requested a change. Review the note and edit the contract if needed."
          : "Your change request has been sent to the buyer. Waiting for the updated contract."
        : status === "REJECTED"
          ? "This contract was rejected and cannot be reviewed further."
          : "Track this contract's progress.";
  const lifecycleItems = getLifecycleItems(status);

  // Return to the exact chat room this contract was opened from. Falls back to
  // browser-back when there is no contract context.
  // router.refresh() busts the client Router Cache so the chat re-fetches and
  // shows the status card we just sent — without it, the acting farmer only
  // sees the card after a manual refresh (the buyer gets it live via socket).
  const handleBackToChat = () => {
    if (contract?.chatRoomId) {
      router.push(`/chat?chatRoomId=${contract.chatRoomId}`);
      router.refresh();
      return;
    }

    router.back();
  };

  // Runs a farmer review action against the API. When there is no real contract
  // (the standalone mock view) it just updates local state so the screen demos.
  const runAction = async (
    action: "ACCEPT" | "REJECT" | "REQUEST_CHANGE",
    nextStatus: ContractStatus,
    requestChangeMessage?: string
  ) => {
    if (!contract) {
      setStatus(nextStatus);
      return true;
    }

    setSubmitting(true);

    const result = await updateContractStatusService(
      contract.contractId,
      action,
      requestChangeMessage
    );

    setSubmitting(false);

    if (!result.success) {
      showApiToast(
        { success: false, error: result.message },
        {
          successTitle: "Contract updated",
          errorTitle: "Action failed",
          errorMessage: result.message ?? "Could not update the contract.",
        }
      );
      return false;
    }

    if (action === "ACCEPT") {
      await sendContractAcceptedMessage(contract);
    }

    if (action === "REJECT") {
      await sendContractRejectedMessage(contract);
    }

    setStatus(nextStatus);
    return true;
  };

  const handleAccept = async () => {
    const ok = await runAction("ACCEPT", "FINALIZED");
    if (ok) {
      setAcceptConfirmOpen(false);
      showApiToast(
        { success: true },
        {
          successTitle: "Contract accepted",
          successMessage:
            "The contract is finalized. Continue from the chat for the next step.",
        }
      );
      handleBackToChat();
    }
  };

  const handleReject = async () => {
    const ok = await runAction("REJECT", "REJECTED");
    if (ok) {
      showApiToast(
        { success: true },
        {
          successTitle: "Contract rejected",
          successMessage: "The buyer has been notified in the chat.",
        }
      );
      handleBackToChat();
    }
  };

  const handleSubmitChange = async (data: {
    suggestedPrice: string;
    comment: string;
  }) => {
    const ok = await runAction(
      "REQUEST_CHANGE",
      "REVISION_REQUESTED",
      data.comment
    );

    if (ok) {
      if (contract) {
        await sendContractChangeRequestedMessage(contract, {
          title: data.suggestedPrice,
          note: data.comment,
        });
      }

      setRequestOpen(false);
      showApiToast(
        { success: true },
        {
          successTitle: "Change requested",
          successMessage: "Your requested changes were sent to the buyer.",
        }
      );
      handleBackToChat();
    }
  };

  // Buyer can re-open the contract for editing only after a change was requested.
  const handleEditContract = () => {
    if (!contract) return;

    router.push(
      `/digital-contract/create?chatRoomId=${contract.chatRoomId}&postId=${contract.postId ?? ""}&contractId=${contract.contractId}`
    );
  };

  // No contract for this chat yet — show an empty state, never fake data.
  if (!contract) {
    return (
      <div className="py-5">
        <div className="mx-auto max-w-140 rounded-3xl border border-light-grey bg-white p-10 text-center shadow-sm">
          <h1 className="text-[24px] font-bold text-primary-heading">
            No contract created yet
          </h1>

          <p className="mt-3 text-[16px] leading-relaxed text-description-text">
            {isBuyerView
              ? "No contract has been created for this chat yet. You can create one from the chat."
              : "The buyer has not created a contract for this chat yet. Once it is sent, you can review it here."}
          </p>
        </div>
      </div>
    );
  }

  // From here on the contract is guaranteed to exist — render only real data.
  const buyerName = contract.buyerName;
  const farmerName = contract.farmerName;
  const cropType = contract.crop?.category ?? "—";
  const cropName = contract.crop?.cropName ?? contract.postTitle ?? "—";
  const unitType = contract.unitType;
  // Money is shown in the currency the buyer chose when creating the contract.
  const money = (value: number) => formatMoney(value, contract.currencyCode);
  const totalQuantity = `${formatNumber(contract.totalQuantity)} ${unitType}`;
  const pricePerUnit = `${money(contract.pricePerUnit)} / ${unitType}`;
  const totalPrice = money(contract.totalPrice);
  const deposit = money(contract.depositAmount);
  const remaining = money(contract.remainingAmount);
  const deliveryDate = formatDate(contract.deliveryDate);
  const duration = durationLabel(contract.startDate, contract.endDate);

  return (
    <div className="py-5">
      {/* Contract Locked Notice - Shows ONLY when accepted/finalized */}
      {isFinalized && (
        <div className="mb-4">
          <ContractLockedNotice
            finalizedBy={farmerName}
            finalizedDate={formatDate(contract.updatedAt ?? contract.createdAt)}
          />

          {/* Optional: Add a simple back button here so they can leave the empty screen */}
          <button
            type="button"
            onClick={handleBackToChat}
            className="mt-6 flex h-13 w-50 items-center justify-center gap-2 rounded-xl border border-light-grey bg-white text-[18px] font-medium text-primary-heading transition hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Chat
          </button>
        </div>
      )}

      {/* Contract details stay visible even after the contract is finalized. */}
      {(
        <>
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-primary">
                {canReviewContract ? "Farmer Contract Review" : "Contract Details"}
              </p>

              <h1 className="mt-2 text-[34px] font-black text-primary-heading">
                {canReviewContract ? "Review Digital Contract" : "Digital Contract"}
              </h1>

              <p className="mt-2 text-[18px] text-description-text">
                {canReviewContract
                  ? "Please review all contract details before accepting, requesting changes, or rejecting."
                  : isFinalized
                    ? "This finalized contract is read-only, but the full agreement remains available here."
                    : "View the full details and current status of this contract."}
              </p>
            </div>

            <StatusBadge status={status} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <section className="rounded-3xl border border-light-grey bg-white p-6 shadow-sm">
              <div className="rounded-2xl bg-[#FFF4CF] p-5">
                <p className="text-[18px] font-medium text-primary-heading">
                  {isFinalized
                    ? "This contract is locked. All agreed quantities, payment terms, dates, and conditions are read-only."
                    : isBuyerView
                      ? "You sent this contract to the farmer. You can edit it only after the farmer requests a change."
                      : "This contract was sent by the buyer/government for your review. You cannot edit the contract directly."}
                </p>
              </div>

              <div className="mt-6">
                <h2 className="border-b border-light-grey pb-4 text-[22px] font-medium text-primary-heading">
                  Contract Information
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <DetailItem
                    label="Buyer / Government"
                    value={buyerName}
                  />

                  <DetailItem label="Farmer" value={farmerName} />

                  <DetailItem label="Crop Type" value={cropType} />

                  <DetailItem label="Crop Name" value={cropName} />

                  <DetailItem label="Unit Type" value={unitType} />

                  <DetailItem label="Total Quantity" value={totalQuantity} />

                  <DetailItem label="Price Per Unit" value={pricePerUnit} />

                  <DetailItem label="Total Price" value={totalPrice} />

                  <DetailItem label="Total Payment / Deposit" value={deposit} />

                  <DetailItem label="Remaining Balance" value={remaining} />

                  <DetailItem label="Delivery Date" value={deliveryDate} />

                  <DetailItem label="Duration of Contract" value={duration} />
                </div>
              </div>

              <div className="mt-8 border-t border-light-grey pt-6">
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="text-[18px] font-semibold text-red-600 underline underline-offset-4 transition hover:text-red-700"
                >
                  Terms &amp; Conditions
                </button>

                <p className="mt-2 text-[14px] font-medium text-description-text">
                  Click to read the full terms and conditions of this contract.
                </p>
              </div>
            </section>

            {/* RIGHT */}
            <aside className="h-fit rounded-3xl border border-light-grey bg-white p-6 shadow-sm">
              <h3 className="text-[16px] font-medium text-primary-heading">
                {sidePanelTitle}
              </h3>

              <p className="mt-2 text-[14px] font-medium leading-relaxed text-description-text">
                {sidePanelDescription}
              </p>

              {/* Life Cycle */}
              <div className="mt-6 space-y-4">
                {lifecycleItems.map((item) => (
                  <LifeCycleItem
                    key={item.title}
                    title={item.title}
                    state={item.state}
                  />
                ))}
              </div>

              {/* Revision Status Notice */}
              {status === "REVISION_REQUESTED" && (
                <div className="mt-6 rounded-2xl bg-yellow-50 p-4">
                  <p className="text-[14px] font-medium text-yellow-700">
                    {isBuyerView
                      ? "The farmer requested a change to this contract."
                      : "Revision request submitted successfully."}
                  </p>
                </div>
              )}

              {/* Finalized Status Notice */}
              {isFinalized && (
                <div className="mt-6 rounded-2xl bg-primary/5 p-4">
                  <p className="text-[14px] font-medium text-primary">
                    Contract finalized. Review actions are closed.
                  </p>
                </div>
              )}

              {/* Rejected Status Notice */}
              {status === "REJECTED" && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4">
                  <p className="text-[14px] font-medium text-red-600">
                    {isBuyerView
                      ? "The farmer rejected this contract."
                      : "Contract rejected successfully."}
                  </p>
                </div>
              )}

              {/* FARMER: review actions. Hidden entirely for the buyer view. */}
              {canReviewContract && (
                <div className="mt-6 space-y-3">
                  {/* Accept Button */}
                  <button
                    type="button"
                    onClick={() => setAcceptConfirmOpen(true)}
                    disabled={submitting}
                    className="flex h-[62px] w-full items-center justify-center gap-3 rounded-2xl bg-primary text-[16px] font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                    Accept & Finalize Contract
                  </button>

                  {/* Request Button */}
                  <button
                    type="button"
                    onClick={() => setRequestOpen(true)}
                    disabled={submitting}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#FFF4CF] text-[18px] font-medium text-primary-heading transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                    Request Change
                  </button>

                  {/* Reject Button */}
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={submitting}
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-[18px] font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Reject Contract
                  </button>
                </div>
              )}

              {/* BUYER: read-only. Can edit only after a change was requested. */}
              {canBuyerEdit && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleEditContract}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[18px] font-medium text-white transition hover:opacity-90"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                    Edit Contract
                  </button>
                </div>
              )}

              {/* Info Banner */}
              <div className="mt-6 rounded-2xl bg-[#F8F8F8]">
                <p className="text-[13px] font-medium leading-relaxed text-description-text">
                  {isFinalized
                    ? "This contract is finalized and read-only. The details remain available for both parties."
                    : isBuyerView
                      ? "Once the farmer accepts, this contract becomes finalized and read-only."
                      : "After accepting, this contract becomes finalized and read-only."}
                </p>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* Popups */}
      <RequestChangePopup
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSubmit={handleSubmitChange}
      />

      <TermsConditionPopup
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
      />

      <ConfirmActionDialog
        open={acceptConfirmOpen}
        title="Confirm Contract"
        message="Please review all contract details carefully before confirming. Once accepted, this contract will be finalized, locked, and used for the next order step."
        confirmLabel={submitting ? "Confirming..." : "Yes, Confirm Contract"}
        cancelLabel="Review Again"
        onConfirm={() => {
          if (!submitting) void handleAccept();
        }}
        onCancel={() => {
          if (!submitting) setAcceptConfirmOpen(false);
        }}
      />
    </div>
  );
}

async function sendContractAcceptedMessage(contract: ContractDetail) {
  if (!contract.chatRoomId) return;

  const cropName =
    contract.crop?.cropName ?? contract.postTitle ?? "Crop Demand";

  await sendChatMessageAction({
    chatRoomId: contract.chatRoomId,
    content: [
      `CONTRACT_ORDER_READY:${contract.contractId}`,
      `crop:${cropName.replace(/\s+/g, " ").trim()}`,
      `farmer:${contract.farmerName.replace(/\s+/g, " ").trim()}`,
      `postId:${contract.postId ?? ""}`,
      `farmerId:${contract.farmerId}`,
      `chatRoomId:${contract.chatRoomId}`,
    ].join("\n"),
  });
}

async function sendContractChangeRequestedMessage(
  contract: ContractDetail,
  request: { title: string; note: string }
) {
  if (!contract.chatRoomId) return;

  const cropName =
    contract.crop?.cropName ?? contract.postTitle ?? "Crop Demand";
  const title = request.title.trim() || "Contract change requested";
  const note = request.note.trim() || "Please review the requested change.";

  await sendChatMessageAction({
    chatRoomId: contract.chatRoomId,
    content: [
      `CONTRACT_CHANGE_REQUESTED:${contract.contractId}`,
      `crop:${encodeURIComponent(cropName.replace(/\s+/g, " ").trim())}`,
      `farmer:${encodeURIComponent(contract.farmerName.replace(/\s+/g, " ").trim())}`,
      `title:${encodeURIComponent(title)}`,
      `note:${encodeURIComponent(note)}`,
      `postId:${encodeURIComponent(contract.postId ?? "")}`,
      `farmerId:${encodeURIComponent(contract.farmerId)}`,
      `chatRoomId:${encodeURIComponent(contract.chatRoomId)}`,
    ].join("\n"),
  });
}

async function sendContractRejectedMessage(contract: ContractDetail) {
  if (!contract.chatRoomId) return;

  const cropName =
    contract.crop?.cropName ?? contract.postTitle ?? "Crop Demand";
  const note = contract.requestChangeMessage?.trim() || "The farmer rejected this contract.";

  await sendChatMessageAction({
    chatRoomId: contract.chatRoomId,
    content: [
      `CONTRACT_REJECTED:${contract.contractId}`,
      `crop:${encodeURIComponent(cropName.replace(/\s+/g, " ").trim())}`,
      `farmer:${encodeURIComponent(contract.farmerName.replace(/\s+/g, " ").trim())}`,
      `note:${encodeURIComponent(note)}`,
      `postId:${encodeURIComponent(contract.postId ?? "")}`,
      `farmerId:${encodeURIComponent(contract.farmerId)}`,
      `chatRoomId:${encodeURIComponent(contract.chatRoomId)}`,
    ].join("\n"),
  });
}

function formatMoney(value: number, currencyCode?: string) {
  // Khmer riel uses the ៛ symbol; everything else falls back to "$".
  const symbol = currencyCode === "KHR" ? "៛" : "$";
  return `${symbol}${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function durationLabel(startIso?: string | null, endIso?: string | null) {
  if (!startIso || !endIso) return "—";

  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  const days = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  return `${days} Days`;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-light-grey bg-[#FAFAF7] p-4">
      <p className="text-[16px] font-medium text-description-text">{label}</p>

      <p className="mt-2 text-[18px] font-medium text-primary-heading">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: ContractStatus }) {
  return (
    <div className="rounded-full bg-[#FFF4CF] px-5 py-3 text-[18px] font-medium text-primary-heading">
      {status.replaceAll("_", " ")}
    </div>
  );
}

type LifeCycleState = "completed" | "current" | "pending" | "failed";

function getLifecycleItems(status: ContractStatus): Array<{
  title: string;
  state: LifeCycleState;
}> {
  if (status === "FINALIZED") {
    return [
      { title: "Draft", state: "completed" },
      { title: "Pending Review", state: "completed" },
      { title: "Finalized", state: "current" },
    ];
  }

  if (status === "REJECTED") {
    return [
      { title: "Draft", state: "completed" },
      { title: "Pending Review", state: "completed" },
      { title: "Rejected", state: "failed" },
    ];
  }

  if (status === "REVISION_REQUESTED") {
    return [
      { title: "Draft", state: "completed" },
      { title: "Pending Review", state: "completed" },
      { title: "Revision Requested", state: "current" },
      { title: "Updated Contract", state: "pending" },
    ];
  }

  return [
    { title: "Draft", state: "completed" },
    { title: "Pending Review", state: "current" },
    { title: "Finalized", state: "pending" },
  ];
}

function LifeCycleItem({
  title,
  state,
}: {
  title: string;
  state: LifeCycleState;
}) {
  const dotClass =
    state === "failed"
      ? "bg-red-500"
      : state === "pending"
        ? "bg-light-grey"
        : "bg-primary";
  const textClass =
    state === "pending" ? "text-description-text" : "text-primary-heading";
  const suffix =
    state === "completed"
      ? "Done"
      : state === "current"
        ? "Current"
        : state === "failed"
          ? "Closed"
          : "Pending";

  return (
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 rounded-full ${dotClass}`} />

      <div className="min-w-0">
        <p className={`text-[18px] font-medium ${textClass}`}>{title}</p>
        <p className="mt-0.5 text-[12px] font-medium text-description-text">
          {suffix}
        </p>
      </div>
    </div>
  );
}

