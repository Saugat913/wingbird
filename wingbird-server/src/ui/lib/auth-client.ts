import { createAuthClient } from "better-auth/client";
import { jwtClient } from "better-auth/client/plugins";

const auth = createAuthClient({
  plugins: [jwtClient()],
});

export const authClient = {
  async loginWithGoogle(callbackURL?: string) {
    const origin = window.location.origin;

    await auth.signIn.social({
      provider: "google",
      callbackURL: callbackURL
        ? `${origin}/auth/success?callbackUrl=${encodeURIComponent(callbackURL)}`
        : `${origin}/auth/success`,
    });
  },

  async getSessionToken() {
    const { data, error } = await auth.getSession();

    if (error) throw new Error(error.message);
    if (!data?.session) throw new Error("Session not found");

    return data.session.token;
  },

  async getToken() {
    const { data, error } = await auth.token();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("JWT not found");

    return data.token;
  },
};