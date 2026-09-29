"use server";

import { signIn,signOut } from "@/auth";
import { auth } from "@/auth";
import { loginSchema, LoginFormData } from "@/schema/login.schema";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { ApiValidationError } from "@/types/auth/api-error";
import { loginService, logoutService } from "@/services/auth/auth.service";
import { decodeJwt, mapRoleToEnum } from "@/lib/jwt";
import { UserRole } from "@/types/user-role";

type ResumeStep = 2 | 3 | 5;

export type LoginActionResult =
  | { success: true }
  | {
      success: true;
      resumeProfileSetup: true;
      profileSetupToken?: string;
      resumeStep: ResumeStep;
      role: UserRole;
      identifier: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

function getAuthErrorMessage(error: unknown) {
  if (error instanceof AuthError) {
    const causeMessage = error.cause?.err?.message;

    if (causeMessage) {
      return causeMessage;
    }

    if (error.type === "CredentialsSignin") {
      return "Invalid email or password.";
    }

    if (error.type === "CallbackRouteError") {
      return "Invalid email or password.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Login failed. Please try again.";
}

export async function loginAction(
  values: LoginFormData
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const loginResult = await loginService({
      identifier: parsed.data.identifier,
      password: parsed.data.password,
    });

    if (loginResult.payload.requiresProfileSetup) {
      const profileSetupToken = loginResult.payload.profileSetupToken;
      const resumeStep =
        loginResult.payload.nextStep === 2
          ? 2
          : loginResult.payload.nextStep === 5
            ? 5
            : 3;

      if (resumeStep !== 2 && !profileSetupToken) {
        return {
          success: false,
          error: "Profile setup token is missing. Please try again.",
        };
      }

      const decoded = profileSetupToken ? decodeJwt(profileSetupToken) : null;
      const rawRole = decoded?.role ?? loginResult.payload.role;

      if (!rawRole) {
        return {
          success: false,
          error: "Profile setup role is missing. Please try again.",
        };
      }

      return {
        success: true,
        resumeProfileSetup: true,
        profileSetupToken,
        resumeStep,
        role: mapRoleToEnum(rawRole),
        identifier: parsed.data.identifier,
      };
    }

    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true };
  }  catch (err: unknown) {
  if (isRedirectError(err)) {
    throw err;
  }

  if (err instanceof ApiValidationError) {
    return {
      success: false,
      error: err.message,
      fieldErrors: err.errors,
    };
  }

  return {
    success: false,
    error: getAuthErrorMessage(err),
  };
}
}

export async function logoutAction() {
  const session = await auth();
  const accessToken = session?.user?.accessToken;

  if (accessToken) {
    const result = await logoutService(accessToken);

    if (!result.success) {
      
    }
  }

  await signOut({ redirectTo: "/login" });
}
