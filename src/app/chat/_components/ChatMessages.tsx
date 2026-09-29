"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChatTranslationMode, Message, UserRole } from "../_types/chat";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatFileMessage from "./ChatFileMessage";
import OrderRequestCard, {
    parseOrderRequest,
    type OrderRequestData,
} from "./OrderRequestCard";
import { getAttachmentImageUrl } from "@/utils/getAttachmentUrl";
import { getOrderPaymentProgressAction } from "@/action/order.action";
import { sendChatMessageAction } from "../_actions/sendChatMessageAction";

type StaticCardTranslation = {
    en: string;
    kh: string;
};

type Props = {
    chatRoomId?: string;
    messages: Message[];
    typingUserName?: string | null;
    senderAvatar?: string | null;
    senderName?: string;
    senderProfileHref?: string;
    visibleMessageTimeId?: string | null;
    translationMode?: ChatTranslationMode;
    role?: UserRole;
    onVisibleMessageTimeChange?: (messageId: string | null) => void;
    onRetryMessage?: (message: Message) => void;
};

export default function ChatMessages({
    chatRoomId,
    messages,
    typingUserName,
    senderAvatar,
    senderName = "Sender",
    senderProfileHref,
    visibleMessageTimeId,
    translationMode = "original",
    role,
    onVisibleMessageTimeChange,
    onRetryMessage,
}: Props) {
    const confirmedPaymentRequestIds = useMemo(() => {
        const confirmedIds = new Set<string>();

        for (const message of messages) {
            const approvedRequest = parsePaymentRequestApproved(message.text ?? "");
            if (approvedRequest) confirmedIds.add(approvedRequest.requestId);
        }

        return confirmedIds;
    }, [messages]);
    const rejectedPaymentRequestIds = useMemo(() => {
        const rejectedIds = new Set<string>();

        for (const message of messages) {
            const rejectedRequest = parsePaymentRequestRejected(message.text ?? "");
            if (rejectedRequest) rejectedIds.add(rejectedRequest.requestId);
        }

        return rejectedIds;
    }, [messages]);
    const hasContractOrderCreated = useMemo(
        () =>
            messages.some((message) => {
                const order = parseOrderCreated(message.text ?? "");
                return order?.paymentPath === "/payment-demands";
            }),
        [messages],
    );

    const handleMessageToggle = (messageId: string) => {
        onVisibleMessageTimeChange?.(
            visibleMessageTimeId === messageId ? null : messageId
        );
    };

    return (
        <div className="px-2 py-6">
            <div className="space-y-5">
                {messages.map((message, index) => {
                    const isMe = message.sender === "me";
                    const showTime = visibleMessageTimeId === message.id;
                    const showSenderProfile =
                        !isMe && isLastMessageInTenMinuteSenderGroup(messages, index);
                    const avatarSrc = getSafeAvatar(
                        message.senderProfileUrl ?? senderAvatar
                    );
                    const shouldShowDate =
                        index === 0 ||
                        getMessageDayKey(messages[index - 1]?.createdAt) !==
                            getMessageDayKey(message.createdAt);

                    return (
                        <div key={message.id}>
                            {shouldShowDate && (
                                <div className="mb-5 flex justify-center">
                                    <span className="rounded-full border border-light-grey bg-white px-5 py-2 text-[12px] font-semibold text-secondary-body shadow-sm">
                                        {formatChatDate(message.createdAt)}
                                    </span>
                                </div>
                            )}

                            <div
                                className={`flex ${
                                    isMe ? "justify-end" : "justify-start"
                                }`}
                            >
                                {!isMe && (
                                    <div className="mr-2 flex w-8 shrink-0 justify-center">
                                        {showSenderProfile && (
                                            <SenderAvatar
                                                src={avatarSrc}
                                                name={senderName}
                                                href={senderProfileHref}
                                            />
                                        )}
                                    </div>
                                )}

                                <div
                                    className="max-w-[85%] cursor-pointer sm:max-w-105"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Show sent time for message sent at ${message.time}`}
                                    onClick={() => handleMessageToggle(message.id)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            handleMessageToggle(message.id);
                                        }
                                    }}
                                >
                                    {message.type === "text" && (() => {
                                        const actorName = getCardActorName(isMe, senderName);
                                        const createdOrderData = parseOrderCreated(message.text ?? "");
                                        if (createdOrderData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <OrderCreatedCard
                                                        data={createdOrderData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildOrderCreatedTranslationText(createdOrderData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const orderData = parseOrderRequest(message.text ?? "");
                                        if (orderData) {
                                            const viewerRole =
                                                role === "FARMER" ? "farmer"
                                                : role === "BUYER" ? "buyer"
                                                : "other";
                                            return (
                                                // Stop clicks from bubbling to the message-toggle wrapper
                                                // so Accept/Reject/Pay buttons work correctly.
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <OrderRequestCard
                                                        data={orderData}
                                                        viewerRole={viewerRole}
                                                        chatRoomId={chatRoomId}
                                                        forcedDecision={getOrderRequestDecision(
                                                            messages,
                                                            index,
                                                            orderData.orderId,
                                                        )}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildOrderRequestTranslationText(orderData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const acceptedOrderData = parseOrderAccepted(message.text ?? "");
                                        if (acceptedOrderData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <OrderAcceptedCard
                                                        data={acceptedOrderData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildOrderAcceptedTranslationText(acceptedOrderData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const contractOrderReadyData = parseContractOrderReady(message.text ?? "");
                                        if (contractOrderReadyData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <ContractOrderReadyCard
                                                        data={contractOrderReadyData}
                                                        viewerRole={viewerRole}
                                                        hasOrderCreated={hasContractOrderCreated}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildContractOrderReadyTranslationText(contractOrderReadyData, hasContractOrderCreated)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const rejectedOrderData = parseOrderRejected(message.text ?? "");
                                        if (rejectedOrderData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <OrderRejectedCard
                                                        data={rejectedOrderData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildOrderRejectedTranslationText(rejectedOrderData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const paymentCompletedData = parsePaymentCompleted(message.text ?? "");
                                        if (paymentCompletedData) {
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <PaymentCompletedCard
                                                        data={paymentCompletedData}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildPaymentCompletedTranslationText(paymentCompletedData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const paymentRequestData = parsePaymentRequest(message.text ?? "");
                                        if (paymentRequestData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <PaymentRequestCard
                                                        data={paymentRequestData}
                                                        viewerRole={viewerRole}
                                                        isAlreadyConfirmed={confirmedPaymentRequestIds.has(paymentRequestData.requestId)}
                                                        isAlreadyRejected={rejectedPaymentRequestIds.has(paymentRequestData.requestId)}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildPaymentRequestTranslationText(
                                                            paymentRequestData,
                                                            confirmedPaymentRequestIds.has(paymentRequestData.requestId),
                                                            rejectedPaymentRequestIds.has(paymentRequestData.requestId),
                                                        )}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const paymentApprovedData = parsePaymentRequestApproved(message.text ?? "");
                                        if (paymentApprovedData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <PaymentRequestApprovedCard
                                                        data={paymentApprovedData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildPaymentApprovedTranslationText(paymentApprovedData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const paymentRejectedData = parsePaymentRequestRejected(message.text ?? "");
                                        if (paymentRejectedData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <PaymentRequestRejectedCard
                                                        data={paymentRejectedData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildPaymentRejectedTranslationText(paymentRejectedData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const deliveryUpdateData = parseDeliveryUpdate(message.text ?? "");
                                        if (deliveryUpdateData) {
                                            const viewerRole =
                                                role === "BUYER" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <DeliveryUpdateCard
                                                        data={deliveryUpdateData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildDeliveryUpdateTranslationText(deliveryUpdateData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const linkedChat = parseLinkedChatNotice(message.text ?? "");
                                        if (linkedChat) {
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <LinkedChatNoticeCard data={linkedChat} />
                                                    <CardTranslationBlock
                                                        text={buildLinkedChatTranslationText(linkedChat)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const contractData = parseContractRequest(message.text ?? "");
                                        if (contractData) {
                                            const viewerRole =
                                                role === "BUYER" || role === "GOVERNMENT" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <ContractRequestCard data={contractData} viewerRole={viewerRole} />
                                                    <CardTranslationBlock
                                                        text={buildContractRequestTranslationText(contractData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const acceptedContractData = parseContractAccepted(message.text ?? "");
                                        if (acceptedContractData) {
                                            const viewerRole =
                                                role === "BUYER" || role === "GOVERNMENT" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <ContractAcceptedCard
                                                        data={acceptedContractData}
                                                        viewerRole={viewerRole}
                                                        hasOrderCreated={hasContractOrderCreated}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildContractAcceptedTranslationText(acceptedContractData, hasContractOrderCreated)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const contractChangeData = parseContractChangeRequested(message.text ?? "");
                                        if (contractChangeData) {
                                            const viewerRole =
                                                role === "BUYER" || role === "GOVERNMENT" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <ContractChangeRequestedCard
                                                        data={contractChangeData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildContractChangeTranslationText(contractChangeData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const rejectedContractData = parseContractRejected(message.text ?? "");
                                        if (rejectedContractData) {
                                            const viewerRole =
                                                role === "BUYER" || role === "GOVERNMENT" ? "buyer"
                                                : role === "FARMER" ? "farmer"
                                                : "other";
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <ContractRejectedCard
                                                        data={rejectedContractData}
                                                        viewerRole={viewerRole}
                                                        actorName={actorName}
                                                        chatRoomId={chatRoomId}
                                                    />
                                                    <CardTranslationBlock
                                                        text={buildContractRejectedTranslationText(rejectedContractData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        const demandData = parseDemandNegotiation(message.text ?? "");
                                        if (demandData) {
                                            return (
                                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} cursor-default`} onClick={(e) => e.stopPropagation()}>
                                                    <DemandNegotiationCard data={demandData} />
                                                    <CardTranslationBlock
                                                        text={buildDemandNegotiationTranslationText(demandData)}
                                                        translationMode={translationMode}
                                                    />
                                                </div>
                                            );
                                        }

                                        return (
                                            <ChatMessageBubble
                                                message={message}
                                                showTime={showTime}
                                                translationMode={translationMode}
                                                onRetry={onRetryMessage}
                                            />
                                        );
                                    })()}

                                    {message.type === "file" && (
                                        <ChatFileMessage
                                            message={message}
                                            showTime={showTime}
                                            onRetry={onRetryMessage}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {typingUserName && (
                    <div className="flex justify-start">
                        <div
                            className="flex flex-col items-start gap-1"
                            aria-label={`${typingUserName} is typing...`}
                        >
                            <div className="flex h-8 items-center gap-1">
                                <RiceTypingMark className="animate-bounce [animation-delay:-0.24s]" />
                                <RiceTypingMark className="animate-bounce [animation-delay:-0.12s]" />
                                <RiceTypingMark className="animate-bounce" />
                            </div>
                            <span className="animate-bounce pl-1 text-[12px] font-medium text-secondary-body [animation-delay:-0.06s]">
                                {typingUserName} is typing...
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

type LinkedChatNotice = {
    chatRoomId: string;
    chatType: string;
    title: string;
};

type OrderAccepted = {
    orderId: string;
    crop: string;
    qty: string;
    total: string;
    buyer: string;
    currency?: string;
    chatRoomId?: string;
    paymentPath?: string;
};

type OrderRejected = OrderAccepted;
type OrderCreated = OrderAccepted & {
    price: string;
    delivery?: string;
};

type PaymentCompleted = {
    orderId: string;
    crop: string;
    qty: string;
    amount: string;
    buyer: string;
    chatRoomId?: string;
};

type PaymentRequest = {
    requestId: string;
    orderId: string;
    crop: string;
    qty: string;
    amount: string;
    paidBefore?: number;
    buyer: string;
    currency?: string;
    chatRoomId?: string;
};

type PaymentRequestApproved = PaymentRequest;
type PaymentRequestRejected = PaymentRequest;

type DeliveryUpdate = {
    orderId: string;
    status: "IN_TRANSIT" | "CONFIRMED";
    crop: string;
    chatRoomId?: string;
};

type ContractRequest = {
    contractId: string;
    crop: string;
    farmer: string;
};

type ContractAccepted = ContractRequest & {
    postId: string;
    farmerId: string;
    chatRoomId: string;
};

type ContractOrderReady = ContractAccepted;

type ContractChangeRequested = ContractAccepted & {
    title: string;
    note: string;
};

type ContractRejected = ContractAccepted & {
    note: string;
};

type DemandNegotiation = {
    postId: string;
    title: string;
    quantity?: string;
};

function parseOrderAccepted(text: string): OrderAccepted | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("ORDER_ACCEPTED:")) return null;

    const orderId = firstLine.replace("ORDER_ACCEPTED:", "").trim();
    if (!orderId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        orderId,
        crop: fields.crop ?? "Crop",
        qty: fields.qty ?? "",
        total: fields.total ?? "",
        buyer: fields.buyer ?? "Buyer",
        currency: fields.currency ?? "",
        chatRoomId: fields.chatRoomId ?? "",
        paymentPath: fields.paymentPath ?? "",
    };
}

function parseOrderCreated(text: string): OrderCreated | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("ORDER_CREATED:")) return null;

    const orderId = firstLine.replace("ORDER_CREATED:", "").trim();
    if (!orderId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        orderId,
        crop: fields.crop ?? "Crop",
        qty: fields.qty ?? "",
        price: fields.price ?? "",
        total: fields.total ?? "",
        delivery: fields.delivery ?? "",
        buyer: fields.buyer ?? "Buyer",
        currency: fields.currency ?? "",
        chatRoomId: fields.chatRoomId ?? "",
        paymentPath: fields.paymentPath ?? "",
    };
}

