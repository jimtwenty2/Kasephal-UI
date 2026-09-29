"use server";

import { auth } from "@/auth";
import { env } from "@/lib/env";

type UpdatePasswordPayload = {
    usernameOrEmail: string;
    newPassword: string;
    confirmPassword: string;
};

export async function updateGovernmentPasswordAction(
    data: UpdatePasswordPayload,
) {
    try {
        const session = await auth();

        if (!session?.user?.accessToken) {
            return { success: false, error: "Unauthorized" };
        }

        const response = await fetch(
            `${env.NEXT_BASE_API_URL}/users/governments/password`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                    email: data.usernameOrEmail,        // ← was usernameOrEmail
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword, // ← was missing
                }),
            },
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
            return {
                success: false,
                error: result.message ?? result.detail ?? "Failed to update password",
            };
        }

        return { success: true, message: result.message };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Something went wrong",
        };
    }
}