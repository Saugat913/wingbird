
import { useEffect, useState } from "hono/jsx";
import Logo from "../../components/logo";
import { authClient } from "../../lib/auth-client";
import { Script } from "vite-ssr-components/hono";


export function AuthSuccess() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState(
    "Authenticating your CLI session..."
  );

  useEffect(() => {
    async function sendTokenToCli() {
      console.log("effect started");
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl");
      try {
        
        if (!callbackUrl) {
          setStatus("error");
          setMessage(
            "Missing callback URL. Please try logging in again from the CLI."
          );
          return;
        }

        const sessionToken = await authClient.getSessionToken();

        const res = await fetch(`${callbackUrl}/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: sessionToken,
          }),
        });

        if (!res.ok) {
          throw new Error(`CLI callback failed: ${res.status}`);
        }

        setStatus("success");
        setMessage(
          "You can safely close this window and return to your terminal."
        );
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Authentication failed. Please try again."
        );
      }
    }

    sendTokenToCli();
  }, []);

  return (
    <main class="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center">
      <div class="w-full max-w-sm space-y-8 rounded-xl border border-neutral-100 bg-neutral-50/50 p-8 shadow-sm">
        <div class="flex justify-center">
          <Logo />
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl font-semibold tracking-tight text-neutral-900">
            {status === "loading" && "Linking your account..."}
            {status === "success" && "Authentication Successful!"}
            {status === "error" && "Something went wrong"}
          </h1>

          <p class="text-sm leading-relaxed text-neutral-500">
            {message}
          </p>
        </div>

        {status === "loading" && (
          <div class="flex justify-center">
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
          </div>
        )}
      </div>
    </main>
  );
}


export default function AuthSuccessPage(){
  return <>
  <div id="auth-success"></div>
  <Script src="/src/ui/client/auth-success.tsx" />
  </>
}