function parseOrderRejected(text: string): OrderRejected | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("ORDER_REJECTED:")) return null;

    const orderId = firstLine.replace("ORDER_REJECTED:", "").trim();
    if (!orderId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        orderId,
        crop: fields.crop ?? "Crop",
        qty: fields.qty ?? "",
        total: fields.total ?? "",
        buyer: fields.buyer ?? "Buyer",
        currency: fields.currency ?? "",
        chatRoomId: fields.chatRoomId ?? "",
        paymentPath: fields.paymentPath ?? "",
    };
}

function getOrderRequestDecision(
    messages: Message[],
    requestIndex: number,
    orderId: string,
): "accepted" | "rejected" | null {
    for (const nextMessage of messages.slice(requestIndex + 1)) {
        const nextOrderRequest = parseOrderRequest(nextMessage.text ?? "");
        if (nextOrderRequest?.orderId === orderId) return null;

        const acceptedOrder = parseOrderAccepted(nextMessage.text ?? "");
        if (acceptedOrder?.orderId === orderId) return "accepted";

        const rejectedOrder = parseOrderRejected(nextMessage.text ?? "");
        if (rejectedOrder?.orderId === orderId) return "rejected";
    }

    return null;
}

function parsePaymentCompleted(text: string): PaymentCompleted | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("PAYMENT_COMPLETED:")) return null;

    const orderId = firstLine.replace("PAYMENT_COMPLETED:", "").trim();
    if (!orderId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        orderId,
        crop: fields.crop ?? "Crop",
        qty: fields.qty ?? "",
        amount: fields.amount ?? "",
        buyer: fields.buyer ?? "Buyer",
        chatRoomId: fields.chatRoomId ?? "",
    };
}

function parsePaymentRequest(text: string): PaymentRequest | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("PAYMENT_REQUEST:")) return null;

    const requestId = firstLine.replace("PAYMENT_REQUEST:", "").trim();
    if (!requestId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        requestId,
        orderId: fields.orderId ?? "",
        crop: fields.crop ?? "Crop",
        qty: fields.qty ?? "",
        amount: fields.amount ?? "",
        paidBefore: parseOptionalNumber(fields.paidBefore),
        buyer: fields.buyer ?? "Buyer",
        currency: fields.currency ?? "",
        chatRoomId: fields.chatRoomId ?? "",
    };
}

function parsePaymentRequestApproved(text: string): PaymentRequestApproved | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("PAYMENT_REQUEST_ACCEPTED:")) return null;

    const requestId = firstLine.replace("PAYMENT_REQUEST_ACCEPTED:", "").trim();
    if (!requestId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        requestId,
        orderId: fields.orderId ?? "",
        crop: fields.crop ?? "Crop",
        qty: fields.qty ?? "",
        amount: fields.amount ?? "",
        paidBefore: parseOptionalNumber(fields.paidBefore),
        buyer: fields.buyer ?? "Buyer",
        currency: fields.currency ?? "",
        chatRoomId: fields.chatRoomId ?? "",
    };
}

function parsePaymentRequestRejected(text: string): PaymentRequestRejected | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("PAYMENT_REQUEST_REJECTED:")) return null;

    const requestId = firstLine.replace("PAYMENT_REQUEST_REJECTED:", "").trim();
    if (!requestId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        requestId,
        orderId: fields.orderId ?? "",
        crop: fields.crop ?? "Crop",
        qty: fields.qty ?? "",
        amount: fields.amount ?? "",
        paidBefore: parseOptionalNumber(fields.paidBefore),
        buyer: fields.buyer ?? "Buyer",
        currency: fields.currency ?? "",
        chatRoomId: fields.chatRoomId ?? "",
    };
}

