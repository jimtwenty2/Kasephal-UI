import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import type { CropDetail } from "@/app/chat/_types/chat";
import { apiBaseUrl } from "@/utils/apiBaseUrl";
import { apiGet, getCropDetailByPostIdAnyType } from "@/services/post.service";
import type { MarketPriceCheckResponse } from "@/types/market-price";

export type Contract = {
    contractId: string;
    buyerId: string;
    buyerName: string;
    farmerId: string;
    farmerName: string;
    chatRoomId: string;
    postId: string;
    totalPrice: number;
    depositAmount: number;
    remainingAmount: number;
    totalQuantity: number;
    unitType: string;
    currencyCode?: string;

    status:
    | "DRAFT"
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "LOCKED"
    | "COMPLETED"
    | "REQUEST_CHANGE";

    createdAt: string;
    marketPriceCheck?: MarketPriceCheckResponse | null;
};

type ContractsResponse = {
    status: number;
    success: boolean;
    payload: {
        items: Contract[];
    };
};

export async function getContractsService(): Promise<Contract[]> {
    try {
        const headers = await headerToken();

        const response = await fetch(
            `${env.NEXT_BASE_API_URL}/contracts`,
            {
                cache: "no-store",
                headers,
            }
        );

        const result: ContractsResponse = await response.json();

        if (!response.ok || !result.success) {
            return [];
        }

        return result.payload?.items ?? [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

/* =========================================================================
 * TYPES DEFINITIONS
 * ========================================================================= */

export type ContractStatus =
    | "PENDING"
    | "REJECTED"
    | "ACCEPTED"
    | "LOCKED"
    | "COMPLETED"
    | "REQUEST_CHANGE";

export type ContractApiItem = {
    contractId: string;
    chatRoomId: string;
    status: ContractStatus;
    requestChangeMessage: string | null;
    createdAt: string;
    updatedAt: string | null;

    buyerId: string;
    buyerName: string;
    buyerProfileUrl: string | null;

    farmerId: string;
    farmerName: string;
    farmerProfileUrl: string | null;

    postId: string | null;
    postTitle: string | null;

    pricePerUnit: number;
    totalPrice: number;
    totalQuantity: number;
    depositAmount: number;
    remainingAmount: number;
    unitType: string;
    currencyCode: string;

    deliveryDate: string;
    startDate: string;
    endDate: string;
    marketPriceCheck?: MarketPriceCheckResponse | null;
};

/** A single contract enriched with crop detail resolved from its post. */
export type ContractDetail = ContractApiItem & {
    crop?: CropDetail;
};

/* =========================================================================
 * HELPER FUNCTIONS
 * ========================================================================= */

const CONTRACTS_ENDPOINT = `${apiBaseUrl}/contracts`;

/**
 * Pulls a human-readable error out of the API response. The backend uses two
 * envelope shapes: the standard `{ message }` and Spring's problem-detail
 * `{ title, detail }`. Falls back to the provided default.
 */
function apiErrorMessage(
    data: { message?: string; detail?: string; title?: string } | null | undefined,
    fallback: string
): string {
    return data?.message ?? data?.detail ?? data?.title ?? fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractContractId(value: unknown): string | undefined {
    if (Array.isArray(value)) {
        for (const item of value) {
            const contractId = extractContractId(item);
            if (contractId) return contractId;
        }

        return undefined;
    }

    if (!isRecord(value)) return undefined;

    const directContractId = value.contractId;
    if (typeof directContractId === "string" && directContractId.trim()) {
        return directContractId;
    }

    const fallbackId = value.id;
    if (typeof fallbackId === "string" && fallbackId.trim()) {
        return fallbackId;
    }

    for (const key of ["payload", "data", "item", "contract", "items", "content", "results"]) {
        const contractId = extractContractId(value[key]);
        if (contractId) return contractId;
    }

    return undefined;
}

async function fetchContracts(): Promise<ContractApiItem[]> {
    const data = await apiGet<{ items: ContractApiItem[] }>(CONTRACTS_ENDPOINT);
    return data?.items ?? [];
}

function isMoreRecent(a: ContractApiItem, b: ContractApiItem) {
    return new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime();
}

/* =========================================================================
 * MAIN SERVICE FUNCTIONS
 * ========================================================================= */

/**
 * Builds a `chatRoomId -> contractId` map used to decide which chats have a
 * contract (and to link the "View Contract" button).
 *
 * Only ACCEPTED contracts count as "this chat has a contract". When a chat
 * room has multiple accepted contracts, the most recent (by `createdAt`) wins.
 */
export async function getAcceptedContractMapService(): Promise<
    Map<string, string>
> {
    const items = await fetchContracts();

    const latestByRoom = new Map<string, ContractApiItem>();

    for (const item of items) {
        if (item.status !== "ACCEPTED") continue;
        if (!item.chatRoomId) continue;

        const existing = latestByRoom.get(item.chatRoomId);

        if (!existing || isMoreRecent(item, existing)) {
            latestByRoom.set(item.chatRoomId, item);
        }
    }

    const map = new Map<string, string>();

    for (const [chatRoomId, contract] of latestByRoom) {
        map.set(chatRoomId, contract.contractId);
    }

    return map;
}


const DEAL_CONTRACT_STATUSES = new Set(["ACCEPTED", "LOCKED", "COMPLETED"]);


const ACTIVE_CONTRACT_STATUSES = new Set([
    "PENDING",
    "REQUEST_CHANGE",
    "ACCEPTED",
    "LOCKED",
]);

export async function getDealContractRoomIdsService(): Promise<Set<string>> {
    const items = await fetchContracts();

    const latestByRoom = new Map<string, ContractApiItem>();
    for (const item of items) {
        if (!item.chatRoomId) continue;
        const existing = latestByRoom.get(item.chatRoomId);
        if (!existing || isMoreRecent(item, existing)) {
            latestByRoom.set(item.chatRoomId, item);
        }
    }

    const roomIds = new Set<string>();
    for (const [chatRoomId, contract] of latestByRoom) {
        if (DEAL_CONTRACT_STATUSES.has(contract.status)) {
            roomIds.add(chatRoomId);
        }
    }

    return roomIds;
}

/**
 * Returns chat room ids that currently have an active (in-progress) contract.
 * Used to gate the "Create Contract" button so a new contract can be created
 * after a previous one was rejected.
 */
export async function getActiveContractRoomIdsService(): Promise<Set<string>> {
    const items = await fetchContracts();
    const roomIds = new Set<string>();

    for (const item of items) {
        if (item.chatRoomId && ACTIVE_CONTRACT_STATUSES.has(item.status)) {
            roomIds.add(item.chatRoomId);
        }
    }

    return roomIds;
}

/**
 * Builds a `chatRoomId -> contractId` map covering contracts in ANY status
 * (PENDING, REJECTED, ACCEPTED, LOCKED, COMPLETED, REQUEST_CHANGE).
 *
 * This is the source of truth for whether a chat shows the "View Contract"
 * button. When a chat room has multiple contracts, the most recent (by
 * `createdAt`) wins.
 */
export async function getContractMapService(): Promise<Map<string, string>> {
    const items = await fetchContracts();

    const latestByRoom = new Map<string, ContractApiItem>();

    for (const item of items) {
        if (!item.chatRoomId) continue;

        const existing = latestByRoom.get(item.chatRoomId);

        if (!existing || isMoreRecent(item, existing)) {
            latestByRoom.set(item.chatRoomId, item);
        }
    }

    const map = new Map<string, string>();

    for (const [chatRoomId, contract] of latestByRoom) {
        map.set(chatRoomId, contract.contractId);
    }

    return map;
}

/**
 * Returns the latest contract for a given chat room, or null when the room has
 * no contract. Used to resolve a contract from a chat without knowing its id.
 */
export async function getContractByChatRoomService(
    chatRoomId: string
): Promise<ContractApiItem | null> {
    if (!chatRoomId) return null;

    const items = await fetchContracts();

    let latest: ContractApiItem | null = null;

    for (const item of items) {
        if (item.chatRoomId !== chatRoomId) continue;
        if (!latest || isMoreRecent(item, latest)) latest = item;
    }

    return latest;
}

/**
 * Statuses for which a contract is considered "finalized" enough to drive a
 * buyer's order form. A DRAFT/PENDING/REJECTED/REQUEST_CHANGE contract is still
 * being negotiated, so its terms must not pre-fill an order.
 */
const ORDER_READY_STATUSES: ReadonlySet<ContractStatus> = new Set([
    "ACCEPTED",
    "LOCKED",
]);

/**
 * Resolves the contract backing a demand order from its chat room, used when no
 * explicit contractId is in the URL. Returns the latest contract for the room
 * only when it is finalized (ACCEPTED/LOCKED), enriched with crop detail to
 * match {@link getContractByIdService}. Returns null otherwise.
 */
export async function getOrderContractByChatRoomService(
    chatRoomId: string
): Promise<ContractDetail | null> {
    const item = await getContractByChatRoomService(chatRoomId);

    if (!item || !ORDER_READY_STATUSES.has(item.status)) return null;

    let crop: CropDetail | undefined;

    if (item.postId) {
        const detail = await getCropDetailByPostIdAnyType(item.postId);
        crop = detail?.crop;
    }

    return { ...item, crop };
}

/* =========================================================================
 * CONTRACT STATUS ACTIONS (farmer: accept / reject / request change)
 * ========================================================================= */

export type ContractAction = "ACCEPT" | "REJECT" | "REQUEST_CHANGE";

export type ContractActionResult = {
    success: boolean;
    message?: string;
    contract?: ContractApiItem;
};

const CONTRACT_ACTION_PATH: Record<ContractAction, string> = {
    ACCEPT: "accept",
    REJECT: "reject",
    REQUEST_CHANGE: "request-change",
};

/**
 * Updates a contract's status from the farmer's review actions:
 *   - PATCH /contracts/{id}/accept          (no body)
 *   - PATCH /contracts/{id}/reject          (no body)
 *   - PATCH /contracts/{id}/request-change  (body: { message })
 */
export async function updateContractStatusService(
    contractId: string,
    action: ContractAction,
    requestChangeMessage?: string
): Promise<ContractActionResult> {
    if (!contractId) {
        return { success: false, message: "Missing contract id." };
    }

    const segment = CONTRACT_ACTION_PATH[action];

    try {
        const headers = await headerToken();

        const init: RequestInit = {
            method: "PATCH",
            cache: "no-store",
            headers,
        };

        if (action === "REQUEST_CHANGE") {
            init.body = JSON.stringify({ message: requestChangeMessage ?? "" });
        }

        const res = await fetch(
            `${CONTRACTS_ENDPOINT}/${contractId}/${segment}`,
            init
        );

        const data = await res.json().catch(() => null);

        if (!res.ok || data?.success === false) {
            return {
                success: false,
                message: apiErrorMessage(data, "Failed to update the contract."),
            };
        }

        const payload = data?.payload;
        const contract = payload?.items?.[0] ?? payload;

        return { success: true, message: data?.message, contract };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to update the contract." };
    }
}

/* =========================================================================
 * CONTRACT CREATION (buyer)
 * ========================================================================= */

/** Body sent to POST /contracts when a buyer creates a contract from a chat. */
export type CreateContractInput = {
    unitType: string;
    currencyCode: string;
    pricePerUnit: number;
    totalQuantity: number;
    depositAmount: number;
    deliveryDate: string;
    startDate: string;
    endDate: string;
    farmerId: string;
    postId: string;
    chatRoomId: string;
};

export type CreateContractResult = {
    success: boolean;
    message?: string;
    contractId?: string;
};

/**
 * Creates a new contract (buyer -> farmer) via POST /contracts.
 * Returns a structured result so the caller can toast and redirect.
 */
export async function createContractService(
    input: CreateContractInput
): Promise<CreateContractResult> {
    try {
        const headers = await headerToken();

        const res = await fetch(CONTRACTS_ENDPOINT, {
            method: "POST",
            cache: "no-store",
            headers,
            body: JSON.stringify(input),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || data?.success === false) {
            return {
                success: false,
                message: apiErrorMessage(data, "Failed to create contract."),
            };
        }

        return {
            success: true,
            message: data?.message,
            contractId: extractContractId(data),
        };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to create contract." };
    }
}

/** Body sent to PUT /contracts/{id} when a buyer edits an existing contract. */
export type UpdateContractInput = {
    unitType: string;
    currencyCode: string;
    pricePerUnit: number;
    totalQuantity: number;
    depositAmount: number;
    deliveryDate: string;
    startDate: string;
    endDate: string;
};

/**
 * Updates an existing contract via PUT /contracts/{id}. Used by the buyer to
 * revise terms after the farmer requested a change. The immutable links
 * (farmer/post/chat) are keyed by the path id, so only the terms are sent.
 */
export async function updateContractService(
    contractId: string,
    input: UpdateContractInput
): Promise<CreateContractResult> {
    if (!contractId) {
        return { success: false, message: "Missing contract id." };
    }

    try {
        const headers = await headerToken();

        const res = await fetch(`${CONTRACTS_ENDPOINT}/${contractId}`, {
            method: "PUT",
            cache: "no-store",
            headers,
            body: JSON.stringify(input),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || data?.success === false) {
            return {
                success: false,
                message: apiErrorMessage(data, "Failed to update the contract."),
            };
        }

        return {
            success: true,
            message: data?.message,
            contractId: extractContractId(data) ?? contractId,
        };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to update the contract." };
    }
}

/**
 * Fetches a single contract by id and enriches it with crop detail resolved
 * from its post (the contract response itself carries no crop name/type).
 * Returns null when the contract is missing or the request fails.
 */
export async function getContractByIdService(
    contractId: string
): Promise<ContractDetail | null> {
    const item = await apiGet<ContractApiItem>(
        `${CONTRACTS_ENDPOINT}/${contractId}`
    );

    if (!item?.contractId) return null;

    let crop: CropDetail | undefined;

    if (item.postId) {
        const detail = await getCropDetailByPostIdAnyType(item.postId);
        crop = detail?.crop;
    }

    return { ...item, crop };
}
