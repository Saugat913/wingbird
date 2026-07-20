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
        <aside className="hidden lg:flex flex-col justify-center items-center bg-neutral-900 px-12 py-10 text-white">
          <div className="max-w-sm space-y-8">
            <Logo/>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome to Wingbird
              </h2>

              <p className="text-neutral-400 leading-relaxed">
                Start delivering secure over-the-air updates for your Flutter
                apps.
              </p>
          </div>
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
              className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
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