import { Script } from "vite-ssr-components/hono";
import Logo from "../../components/logo";

interface LoginPageProps {
  callbackUrl?: string;
}

export default function LoginPage({
  callbackUrl,
}: LoginPageProps) {
  return (
    <>
      <main className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-ink px-12 py-10 text-white">
          <div className="grid-lines"></div>

          <div className="relative z-10 max-w-md space-y-6 text-left">
            <Logo class="h-40 w-40 invert" />

            <h2 className="text-3xl font-semibold tracking-tight text-white">Welcome back,</h2>
            <p className="text-lg text-neutral-400">
              Nice to see you again — log in to keep patching your Flutter apps in seconds.
            </p>

            <a href="/" className="btn btn-ghost-dark">← Back to homepage</a>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-12 md:px-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                Sign in
              </h1>

              <p className="text-sm text-neutral-500">
                Use your Google account to access your dashboard.
              </p>
            </div>

            <button
              id="google-login"
              data-callback-url={callbackUrl ?? ""}
              className="btn btn-primary flex w-full items-center justify-center"
            >
              <img
                src="/google_logo.svg"
                alt="Google"
                width="20"
                height="20"
              />
              Continue with Google
            </button>
          </div>
        </section>
      </main>
      <Script src="/src/ui/client/login.tsx" />
    </>
  );
}