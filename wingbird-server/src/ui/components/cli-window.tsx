import { useEffect, useState } from "hono/jsx";

export default function CliWindow() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : 1));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div class="z-10 flex w-full flex-col overflow-hidden rounded-xl border border-neutral-800 shadow-2xl">
      {/* Title Bar */}
      <div class="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3">
        <div class="flex gap-2">
          <span class="h-3 w-3 rounded-full bg-red-400"></span>
          <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
          <span class="h-3 w-3 rounded-full bg-green-400"></span>
        </div>

        <span class="text-xs font-mono text-neutral-400">
          wingbird
        </span>

        <div class="w-12"></div>
      </div>

      {/* Terminal */}
      <div class="flex h-[420px] flex-col gap-8 bg-[#0b0b0b] p-6 font-mono text-sm">
        <div
          class={`transition-all duration-500 ${
            step >= 1
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <div class="flex items-center gap-2">
            <span class="text-emerald-400">$</span>

            <code class="text-neutral-100">
              wingbird auth login
            </code>
          </div>

          <div class="mt-2 pl-4 text-neutral-400">
            Authorization successful.
            <br />
            Welcome, developer ✨
          </div>
        </div>

        <div
          class={`transition-all duration-500 ${
            step >= 2
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <div class="flex items-center gap-2">
            <span class="text-emerald-400">$</span>

            <code class="text-neutral-100">
              wingbird build release
            </code>
          </div>

          <div class="mt-2 pl-4 text-neutral-400">
            📦 Packaging production APK...
            <br />
            <span class="text-emerald-400">
              ✓ Release build complete (18.4 MB)
            </span>
          </div>
        </div>

        <div
          class={`transition-all duration-500 ${
            step >= 3
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <div class="flex items-center gap-2">
            <span class="text-emerald-400">$</span>

            <code class="text-neutral-100">
              wingbird build patch --base-apk-path=app-release.apk
            </code>
          </div>

          <div class="mt-2 pl-4 text-neutral-400">
            🔍 Analyzing binary differences...
            <br />
            Compressing patch...
            <br />
            <span class="text-sky-400">
              ⚡ Patch generated successfully! (240 KB)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}