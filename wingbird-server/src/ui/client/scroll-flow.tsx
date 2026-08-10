import { render } from "hono/jsx/dom";
import { useEffect, useRef, useState } from "hono/jsx";

const steps = [
  {
    n: "01",
    title: "Push a release from the CLI",
    desc: "wingbird release builds your APK, archives it as the new base, and registers it on the server.",
    cmd: "$ wingbird release android production",
    lines: [
      "[➜] Building release APK...",
      "[✔] Upload complete (id: upl_48a92f1)",
      "[✔] Release created (ID: rel_99a82b) · base APK archived",
    ],
    accentBg: "bg-white",
    accentText: "text-black",
  },
  {
    n: "02",
    title: "Generate the patch at the CLI",
    desc: "wingbird patch diffs the new build against the archived base with bsdiff, producing a tiny artifact.",
    cmd: "$ wingbird patch android production",
    lines: [
      "[➜] Downloading base release APK...",
      "[➜] Generating patch diff for arm64-v8a...",
      "[✔] 1 patch artifact(s) created",
    ],
    accentBg: "bg-white",
    accentText: "text-black",
  },
  {
    n: "03",
    title: "App applies it on next start",
    desc: "Your Flutter app fetches the patch at launch and hot-applies the diff in milliseconds.",
    cmd: "app:start → fetch patch → apply",
    lines: [
      "[➜] Checking wingbird server...",
      "[➜] New patch found (v1.0.5, ~180 KB)",
      "[✔] Patch applied — hot-fix live",
    ],
    accentBg: "bg-white",
    accentText: "text-black",
  },
];

