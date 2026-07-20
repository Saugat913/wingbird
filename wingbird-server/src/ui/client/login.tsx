import { authClient } from "../lib/auth-client";

const btn = document.getElementById("google-login") as HTMLButtonElement;
if (btn) {
  btn.addEventListener("click", async () => {
    const callbackUrl = btn.dataset.callbackUrl;
    try {
      await authClient.loginWithGoogle(callbackUrl || undefined);
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  });
}