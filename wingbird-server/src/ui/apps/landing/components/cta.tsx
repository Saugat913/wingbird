import { GithubIcon } from "./header";

export default function CTA() {
  return (
    <section class="section section--dark relative overflow-hidden">
      <div class="wrap relative z-10 text-center">
        <div data-reveal class="mx-auto max-w-2xl">
          <h2 class="display text-white mb-5">
            Built by developers, for developers.
          </h2>
          <p class="lead mb-10 mx-auto text-center text-[#a3a3a3] max-w-[48ch]">
            Wingbird is 100% open-source software. We welcome contributions, bug reports, and feedback from the Flutter community. Help us make live hot-fixing effortless for everyone.
          </p>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/Saugat913/wingbird"
              target="_blank"
              rel="noopener noreferrer"
              class="btn bg-white text-black border-white"
            >
              <GithubIcon class="h-4 w-4" />
              Contribute on GitHub <span>→</span>
            </a>
            <a
              href="https://github.com/Saugat913/wingbird/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-ghost-dark"
            >
              Open an Issue ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
