import { Script } from "vite-ssr-components/hono";

export default function ScrollFlow() {
  return (
    <section id="how-it-works" class="section section--surface">
      <div class="wrap">
        <div class="mb-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <span class="label">How it works</span>
            <h2 class="display">From release to hot-fix on next launch.</h2>
          </div>
          <p class="lead" style="margin-bottom:0">
            Scroll the pipeline — every step runs in your CLI or inside your app. No review queue, no waiting on the store.
          </p>
        </div>

        <div id="scroll-flow" data-reveal></div>
      </div>
      <Script src="/src/ui/client/scroll-flow.tsx"></Script>
    </section>
  );
}
