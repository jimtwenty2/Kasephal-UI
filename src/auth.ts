import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginService } from "./services/auth/auth.service";
import { env } from "./lib/env";
import { mapRoleToEnum, isTokenExpired, decodeJwt } from "./lib/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,

  providers: [
    Credentials({
      name: "credentials",

      credentials: {
        identifier: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const data = await loginService({
            identifier: credentials.identifier as string,
            password: credentials.password as string,
          });

          if (data.payload.requiresProfileSetup || !data.payload.accessToken) {
            throw new Error("Please complete your profile setup first.");
          }

          const decoded = decodeJwt(data.payload.accessToken);

          if (!decoded) {
            throw new Error("Invalid access token received.");
          }

          return {
            id: decoded.userId,
            email: decoded.sub,
            role: mapRoleToEnum(decoded.role),
            accessToken: data.payload.accessToken,
            requiresProfileSetup: data.payload.requiresProfileSetup,
            tokenExpiry: decoded.exp,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(
              error.message === "Authentication failed. Please try again."
                ? "Invalid email/phone number or password."
                : error.message,
            );
          }

          throw new Error("Invalid email/phone number or password.");
        }
      },
    }),
  ],

  secret: env.BETTER_AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.userId = user.id;
        token.requiresProfileSetup = user.requiresProfileSetup;
        token.tokenExpiry = user.tokenExpiry;
        token.email = user.email;
        return token;
      }

      if (isTokenExpired(token.tokenExpiry)) {
        token.error = "TokenExpired";
      }

      return token;
    },

    async session({ session, token }) {
      session.user.email = token.email as string;
      session.user.role = token.role;
      session.user.userId = token.userId;
      session.user.accessToken = token.accessToken;
      session.user.requiresProfileSetup = token.requiresProfileSetup;
      session.user.tokenExpiry = token.tokenExpiry;
      if (token.error) session.error = token.error;
      return session;
    },
  },
});
