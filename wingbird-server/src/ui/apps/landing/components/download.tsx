import { Script } from "vite-ssr-components/hono";
import { AppleIcon, LinuxIcon, WindowsIcon, CopyIcon } from "./header";

const platforms = [
  {
    name: "macOS",
    arch: "Apple Silicon · Intel",
    icon: <AppleIcon class="w-5 h-5 text-zinc-800" />,
    cmd: "curl -fsSL https://github.com/Saugat913/wingbird/releases/latest/download/wingbird-darwin-arm64 | tar -xz -C /usr/local/bin",
  },
  {
    name: "Linux",
    arch: "x86_64 · aarch64",
    icon: <LinuxIcon class="w-5 h-5 text-zinc-800" />,
    cmd: "curl -fsSL https://github.com/Saugat913/wingbird/releases/latest/download/wingbird-linux-x86_64 | tar -xz -C /usr/local/bin",
  },
  {
    name: "Windows",
    arch: "x86_64",
    icon: <WindowsIcon class="w-5 h-5 text-zinc-800" />,
    cmd: "curl -fsSL https://github.com/Saugat913/wingbird/releases/latest/download/wingbird-windows-x86_64 | tar -xz",
  },
];

export default function Download() {
  return (
    <section id="install" class="section">
      <div class="wrap--block wrap">

        <div class="mb-16 flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div>
            <span class="eyebrow">Install</span>
            <h2 class="display">One command to install.</h2>
          </div>
          <a
            href="https://github.com/Saugat913/wingbird/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            class="mono text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            All releases ↗
          </a>
        </div>

        <div class="flex flex-col divide-y divide-zinc-100" data-reveal>
          {platforms.map((p) => (
            <div key={p.name} class="grid grid-cols-1 items-center gap-5 py-7 md:grid-cols-[200px_1fr]">
              <div class="flex items-center gap-4">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
                  {p.icon}
                </span>
                <div>
                  <p class="font-semibold tracking-tight text-zinc-900">{p.name}</p>
                  <p class="mono text-xs text-zinc-400 mt-0.5">{p.arch}</p>
                </div>
              </div>

              <button
                data-copy={p.cmd}
                class="term flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:border-zinc-600"
              >
                <code class="t-cyan no-scrollbar overflow-x-auto whitespace-nowrap text-[12px]">{p.cmd}</code>
                <span data-copy-icon class="flex shrink-0 items-center t-dim transition-colors">
                  <CopyIcon class="h-3.5 w-3.5" />
                </span>
              </button>
            </div>
          ))}
        </div>

      </div>
      <Script src="/src/ui/client/copy-cmd.tsx" />
    </section>
  );
}
