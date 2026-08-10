import Logo from "../../../components/logo";

export default function Footer() {
  return (
    <footer class="section" style="padding-block:clamp(48px,6vw,80px)">
      <div class="wrap">
        <div class="flex flex-wrap items-center justify-between gap-8">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <Logo class="h-8 w-8 shrink-0 object-contain" />
              <span class="text-xl font-extrabold tracking-tight text-black">
                Wingbird
              </span>
              <span class="badge" style="font-size:10px">
                Apache-2.0
              </span>
            </div>
            <p class="text-sm text-neutral-600">
              Open-source release tracking and binary diffing for Flutter.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-7 text-sm font-semibold text-neutral-700">
            <a
              href="https://github.com/Saugat913/wingbird"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-black"
            >
              GitHub ↗
            </a>
            <a
              href="https://github.com/Saugat913/wingbird/releases"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-black"
            >
              Releases
            </a>
            <a
              href="https://github.com/Saugat913/wingbird/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="transition-colors hover:text-black"
            >
              Issues
            </a>
            <a href="#pricing" class="transition-colors hover:text-black">
              Pricing
            </a>
          </div>
        </div>

        <div class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-6 text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} Wingbird. Free & open-source software.</span>
          <span class="font-mono text-xs text-neutral-400">CLI & Cloud Server for Flutter</span>
        </div>
      </div>
    </footer>
  );
}
