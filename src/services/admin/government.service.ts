import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";

export type UpdateGovernmentPasswordPayload = {
    usernameOrEmail: string;
    newPassword: string;
    confirmPassword: string;
};

export async function updateGovernmentPasswordService(
    payload: UpdateGovernmentPasswordPayload,
) {
    const headers = await headerToken();

    const response = await fetch(
        `${env.NEXT_BASE_API_URL}/users/governments/password`,
        {
            method: "PUT",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(
            result?.message ?? "Failed to update government password.",
        );
    }

    return result.payload ?? result;
}