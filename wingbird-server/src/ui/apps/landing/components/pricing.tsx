const betaFeatures = [
  "Android hot-fix patches",
  "Up to 3 releases per app",
  "Up to 3 patches per release",
  "Binary diff via bsdiff",
  "CLI-first workflow",
  "Self-hostable forever",
];

const proFeatures = [
  "Everything in Beta",
  "iOS hot-fix patches",
  "Team & org management",
  "Managed cloud hosting",
  "Priority support",
  "Release analytics",
];

export default function Pricing() {
  return (
    <section id="pricing" class="section section--surface">
      <div class="wrap">

        <div class="mb-16 text-center" data-reveal>
          <span class="eyebrow mx-auto" style="justify-content:center">Pricing</span>
          <h2 class="display mb-5">Simple. Free while in beta.</h2>
          <p class="lead mx-auto" style="max-width:44ch;text-align:center">
            Open-source and free to self-host forever. A managed tier ships with iOS support.
          </p>
        </div>

        <div class="mx-auto grid max-w-2xl grid-cols-1 gap-5 md:grid-cols-2" data-reveal>

          <div class="card pricing-featured flex flex-col p-8">
            <div class="mb-8">
              <div class="badge mb-5">
                <span class="animate-pulse h-1.5 w-1.5 rounded-full bg-zinc-800"></span>
                Current
              </div>
              <h3 class="mb-2 text-2xl font-bold tracking-tight text-zinc-900">Beta</h3>
              <div class="flex items-baseline gap-2 mb-2">
                <span class="text-5xl font-extrabold tracking-tight text-zinc-900">$0</span>
                <span class="font-mono text-xs text-zinc-400">/ month</span>
              </div>
              <p class="text-xs leading-relaxed text-zinc-400">
                No credit card. No lock-in. Free until iOS ships.
              </p>
            </div>

            <ul class="mb-8 flex flex-col gap-3 flex-1">
              {betaFeatures.map((f) => (
                <li key={f} class="flex items-center gap-3 text-sm text-zinc-700">
                  <span class="font-mono text-xs font-semibold text-zinc-900">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="https://github.com/Saugat913/wingbird"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary w-full justify-center"
            >
              Get started free →
            </a>
          </div>

          <div class="card flex flex-col p-8 opacity-50">
            <div class="mb-8">
              <div class="badge mb-5">
                <span class="font-mono text-[10px]">Coming soon</span>
              </div>
              <h3 class="mb-2 text-2xl font-bold tracking-tight text-zinc-900">Pro</h3>
              <div class="flex items-baseline gap-2 mb-2">
                <span class="text-5xl font-extrabold tracking-tight text-zinc-200">—</span>
              </div>
              <p class="text-xs leading-relaxed text-zinc-400">
                Pricing announced when iOS support ships.
              </p>
            </div>

            <ul class="mb-8 flex flex-col gap-3 flex-1">
              {proFeatures.map((f) => (
                <li key={f} class="flex items-center gap-3 text-sm text-zinc-400">
                  <span class="font-mono text-xs text-zinc-300">·</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="https://github.com/Saugat913/wingbird"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost w-full justify-center"
            >
              Watch for updates ↗
            </a>
          </div>
        </div>

        <p class="mt-10 text-center font-mono text-xs text-zinc-400" data-reveal>
          Self-hosting is free forever —{" "}
          <a
            href="https://github.com/Saugat913/wingbird"
            target="_blank"
            rel="noopener noreferrer"
            class="text-zinc-600 underline underline-offset-4 hover:text-zinc-900 transition-colors"
          >
            view source on GitHub ↗
          </a>
        </p>

      </div>
    </section>
  );
}