function PhoneScreen({ active }: { active: number }) {
  const patching = active >= 2;
  return (
    <div class="mx-auto w-full max-w-[280px] border border-neutral-800 bg-neutral-900 p-2">
      <div class="relative aspect-[9/19] overflow-hidden bg-white">
        {/* Dynamic island */}
        <div class="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 bg-black"></div>

        <div class="flex h-full flex-col">
          <div class="px-5 pb-2 pt-8">
            <div class="flex items-center justify-between font-mono text-[9px] text-neutral-600">
              <span>9:41</span>
              <span>▲ 5G</span>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-sm font-bold text-black" style="font-family:'Inter',sans-serif;letter-spacing:-0.02em">Wingbird</span>
              <span class="border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-black">
                {active >= 2 ? "v1.0.5" : active === 1 ? "v1.0.5 · sync" : "v1.0.4"}
              </span>
            </div>
          </div>

          <div class="flex-1 space-y-2 px-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} class={`border px-3 py-2.5 ${i === 0 ? "border-neutral-300" : "border-neutral-200"}`}>
                <div class="h-1.5 w-3/4 bg-neutral-200"></div>
                <div class="mt-1.5 h-1.5 w-1/2 bg-neutral-100"></div>
                <div class="mt-2 flex gap-1">
                  <span class="h-1 w-6 bg-neutral-300"></span>
                  <span class="h-1 w-3 bg-neutral-200"></span>
                  <span class="h-1 w-4 bg-neutral-200"></span>
                </div>
              </div>
            ))}
          </div>

          <div class="flex justify-around border-t border-neutral-200 px-5 py-3">
            {[0, 1, 2].map((i) => (
              <span key={i} class={`h-2.5 w-7 ${i === 0 ? "bg-black" : "bg-neutral-200"}`}></span>
            ))}
          </div>
        </div>

        {patching && (
          <div class="absolute inset-0 z-10 flex items-end bg-white/80 p-4 backdrop-blur-[2px]">
            <div class="w-full border border-neutral-800 bg-black p-3 font-mono text-[10px] leading-5 text-neutral-300">
              <div class="pb-1 text-neutral-600">app:start → wingbird.sync()</div>
              <div class="pf-line pf-1" style="color:var(--term-cyan)">[➜] Checking wingbird server...</div>
              <div class="pf-line pf-2" style="color:var(--term-cyan)">[➜] Patch v1.0.5 found (~180 KB)</div>
              <div class="pf-line pf-3" style="color:var(--term-yellow)">[⧗] Downloading + verifying sha256...</div>
              <div class="pf-line pf-4" style="color:var(--term-yellow)">[⧗] Applying bsdiff patch...</div>
              <div class="pf-line pf-5" style="color:var(--term-emerald)">[✔] libapp.so updated → restarting</div>
              <div class="mt-2 h-0.5 w-full overflow-hidden bg-neutral-800">
                <div class="pf-bar h-full" style="background:var(--term-emerald)"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScrollFlowClient() {
  const [active, setActive] = useState(-1);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vp = el.clientHeight * 0.72;
        let idx = -1;
        for (let i = 0; i < refs.current.length; i++) {
          const step = refs.current[i];
          if (!step) continue;
          if (step.offsetTop + step.offsetHeight / 2 - el.scrollTop < vp) idx = i;
        }
        setActive(idx);
      });
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div class="overflow-hidden border border-neutral-200 bg-white">
      {/* Toolbar */}
      <div class="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-5 py-3 font-mono text-[11px] text-neutral-400">
        <span class="flex items-center gap-2">
          <span class="flex gap-1">
            <span class="h-2 w-2 bg-neutral-300"></span>
            <span class="h-2 w-2 bg-neutral-300"></span>
            <span class="h-2 w-2 bg-neutral-300"></span>
          </span>
          wingbird · pipeline
        </span>
        <span class="flex items-center gap-1.5 text-neutral-400">
          scroll <span class="animate-bounce">↓</span>
        </span>
      </div>

      <div ref={scroller} class="grid h-[70vh] max-h-[640px] grid-cols-1 overflow-y-auto md:grid-cols-[1fr_300px]">
        {/* Steps column */}
        <div class="relative md:border-r md:border-neutral-100">
          {/* Progress track */}
          <div class="absolute left-[15px] top-0 bottom-0 w-px bg-neutral-100"></div>
          <div
            class="absolute left-[15px] top-0 w-px bg-neutral-400 transition-[height] duration-500"
            style={{ height: active < 0 ? 0 : `${((active + 1) / steps.length) * 100}%` }}
          ></div>

          <div class="space-y-16 py-8">
            {steps.map((s, i) => (
              <div
                key={s.n}
                ref={(el) => { refs.current[i] = el; }}
                class={`relative min-h-[58vh] grid grid-cols-1 gap-6 pl-12 pr-6 transition-opacity duration-500 md:pr-10 ${
                  active >= i ? "opacity-100" : "opacity-30"
                }`}
              >
                {/* Step circle */}
                <span
                  class={`mono absolute left-0 top-1 flex h-8 w-8 items-center justify-center border text-[10px] font-semibold transition-colors duration-500 ${
                    active >= i
                      ? "border-neutral-700 bg-black text-white"
                      : "border-neutral-200 bg-white text-neutral-500"
                  }`}
                >
                  {s.n}
                </span>

                <div>
                  <h3 class="text-lg font-semibold text-black" style="font-family:'Inter',sans-serif;letter-spacing:-0.02em">{s.title}</h3>
                  <p class="mt-2 text-sm leading-relaxed text-neutral-500" style="font-family:'Inter',sans-serif">{s.desc}</p>
                </div>

                {/* Command block */}
                <div class="border border-neutral-900 bg-black p-4 font-mono text-xs leading-6 overflow-x-auto">
                  <div class="whitespace-nowrap" style="color:var(--term-cyan)">{s.cmd}</div>
                  <div class="mt-2 space-y-0.5 whitespace-nowrap">
                    {s.lines.map((l) => (
                      <div
                        key={l}
                        class={`text-neutral-400 transition-opacity duration-500 delay-300 ${active >= i ? "opacity-100" : "opacity-0"}`}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phone preview column */}
        <div class="sticky top-0 flex h-fit items-center p-8 md:h-[70vh] md:max-h-[640px]">
          <PhoneScreen active={active} />
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById("scroll-flow");
if (root) {
  render(<ScrollFlowClient />, root);
}
