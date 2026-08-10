import CliWindow from "../../../components/cli-window";

export default function Hero() {
  return (
    <section class="relative overflow-hidden bg-white pt-20 pb-16 lg:pt-28 lg:pb-28">
      <div class="grid-lines"></div>

      <div class="wrap--block wrap relative z-10">
        {/* ── Open Full-width Headline Content ── */}
        <div class="w-full text-left" data-reveal>
          <h1 class="display display--hero mb-6 max-w-5xl">
            Every mistake deserves<br />
            <span class="text-zinc-400">an instant <span class="sketch-underline text-zinc-900 font-extrabold">second chance</span>.</span>
          </h1>

          <p class="lead mb-10 max-w-3xl">
            Everyone makes mistakes in production — Wingbird is the platform to correct them. Instantly patch live Flutter apps with binary diffing, bypassing app store review queues and waiting times completely.
          </p>

          <div class="flex flex-wrap items-center justify-start gap-4 mb-16">
            <a href="#how-it-works" class="btn btn-primary px-7 py-3 text-base">
              See how it works <span aria-hidden="true">→</span>
            </a>
            <a
              href="https://github.com/Saugat913/wingbird"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost px-7 py-3 text-base"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* ── 3D Slanted Terminal Showcase Container ── */}
        <div class="relative w-full pt-4 [perspective:1400px]" data-reveal>
          {/* Layered background shadow cards for 3D slant stack effect */}
          <div
            class="absolute inset-x-4 top-10 bottom-2 rounded-2xl border border-zinc-200/60 bg-zinc-100/60 [transform:rotateX(6deg)_rotateY(-12deg)_rotateZ(2deg)]"
          ></div>
          <div
            class="absolute inset-x-2 top-6 bottom-1 rounded-2xl border border-zinc-200 bg-zinc-50/90 [transform:rotateX(4deg)_rotateY(-8deg)_rotateZ(1deg)]"
          ></div>

          {/* Main Slanted CLI Window */}
          <div
            class="relative rounded-xl overflow-hidden shadow-2xl shadow-zinc-950/20 border border-zinc-800 bg-black transition-transform duration-500 [transform:rotateX(3deg)_rotateY(-5deg)_rotateZ(0.5deg)] hover:[transform:rotateX(0deg)_rotateY(0deg)_rotateZ(0deg)]"
          >
            <CliWindow />
          </div>
        </div>
      </div>
    </section>
  );
}
