import headerToken from "@/lib/headerToken";
import type {
  CropDemandListParams,
  CropDemandMutationResult,
  CropDemandPost,
  CropDemandRequestBody,
  GetCropDemandResult,
  GetCropDemandsResult,
  UpdateCropDemandStatusBody,
} from "@/types/crop-demand";
import {
  BASE_URL,
  DEFAULT_PAGINATION,
  buildCropDemandRequestBody,
  buildListUrl,
  extractItem,
  extractItems,
  extractPagination,
  getApiErrorMessage,
  getErrorMessage,
  readJson,
} from "@/utils/Crop-demand.helpers";

export async function getCropDemands(
  params: CropDemandListParams = {},
): Promise<GetCropDemandsResult> {
  try {
    const res = await fetch(buildListUrl("/crop-demands", params), {
      headers: await headerToken(),
      cache: "no-store",
    });
    const json = await readJson(res);

    if (!res.ok || json.success === false) {
      return {
        data: [],
        pagination: DEFAULT_PAGINATION,
        error: getApiErrorMessage(
          json,
          "Failed to fetch crop demands.",
          res.status,
        ),
      };
    }

    const data = extractItems(json.payload);

    return {
      data,
      pagination: extractPagination(json.payload, params, data.length),
    };
  } catch (error) {
    return {
      data: [],
      pagination: DEFAULT_PAGINATION,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to fetch crop demands.")
          : "Failed to fetch crop demands.",
    };
  }
}

export async function getCropDemandsOwn(
  params: CropDemandListParams = {},
): Promise<GetCropDemandsResult> {
  try {
    const url = buildListUrl("/crop-demands/me", params);

    const headers = await headerToken();

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    const json = await readJson(res);

    if (!res.ok || json.success === false) {
      return {
        data: [],
        pagination: DEFAULT_PAGINATION,
        error: getApiErrorMessage(
          json,
          "Failed to fetch your crop demands.",
          res.status,
        ),
      };
    }

    const data = extractItems(json.payload);

    return {
      data,
      pagination: extractPagination(json.payload, params, data.length),
    };
  } catch (error) {
    return {
      data: [],
      pagination: DEFAULT_PAGINATION,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to fetch your crop demands.")
          : "Failed to fetch your crop demands.",
    };
  }
}

function matchesUserProfile(
  demand: CropDemandPost,
  userId: string,
  aliases: string[] = [],
) {
  const source = demand as typeof demand & Record<string, unknown>;
  const ids = [
    source.userId,
    source.buyerId,
    source.createdBy,
    source.createdById,
  ].map((value) => String(value ?? "").toLowerCase());
  const names = [demand.buyerName, demand.createdBy].map((value) =>
    String(value ?? "").toLowerCase(),
  );
  const normalizedUserId = userId.toLowerCase();
  const normalizedAliases = aliases
    .map((alias) => alias.trim().toLowerCase())
    .filter(Boolean);

  return (
    ids.includes(normalizedUserId) ||
    normalizedAliases.some((alias) => names.includes(alias))
  );
}

async function fetchCropDemandsByUserEndpoint(
  path: string,
  params: CropDemandListParams,
): Promise<GetCropDemandsResult | null> {
  try {
    const url = buildListUrl(path, params);
    const res = await fetch(url, {
      headers: await headerToken(),
      cache: "no-store",
    });
    const json = await readJson(res);

    if (!res.ok || json.success === false) return null;

    const data = extractItems(json.payload);

    return {
      data,
      pagination: extractPagination(json.payload, params, data.length),
    };
  } catch {
    return null;
  }
}

