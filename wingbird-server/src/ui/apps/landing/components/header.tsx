import Logo from "../../../components/logo";

export const GithubIcon = ({ class: cls = "w-4 h-4" }: { class?: string }) => (
  <svg class={cls} viewBox="0 0 24 24" fill="currentColor">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const AppleIcon = ({ class: cls = "w-5 h-5" }: { class?: string }) => (
  <svg class={cls} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.64-.78 1.08-1.85.96-2.93-.93.04-2.06.62-2.73 1.4-.6.69-1.12 1.79-.98 2.86 1.04.08 2.11-.55 2.75-1.33" />
  </svg>
);

export const LinuxIcon = ({ class: cls = "w-5 h-5" }: { class?: string }) => (
  <svg class={cls} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.38 2.25c-2.42 0-4.38 1.96-4.38 4.38 0 1.29.56 2.45 1.45 3.25-.09.31-.22.61-.41.89-.5.73-1.28 1.25-2.09 1.56-.47.18-.85.57-.98 1.05-.13.48.01 1 .37 1.34 1.23 1.15 2.86 1.83 4.6 1.83.67 0 1.32-.1 1.94-.29 1.13.82 2.51 1.29 4 1.29 1.09 0 2.13-.25 3.06-.72.48-.24.78-.73.78-1.27 0-.54-.3-1.03-.78-1.27-.71-.36-1.49-.57-2.31-.62.88-.63 1.54-1.53 1.86-2.58.18-.58.01-1.21-.43-1.63-.44-.42-1.07-.54-1.63-.31-.8.33-1.68.51-2.59.51-.55 0-1.08-.07-1.59-.2 1.04-.79 1.71-2.01 1.71-3.39 0-2.42-1.96-4.38-4.38-4.38z" />
  </svg>
);

export const WindowsIcon = ({ class: cls = "w-5 h-5" }: { class?: string }) => (
  <svg class={cls} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 5.453L10.364 4.4v7.091H3V5.453zm0 13.094l7.364 1.053v-7.091H3v6.038zM11.455 4.246L21 2.8v8.691h-9.545V4.246zm0 15.508L21 21.2v-8.691h-9.545v7.245z" />
  </svg>
);

export const CopyIcon = ({ class: cls = "w-4 h-4" }: { class?: string }) => (
  <svg class={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export default function Header() {
  return (
    <header class="site-header">
      <div class="wrap" style="padding-block:18px">
        <a href="/" class="flex items-center gap-3">
          <Logo class="h-8 w-8 shrink-0" />
          <span class="text-[22px] font-extrabold tracking-tight text-zinc-900">Wingbird</span>
        </a>

        <div class="flex items-center gap-8">
          <nav class="nav-links hidden md:flex items-center gap-7">
            <a href="#how-it-works">How it works</a>
            <a href="#install">Install</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a
            href="https://github.com/Saugat913/wingbird"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost flex items-center gap-2 py-2 px-4"
          >
            <GithubIcon class="w-4 h-4" />
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