function parseDeliveryUpdate(text: string): DeliveryUpdate | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("DELIVERY_UPDATE:")) return null;

    const orderId = firstLine.replace("DELIVERY_UPDATE:", "").trim();
    if (!orderId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    const status = fields.status === "CONFIRMED" ? "CONFIRMED" : "IN_TRANSIT";

    return {
        orderId,
        status,
        crop: decodeMessageField(fields.crop, "Crop"),
        chatRoomId: decodeMessageField(fields.chatRoomId, ""),
    };
}

function parseOptionalNumber(value: string | undefined) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function parseDemandNegotiation(text: string): DemandNegotiation | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("DEMAND_NEGOTIATION:")) return null;

    const postId = firstLine.replace("DEMAND_NEGOTIATION:", "").trim();
    if (!postId) return null;

    const title =
        lines.find((line) => line.startsWith("TITLE:"))?.replace("TITLE:", "").trim() ??
        "Crop Demand";
    const quantity =
        lines.find((line) => line.startsWith("QTY:"))?.replace("QTY:", "").trim() ||
        undefined;

    return { postId, title, quantity };
}

function parseContractRequest(text: string): ContractRequest | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("CONTRACT_REQUEST:")) return null;

    const contractId = firstLine.replace("CONTRACT_REQUEST:", "").trim();
    if (!contractId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        contractId,
        crop: fields.crop ?? "Crop Demand",
        farmer: fields.farmer ?? "Farmer",
    };
}

function parseContractAccepted(text: string): ContractAccepted | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("CONTRACT_ACCEPTED:")) return null;

    const contractId = firstLine.replace("CONTRACT_ACCEPTED:", "").trim();
    if (!contractId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        contractId,
        crop: fields.crop ?? "Crop Demand",
        farmer: fields.farmer ?? "Farmer",
        postId: fields.postId ?? "",
        farmerId: fields.farmerId ?? "",
        chatRoomId: fields.chatRoomId ?? "",
    };
}

function parseContractOrderReady(text: string): ContractOrderReady | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("CONTRACT_ORDER_READY:")) return null;

    const contractId = firstLine.replace("CONTRACT_ORDER_READY:", "").trim();
    if (!contractId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        contractId,
        crop: fields.crop ?? "Crop Demand",
        farmer: fields.farmer ?? "Farmer",
        postId: fields.postId ?? "",
        farmerId: fields.farmerId ?? "",
        chatRoomId: fields.chatRoomId ?? "",
    };
}

function parseContractChangeRequested(text: string): ContractChangeRequested | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("CONTRACT_CHANGE_REQUESTED:")) return null;

    const contractId = firstLine.replace("CONTRACT_CHANGE_REQUESTED:", "").trim();
    if (!contractId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        contractId,
        crop: decodeMessageField(fields.crop, "Crop Demand"),
        farmer: decodeMessageField(fields.farmer, "Farmer"),
        title: decodeMessageField(fields.title, "Contract change requested"),
        note: decodeMessageField(fields.note, "Please review the requested change."),
        postId: decodeMessageField(fields.postId, ""),
        farmerId: decodeMessageField(fields.farmerId, ""),
        chatRoomId: decodeMessageField(fields.chatRoomId, ""),
    };
}

function parseContractRejected(text: string): ContractRejected | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("CONTRACT_REJECTED:")) return null;

    const contractId = firstLine.replace("CONTRACT_REJECTED:", "").trim();
    if (!contractId) return null;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
        const colon = line.indexOf(":");
        if (colon === -1) continue;
        fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }

    return {
        contractId,
        crop: decodeMessageField(fields.crop, "Crop Demand"),
        farmer: decodeMessageField(fields.farmer, "Farmer"),
        note: decodeMessageField(fields.note, "The farmer rejected this contract."),
        postId: decodeMessageField(fields.postId, ""),
        farmerId: decodeMessageField(fields.farmerId, ""),
        chatRoomId: decodeMessageField(fields.chatRoomId, ""),
    };
}

function decodeMessageField(value: string | undefined, fallback: string) {
    if (!value) return fallback;

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function parseLinkedChatNotice(text: string): LinkedChatNotice | null {
    const lines = text.split("\n").map((line) => line.trim());
    const firstLine = lines[0] ?? "";

    if (!firstLine.startsWith("LINKED_CHAT_ROOM:")) return null;

    const chatRoomId = firstLine.replace("LINKED_CHAT_ROOM:", "").trim();
    const chatType =
        lines.find((line) => line.startsWith("TYPE:"))?.replace("TYPE:", "").trim() ??
        "CROP_DEMAND";
    const title =
        lines.find((line) => line.startsWith("TITLE:"))?.replace("TITLE:", "").trim() ??
        "Specific trade chat";

    if (!chatRoomId) return null;

    return { chatRoomId, chatType, title };
}

function LinkedChatNoticeCard({ data }: { data: LinkedChatNotice }) {
    const label = data.chatType === "CROP_DEMAND" ? "Crop Demand Chat" : "Trade Chat";

    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                {label} Created
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.title}
            </h3>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                A specific chat room was opened for this trade. Continue there for contract and order steps.
            </p>
            <Link
                href={`/chat?chatRoomId=${encodeURIComponent(data.chatRoomId)}`}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
            >
                Go to chat
            </Link>
        </div>
    );
}