export async function getCropDemandsByUserId(
  userId: string,
  params: CropDemandListParams = {},
  aliases: string[] = [],
): Promise<GetCropDemandsResult> {
  const encodedUserId = encodeURIComponent(userId);
  const endpointResult =
    (await fetchCropDemandsByUserEndpoint(
      `/crop-demands/users/${encodedUserId}`,
      params,
    )) ??
    (await fetchCropDemandsByUserEndpoint(
      `/users/${encodedUserId}/crop-demands`,
      params,
    ));

  if (endpointResult) return endpointResult;

  const result = await getCropDemands({
    ...params,
    page: params.page ?? 1,
    size: params.size ?? 100,
  });

  if (result.error) return result;

  const data = result.data.filter((demand) =>
    matchesUserProfile(demand, userId, aliases),
  );

  return {
    ...result,
    data,
    pagination: {
      ...result.pagination,
      totalElements: data.length,
      totalPages: Math.max(1, Math.ceil(data.length / result.pagination.size)),
    },
  };
}

export async function getCropDemandByPostId(
  postId: string,
): Promise<GetCropDemandResult> {
  try {
    const headers = await headerToken();
    const paths = [`/crop-demands/post/${postId}`, `/crop-demands/${postId}`];

    for (const path of paths) {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers,
        cache: "no-store",
      });
      const json = await readJson(res);

      if (res.ok && json.success !== false) {
        return { data: extractItem(json.payload) };
      }
    }

    return {
      data: null,
      error: "Failed to fetch crop demand.",
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to fetch crop demand.")
          : "Failed to fetch crop demand.",
    };
  }
}

export async function createCropDemand(
  body: CropDemandRequestBody,
): Promise<CropDemandMutationResult> {
  try {
    const requestBody = buildCropDemandRequestBody(body);
    const res = await fetch(`${BASE_URL}/crop-demands`, {
      method: "POST",
      headers: await headerToken(),
      body: JSON.stringify(requestBody),
    });
    const json = await readJson(res);

    if (!res.ok || json.success === false) {
      return {
        success: false,
        error: getApiErrorMessage(
          json,
          "Failed to create crop demand.",
          res.status,
        ),
      };
    }

    return { success: true, data: extractItem(json.payload) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to create crop demand.")
          : "Failed to create crop demand.",
    };
  }
}

export async function updateCropDemand(
  postId: string,
  body: CropDemandRequestBody,
): Promise<CropDemandMutationResult> {
  try {
    const requestBody = buildCropDemandRequestBody(body);
    const res = await fetch(`${BASE_URL}/crop-demands/${postId}`, {
      method: "PUT",
      headers: await headerToken(),
      body: JSON.stringify(requestBody),
    });
    const json = await readJson(res);

    if (!res.ok || json.success === false) {
      return {
        success: false,
        error: getApiErrorMessage(
          json,
          "Failed to update crop demand.",
          res.status,
        ),
      };
    }

    return { success: true, data: extractItem(json.payload) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to update crop demand.")
          : "Failed to update crop demand.",
    };
  }
}

export async function updateCropDemandStatus(
  postId: string,
  body: UpdateCropDemandStatusBody,
): Promise<CropDemandMutationResult> {
  try {
    const res = await fetch(`${BASE_URL}/crop-demands/${postId}/status`, {
      method: "PATCH",
      headers: await headerToken(),
      body: JSON.stringify({ status: body.status }),
    });
    const json = await readJson(res);

    if (!res.ok || json.success === false) {
      return {
        success: false,
        error: getApiErrorMessage(
          json,
          "Failed to update crop demand status.",
          res.status,
        ),
      };
    }

    return { success: true, data: extractItem(json.payload) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to update crop demand status.")
          : "Failed to update crop demand status.",
    };
  }
}

export async function deleteCropDemand(
  postId: string,
): Promise<CropDemandMutationResult> {
  try {
    const res = await fetch(`${BASE_URL}/crop-demands/${postId}`, {
      method: "DELETE",
      headers: await headerToken(),
    });
    const json = await readJson(res);

    if (!res.ok || json.success === false) {
      return {
        success: false,
        error: getApiErrorMessage(
          json,
          "Failed to delete crop demand.",
          res.status,
        ),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to delete crop demand.")
          : "Failed to delete crop demand.",
    };
  }
}
