const steps = [
  {
    n: "01",
    title: "Push a release",
    desc: "Build your APK, archive it as the base binary, register the release. One command handles everything.",
    cmd: "wingbird release android production",
    out: [
      { cls: "t-cyan",    t: "[➜] Building release APK..." },
      { cls: "t-emerald", t: "[✔] Upload complete  ·  upl_48a92f1" },
      { cls: "t-emerald", t: "[✔] Release created  ·  rel_99a82b" },
    ],
  },
  {
    n: "02",
    title: "Generate a patch",
    desc: "Diff the new libapp.so against the archived base with bsdiff. The artifact is typically under 200 KB.",
    cmd: "wingbird patch android production",
    out: [
      { cls: "t-cyan",    t: "[➜] Downloading base APK..." },
      { cls: "t-cyan",    t: "[➜] Diffing arm64-v8a..." },
      { cls: "t-emerald", t: "[✔] 1 patch artifact created  ·  ~180 KB" },
    ],
  },
  {
    n: "03",
    title: "Users get it silently",
    desc: "Your Flutter app calls wingbird.init() at startup, downloads the patch, and applies it in milliseconds.",
    cmd: "app:start → wingbird.init()",
    out: [
      { cls: "t-cyan",  t: "[➜] Patch v1.0.5 found  ·  ~180 KB" },
      { cls: "t-amber", t: "[⧗] Applying bsdiff patch..." },
      { cls: "t-emerald", t: "[✔] libapp.so updated — hot-fix live" },
    ],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" class="section section--surface">
      <div class="wrap">

        <div class="mb-16 flex flex-wrap items-end justify-between gap-6" data-reveal>
          <div>
            <span class="eyebrow">How it works</span>
            <h2 class="display">Three commands.<br />No review queue.</h2>
          </div>
          <p class="lead" style="max-width:38ch;margin-bottom:0">
            CLI-first by design. No dashboard to babysit — just push, diff, and ship.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          {steps.map((s) => (
            <div key={s.n} data-reveal class="card grid grid-cols-1 gap-8 p-8 md:grid-cols-2 md:p-10">
              <div class="flex flex-col justify-center gap-4">
                <div class="flex items-center gap-4">
                  <span class="step-num">{s.n}</span>
                  <h3 class="text-xl font-bold tracking-tight text-zinc-900">{s.title}</h3>
                </div>
                <p class="text-sm leading-relaxed text-zinc-500">{s.desc}</p>
              </div>

              <div class="term p-5">
                <div class="term-bar" style="padding:0 0 10px 0;margin-bottom:10px">
                  <span class="term-dot bg-zinc-700"></span>
                  <span class="term-dot bg-zinc-700"></span>
                  <span class="term-dot bg-zinc-700"></span>
                </div>
                <div class="px-1">
                  <div class="mb-3">
                    <span class="t-dim">$ </span>
                    <span class="t-cmd">{s.cmd}</span>
                  </div>
                  <div class="flex flex-col gap-1">
                    {s.out.map((l) => (
                      <span key={l.t} class={l.cls}>{l.t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