function OrderAcceptedCard({
    data,
    viewerRole,
    actorName,
}: {
    data: OrderAccepted;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
}) {
    const [paymentProgress, setPaymentProgress] = useState({
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        isFullyPaid: false,
    });
    const paymentPath =
        data.paymentPath === "/payment-demands"
            ? "/payment-demands"
            : "/payment-crop-product";
    const paymentHref = `${paymentPath}?orderId=${encodeURIComponent(data.orderId)}`;
    const isContractDemandOrder = paymentPath === "/payment-demands";
    const hasPaidAnyAmount = paymentProgress.paidAmount > 0;
    const isPaid = paymentProgress.isFullyPaid;
    const shouldDisablePayNow =
        isPaid || (isContractDemandOrder && hasPaidAnyAmount);

    useEffect(() => {
        let cancelled = false;
        let pollInterval: ReturnType<typeof setInterval> | null = null;

        async function fetchPaymentProgress() {
            const progress = await getOrderPaymentProgressAction(data.orderId);
            if (cancelled) return;

            setPaymentProgress(progress);

            if ((progress.isFullyPaid || (isContractDemandOrder && progress.paidAmount > 0)) && pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        }

        void fetchPaymentProgress();
        pollInterval = setInterval(fetchPaymentProgress, 10000);

        return () => {
            cancelled = true;
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [data.orderId, isContractDemandOrder]);

    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Order Accepted
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                {data.qty && <p>Quantity: {data.qty}</p>}
                {data.total && <p>Total: {data.total}</p>}
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {actorName} accepted this order. {viewerRole === "buyer" ? "You can complete the payment now." : "The buyer can complete the payment now."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {viewerRole === "buyer" && shouldDisablePayNow ? (
                    <span className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-200 px-4 text-xs font-bold text-slate-500">
                        {isPaid ? "Paid" : "Deposit Paid"}
                    </span>
                ) : viewerRole === "buyer" && (
                    <Link
                        href={paymentHref}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                    >
                        {isContractDemandOrder ? "Pay Deposit" : "Pay Now"}
                    </Link>
                )}
                <Link
                    href={`/order-history/${encodeURIComponent(data.orderId)}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-white px-4 text-xs font-bold text-primary transition hover:bg-primary/5"
                >
                    View Order
                </Link>
            </div>
        </div>
    );
}

function OrderCreatedCard({
    data,
    viewerRole,
    actorName,
}: {
    data: OrderCreated;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
}) {
    const [paymentProgress, setPaymentProgress] = useState({
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        isFullyPaid: false,
    });
    const paymentPath =
        data.paymentPath === "/payment-demands"
            ? "/payment-demands"
            : "/payment-crop-product";
    const paymentHref = `${paymentPath}?orderId=${encodeURIComponent(data.orderId)}`;
    const isContractDemandOrder = paymentPath === "/payment-demands";

    useEffect(() => {
        let cancelled = false;
        let pollInterval: ReturnType<typeof setInterval> | null = null;

        async function fetchPaymentProgress() {
            const progress = await getOrderPaymentProgressAction(data.orderId);
            if (cancelled) return;

            setPaymentProgress(progress);

            if ((progress.isFullyPaid || (isContractDemandOrder && progress.paidAmount > 0)) && pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        }

        void fetchPaymentProgress();
        pollInterval = setInterval(fetchPaymentProgress, 10000);

        return () => {
            cancelled = true;
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [data.orderId, isContractDemandOrder]);
    const isPaid = paymentProgress.isFullyPaid;
    const hasPaidAnyAmount = paymentProgress.paidAmount > 0;
    const shouldDisablePayNow =
        isPaid || (isContractDemandOrder && hasPaidAnyAmount);
    const hasProgress = paymentProgress.totalAmount > 0;
    const paidLabel = hasProgress
        ? formatOrderCardAmount(paymentProgress.paidAmount, data.currency)
        : formatOrderCardAmount(0, data.currency);
    const remainingLabel = hasProgress
        ? formatOrderCardAmount(paymentProgress.remainingAmount, data.currency)
        : data.total || "-";

    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Order Created
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                {data.qty && <p>Quantity: {data.qty}</p>}
                {data.price && <p>Price: {data.price}</p>}
                {data.delivery && <p>Delivery: {data.delivery}</p>}
                {data.total && <p>Total: {data.total}</p>}
                <p>Paid: {paidLabel}</p>
                <p>Remaining: {remainingLabel}</p>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {isPaid
                    ? "All payments for this contract order have been received."
                    : isContractDemandOrder && hasPaidAnyAmount && viewerRole === "buyer"
                    ? "Your deposit is paid. You can request approval for the next remaining payment from the payment section."
                    : isContractDemandOrder && hasPaidAnyAmount
                    ? "The deposit is paid. Waiting for the buyer to request approval for the next remaining payment."
                    : viewerRole === "buyer"
                    ? isContractDemandOrder
                        ? `${actorName} created this contract order. Pay the required deposit first.`
                        : `${actorName} created this order. You can pay now.`
                    : isContractDemandOrder
                        ? `${actorName} created this contract order. Waiting for the buyer to pay the required deposit.`
                        : `${actorName} created this order. Waiting for buyer payment.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {shouldDisablePayNow ? (
                    <span className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold ${
                        isPaid
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-500"
                    }`}>
                        {isPaid ? "Paid" : "Deposit Paid"}
                    </span>
                ) : viewerRole === "buyer" && (
                    <Link
                        href={paymentHref}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                    >
                        {isContractDemandOrder ? "Pay Deposit" : "Pay Now"}
                    </Link>
                )}
                <Link
                    href={`/order-history/${encodeURIComponent(data.orderId)}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-white px-4 text-xs font-bold text-primary transition hover:bg-primary/5"
                >
                    View Order
                </Link>
            </div>
        </div>
    );
}

function formatOrderCardAmount(amount: number, currency?: string) {
    const currencyCode = currency === "USD" || currency === "KHR" ? currency : undefined;

    if (!currencyCode) return amount.toLocaleString();

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: currencyCode === "KHR" ? 0 : 2,
    }).format(amount);
}

function formatOrderCode(orderId?: string | null) {
    const suffix = orderId?.trim().slice(-4).toUpperCase() || "----";
    return `#ORD-${suffix}`;
}

function OrderRejectedCard({
    data,
    viewerRole,
    actorName,
}: {
    data: OrderRejected;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
}) {
    const canUpdateOrder = data.paymentPath !== "/payment-demands";
    const canReturnToChat = data.paymentPath === "/payment-demands" && Boolean(data.chatRoomId);

    return (
        <div className="w-80 rounded-2xl border border-red-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                Order Rejected
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                {data.qty && <p>Quantity: {data.qty}</p>}
                {data.total && <p>Total: {data.total}</p>}
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {actorName} rejected this order. {viewerRole === "buyer" ? "You can update the terms and send it again." : "The buyer can update the terms and send it again."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {viewerRole === "buyer" && canUpdateOrder && (
                    <Link
                        href={`/order-crop-product?mode=edit&orderId=${encodeURIComponent(data.orderId)}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-[#F5B02E] px-4 text-xs font-bold text-primary-heading transition hover:bg-[#e5a022]"
                    >
                        Update Order
                    </Link>
                )}
                {viewerRole === "buyer" && canReturnToChat && (
                    <Link
                        href={`/chat?chatRoomId=${encodeURIComponent(data.chatRoomId ?? "")}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-[#F5B02E] px-4 text-xs font-bold text-primary-heading transition hover:bg-[#e5a022]"
                    >
                        Back to Chat
                    </Link>
                )}
                <Link
                    href={`/order-history/${encodeURIComponent(data.orderId)}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-white px-4 text-xs font-bold text-primary transition hover:bg-primary/5"
                >
                    View Order
                </Link>
            </div>
        </div>
    );
}

function PaymentCompletedCard({
    data,
    actorName,
}: {
    data: PaymentCompleted;
    actorName: string;
}) {
    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Payment Completed
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                {data.qty && <p>Quantity: {data.qty}</p>}
                {data.amount && <p>Paid: {data.amount}</p>}
                <p>Buyer: {data.buyer}</p>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {actorName} paid this amount.
            </p>
            <Link
                href={`/order-history/${encodeURIComponent(data.orderId)}`}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
            >
                See Detail
            </Link>
        </div>
    );
}

function DeliveryUpdateCard({
    data,
    viewerRole,
    actorName,
}: {
    data: DeliveryUpdate;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
}) {
    const isConfirmed = data.status === "CONFIRMED";
    const statusLabel = isConfirmed ? "Delivery Confirmed" : "Delivery In Transit";
    const detailMessage = isConfirmed
        ? `${actorName} confirmed the delivery. This order delivery is complete.`
        : `${actorName} marked this delivery as in transit. The buyer can confirm receipt from the delivery page.`;
    const deliveryRole = viewerRole === "farmer" ? "farmer" : "buyer";

    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                {statusLabel}
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                <p>Order: {formatOrderCode(data.orderId)}</p>
                <p>Status: {isConfirmed ? "Confirmed" : "In Transit"}</p>
            </div>
            <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {detailMessage}
            </p>
            <Link
                href={`/delivery?role=${deliveryRole}&orderId=${encodeURIComponent(data.orderId)}`}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
            >
                Delivery Info
            </Link>
        </div>
    );
}

function PaymentRequestCard({
    data,
    viewerRole,
    isAlreadyConfirmed,
    isAlreadyRejected,
    actorName,
}: {
    data: PaymentRequest;
    viewerRole: "buyer" | "farmer" | "other";
    isAlreadyConfirmed: boolean;
    isAlreadyRejected: boolean;
    actorName: string;
}) {
    const [pendingAction, setPendingAction] = useState<"accept" | "reject" | null>(null);
    const [localDecision, setLocalDecision] = useState<"accepted" | "rejected" | null>(null);
    const isPending = pendingAction !== null;
    const hasRejected = isAlreadyRejected || localDecision === "rejected";
    const hasConfirmed = isAlreadyConfirmed || localDecision === "accepted";
    const hasDecision = hasConfirmed || hasRejected;

    async function handleConfirm() {
        if (!data.chatRoomId || isPending || hasDecision) return;

        setPendingAction("accept");
        try {
            const result = await sendChatMessageAction({
                chatRoomId: data.chatRoomId ?? "",
                content: buildPaymentRequestAcceptedMessage(data),
            });
            if (result.success) setLocalDecision("accepted");
        } finally {
            setPendingAction(null);
        }
    }

    async function handleReject() {
        if (!data.chatRoomId || isPending || hasDecision) return;

        setPendingAction("reject");
        try {
            const result = await sendChatMessageAction({
                chatRoomId: data.chatRoomId ?? "",
                content: buildPaymentRequestRejectedMessage(data),
            });
            if (result.success) setLocalDecision("rejected");
        } finally {
            setPendingAction(null);
        }
    }

    return (
        <div className="w-80 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                Payment Request
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                {data.qty && <p>Quantity: {data.qty}</p>}
                <p>Amount: {formatRequestAmount(data.amount, data.currency)}</p>
                <p>Buyer: {data.buyer}</p>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {hasConfirmed
                    ? "This remaining payment has been approved."
                    : hasRejected
                    ? "This remaining payment request was rejected."
                    : `${actorName} requested approval to pay the next remaining amount.`}
            </p>
            {viewerRole === "farmer" && !hasDecision ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        disabled={isPending || !data.chatRoomId}
                        onClick={handleConfirm}
                        className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {pendingAction === "accept" ? "Accepting..." : "Accept"}
                    </button>
                    <button
                        type="button"
                        disabled={isPending || !data.chatRoomId}
                        onClick={handleReject}
                        className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {pendingAction === "reject" ? "Rejecting..." : "Reject"}
                    </button>
                </div>
            ) : hasConfirmed ? (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-primary">
                    {viewerRole === "buyer"
                        ? "This payment was approved. You can pay it now."
                        : "This payment was approved. Waiting for the buyer to pay."}
                </p>
            ) : hasRejected ? (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                    {viewerRole === "buyer"
                        ? "This payment request was rejected. You can send a new request."
                        : "This payment request was rejected."}
                </p>
            ) : (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    Waiting for the farmer to approve this payment.
                </p>
            )}
        </div>
    );
}

function PaymentRequestApprovedCard({
    data,
    viewerRole,
    actorName,
}: {
    data: PaymentRequestApproved;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
}) {
    const [paymentProgress, setPaymentProgress] = useState({
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        isFullyPaid: false,
    });
    const paymentHref = `/payment-demands?orderId=${encodeURIComponent(data.orderId)}&amount=${encodeURIComponent(data.amount)}`;
    const requestedAmount = Number(data.amount);
    const paymentTarget =
        (data.paidBefore ?? Number.POSITIVE_INFINITY) +
        (Number.isFinite(requestedAmount) ? requestedAmount : 0);
    const isRequestPaid =
        paymentProgress.isFullyPaid ||
        (Number.isFinite(paymentTarget) && paymentProgress.paidAmount >= paymentTarget);

    useEffect(() => {
        let cancelled = false;
        let pollInterval: ReturnType<typeof setInterval> | null = null;

        async function fetchPaymentProgress() {
            const progress = await getOrderPaymentProgressAction(data.orderId);
            if (cancelled) return;

            setPaymentProgress(progress);

            const requestIsPaid =
                progress.isFullyPaid ||
                (Number.isFinite(paymentTarget) && progress.paidAmount >= paymentTarget);

            if (requestIsPaid && pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
        }

        void fetchPaymentProgress();
        pollInterval = setInterval(fetchPaymentProgress, 10000);

        return () => {
            cancelled = true;
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [data.orderId, paymentTarget]);

    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Payment Approved
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                {data.qty && <p>Quantity: {data.qty}</p>}
                <p>Amount: {formatRequestAmount(data.amount, data.currency)}</p>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {isRequestPaid
                    ? "This approved remaining payment has been paid."
                    : viewerRole === "buyer"
                        ? `${actorName} approved this payment. You can pay this exact amount now.`
                        : `${actorName} approved this payment. Waiting for the buyer to pay this exact amount.`}
            </p>
            {isRequestPaid ? (
                <span className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white">
                    Paid
                </span>
            ) : viewerRole === "buyer" ? (
                <Link
                    href={paymentHref}
                    className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                >
                    Pay Now
                </Link>
            ) : (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-primary">
                    Approved. Waiting for buyer payment.
                </p>
            )}
        </div>
    );
}

function PaymentRequestRejectedCard({
    data,
    viewerRole,
    actorName,
}: {
    data: PaymentRequestRejected;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
}) {
    return (
        <div className="w-80 rounded-2xl border border-red-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                Payment Rejected
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-2 space-y-1 text-xs font-medium text-secondary-body">
                {data.qty && <p>Quantity: {data.qty}</p>}
                <p>Amount: {formatRequestAmount(data.amount, data.currency)}</p>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {viewerRole === "buyer"
                    ? `${actorName} rejected this remaining payment request. You can send a new request.`
                    : `${actorName} rejected this remaining payment request.`}
            </p>
            <span className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-red-50 px-4 text-xs font-bold text-red-600">
                Rejected
            </span>
        </div>
    );
}

function buildPaymentRequestAcceptedMessage(data: PaymentRequest) {
    return [
        `PAYMENT_REQUEST_ACCEPTED:${data.requestId}`,
        `orderId:${data.orderId}`,
        `crop:${data.crop}`,
        `qty:${data.qty}`,
        `amount:${data.amount}`,
        `paidBefore:${data.paidBefore ?? ""}`,
        `buyer:${data.buyer}`,
        `currency:${data.currency ?? ""}`,
        `chatRoomId:${data.chatRoomId ?? ""}`,
    ].join("\n");
}

function buildPaymentRequestRejectedMessage(data: PaymentRequest) {
    return [
        `PAYMENT_REQUEST_REJECTED:${data.requestId}`,
        `orderId:${data.orderId}`,
        `crop:${data.crop}`,
        `qty:${data.qty}`,
        `amount:${data.amount}`,
        `paidBefore:${data.paidBefore ?? ""}`,
        `buyer:${data.buyer}`,
        `currency:${data.currency ?? ""}`,
        `chatRoomId:${data.chatRoomId ?? ""}`,
    ].join("\n");
}

function formatRequestAmount(amount: string, currency?: string) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return amount;

    return formatOrderCardAmount(numericAmount, currency);
}

function ContractRequestCard({
    data,
    viewerRole,
}: {
    data: ContractRequest;
    viewerRole: "buyer" | "farmer" | "other";
}) {
    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Contract Sent
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {viewerRole === "farmer"
                    ? "Contract terms were sent to you for review."
                    : `Contract terms were sent to ${data.farmer} for review.`}
            </p>
            <Link
                href={`/digital-contract/${encodeURIComponent(data.contractId)}`}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
            >
                View Contract
            </Link>
        </div>
    );
}

function ContractAcceptedCard({
    data,
    viewerRole,
    hasOrderCreated,
    actorName,
}: {
    data: ContractAccepted;
    viewerRole: "buyer" | "farmer" | "other";
    hasOrderCreated: boolean;
    actorName: string;
}) {
    const orderParams = new URLSearchParams();
    if (data.postId) orderParams.set("postId", data.postId);
    if (data.farmerId) orderParams.set("farmerId", data.farmerId);
    if (data.chatRoomId) orderParams.set("chatRoomId", data.chatRoomId);
    orderParams.set("contractId", data.contractId);

    const canOrder =
        viewerRole === "buyer" && Boolean(data.postId && data.farmerId && data.chatRoomId);

    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Contract Accepted
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {hasOrderCreated
                    ? "The order has been created from this accepted contract."
                    : viewerRole === "buyer"
                        ? `${actorName} accepted the contract. You can create the order from the agreed terms.`
                        : `${actorName} accepted the contract. Waiting for the buyer to create the order.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {hasOrderCreated ? (
                    <span className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white">
                        Order Created
                    </span>
                ) : canOrder && (
                    <Link
                        href={`/order-crop-demands?${orderParams.toString()}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                    >
                        Create Order
                    </Link>
                )}
            </div>
        </div>
    );
}

function ContractOrderReadyCard({
    data,
    viewerRole,
    hasOrderCreated,
    actorName,
}: {
    data: ContractOrderReady;
    viewerRole: "buyer" | "farmer" | "other";
    hasOrderCreated: boolean;
    actorName: string;
}) {
    const orderParams = new URLSearchParams();
    if (data.postId) orderParams.set("postId", data.postId);
    if (data.farmerId) orderParams.set("farmerId", data.farmerId);
    if (data.chatRoomId) orderParams.set("chatRoomId", data.chatRoomId);
    orderParams.set("contractId", data.contractId);

    const canOrder =
        viewerRole === "buyer" && Boolean(data.postId && data.farmerId && data.chatRoomId);

    return (
        <div className="w-80 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Contract Accepted
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {hasOrderCreated
                    ? "The order has been created from this accepted contract."
                    : viewerRole === "buyer"
                        ? `${actorName} accepted the contract. You can create the order from the agreed terms.`
                        : `${actorName} accepted the contract. Waiting for the buyer to create the order.`}
            </p>
            {hasOrderCreated ? (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-primary">
                    Order Created
                </p>
            ) : canOrder ? (
                <Link
                    href={`/order-crop-demands?${orderParams.toString()}`}
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                >
                    Create Order
                </Link>
            ) : (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-primary">
                    Waiting for buyer to create order.
                </p>
            )}
        </div>
    );
}

function ContractChangeRequestedCard({
    data,
    viewerRole,
    actorName,
}: {
    data: ContractChangeRequested;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
}) {
    const editParams = new URLSearchParams();
    if (data.chatRoomId) editParams.set("chatRoomId", data.chatRoomId);
    if (data.postId) editParams.set("postId", data.postId);
    if (data.farmerId) editParams.set("farmerId", data.farmerId);
    editParams.set("contractId", data.contractId);

    return (
        <div className="w-80 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Change Requested
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-3 rounded-xl bg-amber-50 p-3">
                <p className="text-xs font-bold text-primary-heading">
                    {data.title}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs font-medium leading-relaxed text-secondary-body">
                    {data.note}
                </p>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {actorName} requested changes to this contract.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {viewerRole === "buyer" && (
                    <Link
                        href={`/digital-contract/create?${editParams.toString()}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                    >
                        Update Contract
                    </Link>
                )}
                <Link
                    href={`/digital-contract/${encodeURIComponent(data.contractId)}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-white px-4 text-xs font-bold text-primary transition hover:bg-primary/5"
                >
                    View Contract
                </Link>
            </div>
        </div>
    );
}

function ContractRejectedCard({
    data,
    viewerRole,
    actorName,
    chatRoomId,
}: {
    data: ContractRejected;
    viewerRole: "buyer" | "farmer" | "other";
    actorName: string;
    chatRoomId?: string;
}) {
    // A rejected contract can be re-negotiated in the same chat room, so the
    // buyer creates a new contract here rather than starting a fresh chat.
    const createContractParams = new URLSearchParams();
    createContractParams.set("chatType", "CROP_DEMAND");
    if (chatRoomId) createContractParams.set("chatRoomId", chatRoomId);
    if (data.postId) createContractParams.set("postId", data.postId);
    if (data.farmerId) createContractParams.set("farmerId", data.farmerId);
    createContractParams.set("farmerName", data.farmer);

    const canCreateContract = viewerRole === "buyer" && Boolean(chatRoomId);

    return (
        <div className="w-80 rounded-2xl border border-red-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                Contract Rejected
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.crop}
            </h3>
            <div className="mt-3 rounded-xl bg-red-50 p-3">
                <p className="text-xs font-bold text-primary-heading">
                    Farmer response
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs font-medium leading-relaxed text-secondary-body">
                    {data.note}
                </p>
            </div>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                {actorName} rejected this contract. {viewerRole === "buyer" ? "Create a new contract to negotiate again." : "The buyer can create a new contract to negotiate again."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
                {canCreateContract && (
                    <Link
                        href={`/digital-contract/create?${createContractParams.toString()}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white transition hover:brightness-95"
                    >
                        Create Contract
                    </Link>
                )}
                <Link
                    href={`/digital-contract/${encodeURIComponent(data.contractId)}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-white px-4 text-xs font-bold text-primary transition hover:bg-primary/5"
                >
                    View Contract
                </Link>
            </div>
        </div>
    );
}

function DemandNegotiationCard({ data }: { data: DemandNegotiation }) {
    return (
        <div className="w-80 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm [&_.text-primary-heading]:text-[14px] [&_.text-secondary-body]:text-[14px]">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Crop Demand Discussion
            </p>
            <h3 className="mt-1 text-sm font-bold text-primary-heading">
                {data.title}
            </h3>
            {data.quantity && (
                <p className="mt-1 text-xs font-semibold text-secondary-body">
                    Quantity: {data.quantity}
                </p>
            )}
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-primary-heading">
                Negotiate price, quantity, delivery, and terms here. After agreement, use Create Contract.
            </p>
        </div>
    );
}

function CardTranslationBlock({
    text,
    translationMode,
}: {
    text: StaticCardTranslation;
    translationMode: ChatTranslationMode;
}) {
    if (translationMode === "original") return null;

    const translatedText = translationMode === "eng" ? text.en : text.kh;
    const isKhmer = translatedText === text.kh;

    return (
        <div className="mt-2 w-80 rounded-xl border border-dashed border-light-grey bg-white/80 px-3 py-2 text-[13px] leading-relaxed text-secondary-body">
            <p className={`whitespace-pre-wrap ${isKhmer ? "font-khmer" : ""}`}>
                {translatedText}
            </p>
        </div>
    );
}

function buildOrderRequestTranslationText(data: OrderRequestData): StaticCardTranslation {
    return {
        en: [
            "Order Request",
            `Buyer: ${data.buyer}`,
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Price: ${data.price}`,
            `Total: ${data.total}`,
            "Waiting for the farmer to accept or reject this order.",
        ].filter(Boolean).join("\n"),
        kh: [
            "សំណើបញ្ជាទិញ",
            `អ្នកទិញ: ${data.buyer}`,
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `តម្លៃ: ${data.price}`,
            `សរុប: ${data.total}`,
            "កំពុងរង់ចាំកសិករទទួលយក ឬបដិសេធការបញ្ជាទិញនេះ។",
        ].filter(Boolean).join("\n"),
    };
}

function buildOrderAcceptedTranslationText(data: OrderAccepted): StaticCardTranslation {
    return {
        en: [
            "Order Accepted",
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Total: ${data.total}`,
            "The farmer accepted this order. The buyer can continue with payment.",
        ].join("\n"),
        kh: [
            "បានទទួលយកការបញ្ជាទិញ",
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `សរុប: ${data.total}`,
            "កសិករបានទទួលយកការបញ្ជាទិញនេះ។ អ្នកទិញអាចបន្តការទូទាត់បាន។",
        ].join("\n"),
    };
}

function buildOrderCreatedTranslationText(data: OrderCreated): StaticCardTranslation {
    const isContractOrder = data.paymentPath === "/payment-demands";

    return {
        en: [
            "Order Created",
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Price: ${data.price}`,
            `Total: ${data.total}`,
            isContractOrder
                ? "This contract order is ready for the buyer to pay the required deposit first."
                : "This order is ready for payment.",
        ].filter(Boolean).join("\n"),
        kh: [
            "បានបង្កើតការបញ្ជាទិញ",
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `តម្លៃ: ${data.price}`,
            `សរុប: ${data.total}`,
            isContractOrder
                ? "ការបញ្ជាទិញតាមកិច្ចសន្យានេះរួចរាល់សម្រាប់អ្នកទិញបង់ប្រាក់កក់ជាមុន។"
                : "ការបញ្ជាទិញនេះរួចរាល់សម្រាប់ការទូទាត់។",
        ].filter(Boolean).join("\n"),
    };
}

function buildOrderRejectedTranslationText(data: OrderRejected): StaticCardTranslation {
    return {
        en: [
            "Order Rejected",
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Total: ${data.total}`,
            "The farmer rejected this order. The buyer can update the terms and send it again.",
        ].join("\n"),
        kh: [
            "បានបដិសេធការបញ្ជាទិញ",
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `សរុប: ${data.total}`,
            "កសិករបានបដិសេធការបញ្ជាទិញនេះ។ អ្នកទិញអាចកែប្រែលក្ខខណ្ឌ ហើយផ្ញើម្តងទៀត។",
        ].join("\n"),
    };
}

function buildPaymentCompletedTranslationText(data: PaymentCompleted): StaticCardTranslation {
    return {
        en: [
            "Payment Completed",
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Paid: ${data.amount}`,
            `Buyer: ${data.buyer}`,
            "The buyer has completed this payment.",
        ].join("\n"),
        kh: [
            "បានបញ្ចប់ការទូទាត់",
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `បានបង់: ${data.amount}`,
            `អ្នកទិញ: ${data.buyer}`,
            "អ្នកទិញបានបញ្ចប់ការទូទាត់នេះ។",
        ].join("\n"),
    };
}

function buildDeliveryUpdateTranslationText(data: DeliveryUpdate): StaticCardTranslation {
    const isConfirmed = data.status === "CONFIRMED";

    return {
        en: [
            isConfirmed ? "Delivery Confirmed" : "Delivery In Transit",
            `Order: ${formatOrderCode(data.orderId)}`,
            `Crop: ${data.crop}`,
            isConfirmed
                ? "The buyer confirmed receipt. The delivery is complete."
                : "The farmer marked this delivery as in transit. The buyer can confirm receipt from the delivery page.",
        ].join("\n"),
        kh: [
            isConfirmed ? "បានបញ្ជាក់ការដឹកជញ្ជូន" : "ការដឹកជញ្ជូនកំពុងដឹកជញ្ជូន",
            `ការបញ្ជាទិញ: ${formatOrderCode(data.orderId)}`,
            `ដំណាំ: ${data.crop}`,
            isConfirmed
                ? "អ្នកទិញបានបញ្ជាក់ថាបានទទួលទំនិញ។ ការដឹកជញ្ជូនបានបញ្ចប់។"
                : "កសិករបានកំណត់ការដឹកជញ្ជូននេះថាកំពុងដឹកជញ្ជូន។ អ្នកទិញអាចបញ្ជាក់ការទទួលពីទំព័រដឹកជញ្ជូន។",
        ].join("\n"),
    };
}

function buildPaymentRequestTranslationText(
    data: PaymentRequest,
    confirmed: boolean,
    rejected = false,
): StaticCardTranslation {
    return {
        en: [
            confirmed ? "Payment Confirmed" : rejected ? "Payment Rejected" : "Payment Request",
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Amount: ${formatRequestAmount(data.amount, data.currency)}`,
            confirmed
                ? "Farmer approval has been recorded for this remaining payment."
                : rejected
                ? "The farmer rejected this remaining payment request."
                : "Buyer requested farmer approval for a remaining payment.",
        ].join("\n"),
        kh: [
            confirmed ? "បានបញ្ជាក់ការទូទាត់" : rejected ? "បានបដិសេធការទូទាត់" : "សំណើទូទាត់",
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `ចំនួនទឹកប្រាក់: ${formatRequestAmount(data.amount, data.currency)}`,
            confirmed
                ? "ការអនុម័តរបស់កសិករសម្រាប់ការទូទាត់ដែលនៅសល់នេះត្រូវបានកត់ត្រា។"
                : rejected
                ? "កសិករបានបដិសេធសំណើទូទាត់ដែលនៅសល់នេះ។"
                : "អ្នកទិញបានស្នើសុំការអនុម័តពីកសិករសម្រាប់ការទូទាត់ដែលនៅសល់។",
        ].join("\n"),
    };
}

function buildPaymentApprovedTranslationText(data: PaymentRequestApproved): StaticCardTranslation {
    return {
        en: [
            "Payment Approved",
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Amount: ${formatRequestAmount(data.amount, data.currency)}`,
            "Farmer approved this remaining payment. Buyer can pay this exact amount now.",
        ].join("\n"),
        kh: [
            "បានអនុម័តការទូទាត់",
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `ចំនួនទឹកប្រាក់: ${formatRequestAmount(data.amount, data.currency)}`,
            "កសិករបានអនុម័តការទូទាត់ដែលនៅសល់នេះ។ អ្នកទិញអាចបង់ចំនួននេះឥឡូវនេះ។",
        ].join("\n"),
    };
}

function buildPaymentRejectedTranslationText(data: PaymentRequestRejected): StaticCardTranslation {
    return {
        en: [
            "Payment Rejected",
            `Crop: ${data.crop}`,
            `Quantity: ${data.qty}`,
            `Amount: ${formatRequestAmount(data.amount, data.currency)}`,
            "Farmer rejected this remaining payment request. Buyer can send a new request.",
        ].join("\n"),
        kh: [
            "បានបដិសេធការទូទាត់",
            `ដំណាំ: ${data.crop}`,
            `បរិមាណ: ${data.qty}`,
            `ចំនួនទឹកប្រាក់: ${formatRequestAmount(data.amount, data.currency)}`,
            "កសិករបានបដិសេធសំណើទូទាត់ដែលនៅសល់នេះ។ អ្នកទិញអាចផ្ញើសំណើថ្មីបាន។",
        ].join("\n"),
    };
}

function buildContractRequestTranslationText(data: ContractRequest): StaticCardTranslation {
    return {
        en: [
            "Contract Sent",
            `Crop: ${data.crop}`,
            `Farmer: ${data.farmer}`,
            "Contract terms were sent to the farmer for review.",
        ].join("\n"),
        kh: [
            "បានផ្ញើកិច្ចសន្យា",
            `ដំណាំ: ${data.crop}`,
            `កសិករ: ${data.farmer}`,
            "លក្ខខណ្ឌកិច្ចសន្យាត្រូវបានផ្ញើទៅកសិករសម្រាប់ពិនិត្យ។",
        ].join("\n"),
    };
}

function buildContractAcceptedTranslationText(
    data: ContractAccepted,
    hasOrderCreated: boolean,
): StaticCardTranslation {
    return {
        en: [
            "Contract Accepted",
            `Crop: ${data.crop}`,
            `Farmer: ${data.farmer}`,
            hasOrderCreated
                ? "The order has been created from this accepted contract."
                : "The buyer can now create an order from the finalized terms.",
        ].join("\n"),
        kh: [
            "បានទទួលយកកិច្ចសន្យា",
            `ដំណាំ: ${data.crop}`,
            `កសិករ: ${data.farmer}`,
            hasOrderCreated
                ? "ការបញ្ជាទិញត្រូវបានបង្កើតពីកិច្ចសន្យាដែលបានទទួលយកនេះ។"
                : "អ្នកទិញអាចបង្កើតការបញ្ជាទិញពីលក្ខខណ្ឌចុងក្រោយបានឥឡូវនេះ។",
        ].join("\n"),
    };
}

function buildContractOrderReadyTranslationText(
    data: ContractOrderReady,
    hasOrderCreated: boolean,
) {
    return buildContractAcceptedTranslationText(data, hasOrderCreated);
}

function buildLinkedChatTranslationText(data: LinkedChatNotice): StaticCardTranslation {
    const label = data.chatType === "CROP_DEMAND" ? "Crop Demand Chat" : "Trade Chat";

    return {
        en: [
            `${label} Created`,
            `Title: ${data.title}`,
            "A specific chat room was opened for this trade. Continue there for contract and order steps.",
        ].join("\n"),
        kh: [
            data.chatType === "CROP_DEMAND" ? "បានបង្កើតការជជែកអំពីតម្រូវការដំណាំ" : "បានបង្កើតការជជែកពាណិជ្ជកម្ម",
            `ចំណងជើង: ${data.title}`,
            "បន្ទប់ជជែកជាក់លាក់ត្រូវបានបើកសម្រាប់ការជួញដូរនេះ។ សូមបន្តនៅទីនោះសម្រាប់ជំហានកិច្ចសន្យា និងការបញ្ជាទិញ។",
        ].join("\n"),
    };
}

function buildContractChangeTranslationText(data: ContractChangeRequested): StaticCardTranslation {
    return {
        en: [
            "Contract Change Requested",
            `Crop: ${data.crop}`,
            `Farmer: ${data.farmer}`,
            `Reason: ${data.title}`,
            data.note,
            "The buyer can update the contract and send it again.",
        ].join("\n"),
        kh: [
            "បានស្នើសុំកែប្រែកិច្ចសន្យា",
            `ដំណាំ: ${data.crop}`,
            `កសិករ: ${data.farmer}`,
            `មូលហេតុ: ${data.title}`,
            data.note,
            "អ្នកទិញអាចកែប្រែកិច្ចសន្យា ហើយផ្ញើម្តងទៀត។",
        ].join("\n"),
    };
}

function buildContractRejectedTranslationText(data: ContractRejected): StaticCardTranslation {
    return {
        en: [
            "Contract Rejected",
            `Crop: ${data.crop}`,
            `Farmer: ${data.farmer}`,
            `Farmer response: ${data.note}`,
            "The buyer can create a new contract from the latest discussion.",
        ].join("\n"),
        kh: [
            "បានបដិសេធកិច្ចសន្យា",
            `ដំណាំ: ${data.crop}`,
            `កសិករ: ${data.farmer}`,
            `ការឆ្លើយតបរបស់កសិករ: ${data.note}`,
            "អ្នកទិញអាចបង្កើតកិច្ចសន្យាថ្មីពីការពិភាក្សាចុងក្រោយ។",
        ].join("\n"),
    };
}

function buildDemandNegotiationTranslationText(data: DemandNegotiation): StaticCardTranslation {
    return {
        en: [
            "Crop Demand Discussion",
            `Title: ${data.title}`,
            data.quantity ? `Quantity: ${data.quantity}` : "",
            "Negotiate price, quantity, delivery, and terms here. After agreement, use Create Contract.",
        ].filter(Boolean).join("\n"),
        kh: [
            "ការពិភាក្សាអំពីតម្រូវការដំណាំ",
            `ចំណងជើង: ${data.title}`,
            data.quantity ? `បរិមាណ: ${data.quantity}` : "",
            "ចរចាតម្លៃ បរិមាណ ការដឹកជញ្ជូន និងលក្ខខណ្ឌនៅទីនេះ។ បន្ទាប់ពីព្រមព្រៀង សូមប្រើ បង្កើតកិច្ចសន្យា។",
        ].filter(Boolean).join("\n"),
    };
}

function getCardActorName(isMe: boolean, otherName?: string | null) {
    if (isMe) return "You";

    const name = otherName?.trim();
    return name || "They";
}

function isLastMessageInTenMinuteSenderGroup(messages: Message[], index: number) {
    const message = messages[index];
    const nextMessage = messages[index + 1];

    if (!nextMessage) return true;
    if (nextMessage.sender !== message.sender) return true;

    const messageTime = getMessageTime(message.createdAt);
    const nextMessageTime = getMessageTime(nextMessage.createdAt);

    if (messageTime === null || nextMessageTime === null) {
        return false;
    }

    return nextMessageTime - messageTime >= 10 * 60 * 1000;
}

function getMessageTime(value?: string) {
    if (!value) return null;

    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
}

function getSafeAvatar(src?: string | null) {
    const value = src?.trim();

    if (!value || value.toLowerCase() === "string") return "";

    if (/^(blob:|data:)/i.test(value) || value.startsWith("/assets/")) {
        return value;
    }

    const resolvedSrc = getAttachmentImageUrl(value);

    return resolvedSrc;
}

function SenderAvatar({
    src,
    name,
    href,
}: {
    src: string;
    name: string;
    href?: string;
}) {
    const [failed, setFailed] = useState(false);
    const initials = getInitials(name);
    const avatar = !src || failed ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary">
            {initials}
        </span>
    ) : (
        <Image
            src={src}
            alt={name}
            width={32}
            height={32}
            unoptimized
            onError={() => setFailed(true)}
            className="h-8 w-8 rounded-full object-cover"
        />
    );

    if (!href) {
        return (
            <span
                aria-label={name}
                className="mt-auto block"
            >
                {avatar}
            </span>
        );
    }

    return (
        <Link
            href={href}
            aria-label={`View ${name} profile`}
            className="mt-auto block cursor-pointer rounded-full transition hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
            {avatar}
        </Link>
    );
}

function getInitials(name: string) {
    const initials = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");

    return initials || "?";
}

function getMessageDayKey(value?: string) {
    const date = value ? new Date(value) : new Date();

    if (Number.isNaN(date.getTime())) {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    }

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatChatDate(value?: string) {
    const date = value ? new Date(value) : new Date();

    if (Number.isNaN(date.getTime())) {
        return "Today";
    }

    const today = startOfDay(new Date());
    const messageDay = startOfDay(date);
    const diffDays = Math.round(
        (today.getTime() - messageDay.getTime()) / 86_400_000
    );
    const monthDay = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);

    if (diffDays === 0) return `Today, ${monthDay}`;
    if (diffDays === 1) return `Yesterday, ${monthDay}`;

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function RiceTypingMark({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 128 128"
            className={`h-6 w-6 shrink-0 ${className ?? ""}`}
            fill="none"
        >
            <path
                fill="#717F35"
                d="m51.9 100.22l-9.93-19.58s-1.68-11.01-.56-25.59c.98-12.72 3.45-21.67 10.06-29.64c5.13-6.18 13.29-12.45 21.4-15.39s8.95-3.08 8.95-2.1s-12.72 6.73-21.53 19.03S51.9 51 51.34 58.69s.56 41.53.56 41.53z"
            />
            <path
                fill="#94A61D"
                d="M19.46 48.21c5.34 9.57 10.41 27.44 16.26 40.92c5.45 12.58 11.15 22.28 16.18 27.03s9.62 4.33 11.61 2.66c2.99-2.52 1.42-9.51 1.4-13.56c-.04-7.24 1.34-12.24 3.5-15.94c1.9-3.25 5.46-6.55 9.23-5.42c4.53 1.36 7.55 5.84 8.95 7.94c1.4 2.1 3.5 6.29 4.47 6.29s-.62-10.81-5.23-17.15c-4.56-6.27-11.11-7.5-16.99-4.94c-13.13 5.72-13.5 23.08-13.5 23.08s-8.32-7.01-14.05-25.32c-1.4-4.47-5.8-20.35-10.17-26.83C24.4 37 17.22 34.92 13.17 33.52c-4.05-1.4-8.95-2.8-9.09-1.96c-.14.85 9.37 5.88 15.38 16.65z"
            />
            <path
                fill="#FFBD13"
                d="M59.44 105.59c-.4-2.78-1.66-10.05-1.16-19.18c.34-6.35 2.09-16.9 11.71-20.36c7.74-2.78 13.78-2.81 22.02 1.15c7.64 3.67 3.96-1.23.37-3.09c-2.49-1.29-13.1-6.65-23.61-3.08c-12.22 4.15-15.48 18.75-15.48 18.75s-.89-15.88 2.38-23.71c3.27-7.84 9.15-14.25 7.54-14.78c-.6-.2-8.02 2.83-12.2 12.4c-4.46 10.22-4.66 19.45-4.37 24.71s1.04 10.43 1.04 10.43s2.08 4.83 4.53 7.96c2.27 2.91 7.35 9.65 7.23 8.8z"
            />
            <path
                fill="#FFBD13"
                d="M67.23 26.85c-.49-.1-5.69 1.9-8.31 8.18c-2.62 6.28-.39 11.46-.39 11.46s7-6.09 8.31-9.88c1.31-3.8 1.05-9.63.39-9.76z"
            />
            <path
                fill="#FFBD13"
                d="M80.33 44.65c.07-.32-5.3-4.84-9.43-4.91c-4.12-.07-9.16 3.47-9.16 3.47s1.72 4.12 8.25 4.84c4.71.53 10.21-2.81 10.34-3.4zM69.2 37.06c.46.39 5.76-.2 8.83-3.83c3.23-3.82 3.28-12.47 2.3-12.47c-1.17 0-1.96 1.24-3.99 2.49c-2.03 1.24-5.76 4.91-6.74 7.72c-.99 2.82-.86 5.7-.4 6.09zm5.21.62c.11 1.16 4.21 4.99 8.76 5.19c4.55.2 8.57-1.52 8.57-2.2s-2.9-5.77-7.93-6.27c-5.44-.53-9.45 2.75-9.4 3.28zm6.7-4.94c.54.93 6.8-.24 9.74-4.26c2.71-3.7 2.2-7.88 1.91-8.42c-.29-.54-4.65-.1-8.13 3.92c-2.88 3.33-4.01 7.9-3.52 8.76zm6.51 0c-.03.88 2.59 4.46 5.58 5.83c4.5 2.06 10.23.83 10.48.05c.24-.78-2.45-6.06-6.07-7.64c-4.26-1.86-9.94.34-9.99 1.76zm6.42-4.02c0 1.18 7.05.98 9.55-.73c2.5-1.71 5.09-6.32 5.68-6.95s.69-1.27-.59-1.66c-1.27-.39-7.54-.59-11.16 2.11s-3.48 6.99-3.48 7.23zm7.93 1.57c-.65.37.34 1.62.83 2.64c.49 1.03 2.15 5.19 5.78 7c3.47 1.73 8.18 1.62 8.37 1.37c.2-.24-.82-6.06-4.36-8.71c-4.31-3.23-9.4-2.98-10.62-2.3zm5.33-2.25c.12.57 4.9 3.08 8.96 3.43s8.08-3.72 8.13-4.16s-3.67-4.41-7.88-4.26c-5.53.19-9.35 4.3-9.21 4.99zM89.39 49.68c-.08-.93-7.69-1.08-11.55 2.94c-3.87 4.01-3.97 7.83-3.97 7.83l2.79 1.81s5.34-2.35 8.22-5.14c3.36-3.25 4.6-6.32 4.51-7.44z"
            />
            <path
                fill="#FFBD13"
                d="M82.46 75.52c1.23.05.98-5.14-.2-8.37c-1.25-3.43-4.55-5.87-4.55-5.87l-4.11.88s.09 4.07 2.07 7.6c2.63 4.66 5.66 5.71 6.79 5.76zm1.15-12.53s-.41 4.19 1.52 8.08c2.01 4.06 6.41 6.41 7.39 6.02c.98-.39.49-5.34-.15-7.69c-.64-2.35-3.57-6.02-3.57-6.02l-5.19-.39zm-.54-2.05s3.13-5.09 6.95-6.66c5.45-2.24 12.39.54 12.43 1.57c.05 1.03-4.7 4.5-7.05 5.39c-2.35.88-7.15 1.71-7.15 1.71l-5.18-2.01zm19.58.14c-4.16.18-8.27 2.55-8.37 3.87c-.1 1.32 3.57 4.26 8.71 4.26c5.14 0 8.32-3.43 8.32-3.92c.01-.49-2.93-4.45-8.66-4.21z"
            />
            <path
                fill="#FFBD13"
                d="M95.51 66.78c-1.09-.2-2.25 5.34-.39 9.74c1.86 4.41 6.85 6.61 7.25 6.76c1.28.48.93-7.34-.59-10.53c-1.39-2.9-4.71-5.67-6.27-5.97zm7.14 3.89c-.43.75.54 5.78 2.79 8.71c3.52 4.6 8.86 4.94 9.4 4.7s-.1-7.25-3.52-10.57c-3.29-3.19-8.28-3.53-8.67-2.84z"
            />
        </svg>
    );
}
