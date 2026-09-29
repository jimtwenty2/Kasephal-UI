import headerToken from "@/lib/headerToken";
import type {
  FarmerOfferApiResponse,
  FarmerOfferItem,
  FarmerOfferListPayload,
  FarmerOfferMutationResult,
} from "@/types/farmer-offer";
import {
  FARMER_OFFER_BASE_URL,
  buildFarmerOfferBody,
  extractFarmerOfferItem,
  getFarmerOfferErrorMessage,
  normalizeFarmerOfferListPayload,
  readFarmerOfferResponse,
} from "@/utils/farmerOffer.helpers";

const DEFAULT_OFFER_LIST: FarmerOfferListPayload = {
  items: [],
  pagination: { page: 1, size: 10, totalElements: 0, totalPages: 0 },
};

function missingBaseUrlResult<T>(payload: T) {
  return {
    success: false,
    message: "API base URL is not configured.",
    payload,
  };
}

function missingBaseUrlMutationResult(): FarmerOfferMutationResult {
  return { success: false, error: "API base URL is not configured." };
}

export async function getFarmerOffersByDemand(
  demandId: string,
  page = 1,
  size = 10,
): Promise<FarmerOfferApiResponse<FarmerOfferListPayload>> {
  if (!FARMER_OFFER_BASE_URL) {
    return missingBaseUrlResult({
      ...DEFAULT_OFFER_LIST,
      pagination: { page, size, totalElements: 0, totalPages: 0 },
    });
  }

  try {
    const res = await fetch(
      `${FARMER_OFFER_BASE_URL}/demands/${demandId}/offers?page=${page}&size=${size}`,
      { method: "GET", headers: await headerToken(), cache: "no-store" },
    );

    const response = await readFarmerOfferResponse<FarmerOfferListPayload>(res);

    return {
      ...response,
      payload: normalizeFarmerOfferListPayload(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch farmer offers.",
      payload: {
        ...DEFAULT_OFFER_LIST,
        pagination: { page, size, totalElements: 0, totalPages: 0 },
      },
    };
  }
}

export async function getMyFarmerOfferByDemand(
  demandId: string,
): Promise<FarmerOfferApiResponse<FarmerOfferItem | null>> {
  if (!FARMER_OFFER_BASE_URL) return missingBaseUrlResult(null);

  try {
    const res = await fetch(
      `${FARMER_OFFER_BASE_URL}/demands/${demandId}/offers/me`,
      { method: "GET", headers: await headerToken(), cache: "no-store" },
    );
    const response = await readFarmerOfferResponse(res);

    if (!res.ok || response.success === false) {
      return {
        success: false,
        status: res.status,
        message: getFarmerOfferErrorMessage(
          response,
          "Failed to fetch your offered.",
          res.status,
        ),
        payload: null,
      };
    }

    return {
      ...response,
      success: response.success ?? true,
      payload: extractFarmerOfferItem(response),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch your offered.",
      payload: null,
    };
  }
}

export async function createFarmerOffer(
  demandId: string,
  body: object,
): Promise<FarmerOfferMutationResult> {
  if (!FARMER_OFFER_BASE_URL) return missingBaseUrlMutationResult();

  const requestBody = buildFarmerOfferBody(body);

  try {
    const res = await fetch(
      `${FARMER_OFFER_BASE_URL}/demands/${demandId}/offers`,
      {
        method: "POST",
        headers: await headerToken(),
        body: JSON.stringify(requestBody),
      },
    );
    const response = await readFarmerOfferResponse(res);

    if (!res.ok || response.success === false) {
      return {
        success: false,
        error: getFarmerOfferErrorMessage(
          response,
          "Failed to create farmer offer.",
          res.status,
        ),
      };
    }

    return { success: true, data: response.payload ?? response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create farmer offer.",
    };
  }
}

export async function updateFarmerOffer(
  offerId: string,
  body: object,
): Promise<FarmerOfferMutationResult> {
  if (!FARMER_OFFER_BASE_URL) return missingBaseUrlMutationResult();

  const requestBody = buildFarmerOfferBody(body);

  try {
    const res = await fetch(`${FARMER_OFFER_BASE_URL}/offers/${offerId}`, {
      method: "PUT",
      headers: await headerToken(),
      body: JSON.stringify(requestBody),
    });
    const response = await readFarmerOfferResponse(res);

    if (!res.ok || response.success === false) {
      return {
        success: false,
        error: getFarmerOfferErrorMessage(
          response,
          "Failed to update farmer offer.",
          res.status,
        ),
      };
    }

    return { success: true, data: response.payload ?? response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update farmer offer.",
    };
  }
}

export async function deleteFarmerOffer(
  offerId: string,
): Promise<FarmerOfferMutationResult> {
  if (!FARMER_OFFER_BASE_URL) return missingBaseUrlMutationResult();

  try {
    const res = await fetch(`${FARMER_OFFER_BASE_URL}/offers/${offerId}`, {
      method: "DELETE",
      headers: await headerToken(),
    });
    const response = await readFarmerOfferResponse(res);

    if (!res.ok || response.success === false) {
      return {
        success: false,
        error: getFarmerOfferErrorMessage(
          response,
          "Failed to delete farmer offer.",
          res.status,
        ),
      };
    }

    return { success: true, data: response.payload ?? response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete farmer offer.",
    };
  }
}
