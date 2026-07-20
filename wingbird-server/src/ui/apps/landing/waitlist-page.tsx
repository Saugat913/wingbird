import { Script } from "vite-ssr-components/hono";
import Logo from "../../components/logo";


const features = [
  {
    title: "Secure auth",
    description:
      "Authenticate securely via the CLI to manage your project permissions instantly.",
  },
  {
    title: "Release tracking",
    description:
      "Keep your production base APKs archived safely so differences can be calculated cleanly.",
  },
  {
    title: "Instant hot-fixes",
    description:
      "Generate lightweight patch files in seconds to fix runtime bugs without app store delays.",
  },
];

export default function Home() {
  return (
    <>
      <header class="w-full border-b border-neutral-200">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div class="flex items-end gap-2">
                <Logo />

            <span
              class="text-xl font-semibold tracking-tight"
              style="font-family:'Space Grotesk',sans-serif"
            >
              Wingbird
            </span>
          </div>
        </div>
      </header>

      <main>
        <section class="mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          <div class="flex flex-col justify-center space-y-8">
            <h1 class="text-5xl font-bold tracking-tight text-neutral-900 md:text-6xl">
              Everyone makes mistakes.
            </h1>

            <p class="text-lg leading-relaxed">
              <span class="text-neutral-500">
                Every developer deserves a chance to correct their mistakes.
              </span>

              <br />

              <span class="text-neutral-700">
                Wingbird
              </span>{" "}
              is a platform that helps you correct bugs in your Flutter apps
              with ease.
            </p>

            <form class="flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                class="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition"
              />

              <button
                class="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                type="submit"
              >
                Join Waitlist
              </button>
            </form>
          </div>

          <div class="relative flex items-center">
            <img
              src="/logo_flipped.png"
              alt="Wingbird"
              width="500"
              height="500"
              class="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 opacity-20"
            />

            <div id="cli-window" class="relative z-10 w-full"></div>
          </div>
        </section>

        <section class="mx-auto max-w-7xl border-t border-neutral-200 px-6 py-20">
          <div class="mb-14 max-w-2xl">
            <h2 class="text-3xl font-semibold tracking-tight text-neutral-900">
              Engineered for Flutter developers
            </h2>

            <p class="mt-3 text-neutral-500">
              Fix bugs in real time without forcing users to download massive
              updates.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                class={`flex flex-col gap-3 border-neutral-200 py-8 md:px-8 ${
                  i !== 0 ? "md:border-l" : ""
                }`}
              >
                <span class="text-xs text-neutral-400">
                  0{i + 1}
                </span>

                <h3 class="text-lg font-medium text-neutral-900">
                  {feature.title}
                </h3>

                <p class="text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer class="border-t border-neutral-200">
        <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <div class="flex flex-col items-center gap-2 md:items-start">
            <div class="flex items-end gap-2">
              <Logo />

              <span
                class="font-semibold"
                style="font-family:'Space Grotesk',sans-serif"
              >
                Wingbird
              </span>
            </div>

            <p class="text-xs text-neutral-500">
              © {new Date().getFullYear()} Wingbird. All rights reserved.
            </p>
          </div>

          <a
            href="https://github.com/Saugat913/wingbird"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-neutral-600 transition hover:text-neutral-900"
          >
            GitHub
          </a>
        </div>
      </footer>

      <Script src="/src/ui/client/cli-window.tsx"></Script>
    </>
  );
}