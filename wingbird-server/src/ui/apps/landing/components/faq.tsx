const faqs = [
  {
    q: "How do patches work without app store reviews?",
    a: "Wingbird extracts libapp.so from your release APK and computes a bsdiff against the archived base build. Your Flutter app calls wingbird.sync() at startup, downloads the patch (~100–300 KB), and applies the diff in-process. Only the compiled Dart binary is updated — no native code changes, so no store review is triggered.",
  },
  {
    q: "Is it really free? What's the catch?",
    a: "No catch. The CLI and server are Apache-2.0 open-source and self-hostable for free, forever. The managed cloud service is free during beta. A Pro tier is planned alongside iOS support — self-hosting will always remain free.",
  },
  {
    q: "Which platforms and architectures are supported?",
    a: "Android (arm64-v8a, armeabi-v7a, x86_64) is fully supported today. Wingbird auto-detects the correct ABI from your APK. iOS support is in progress and will ship as part of the Pro tier.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" class="section">
      <div class="wrap">
        <div data-reveal class="mb-14">
          <span class="eyebrow">FAQ</span>
          <h2 class="display">Common questions.</h2>
        </div>

        <div class="flex flex-col divide-y divide-zinc-200 border-t border-b border-zinc-200">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              data-reveal
              class="group transition-colors"
            >
              <summary class="flex cursor-pointer items-center justify-between gap-6 py-8 select-none">
                <span class="text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                  {faq.q}
                </span>
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-all duration-200 group-open:rotate-45 group-open:border-zinc-900 group-open:bg-zinc-900 group-open:text-white">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                    <path d="M6 1v10M1 6h10"></path>
                  </svg>
                </span>
              </summary>
              <p class="pb-8 text-base leading-relaxed text-zinc-600 sm:text-lg max-w-4xl">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
