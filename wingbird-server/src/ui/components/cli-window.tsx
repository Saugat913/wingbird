import { useEffect, useState } from "hono/jsx";

export default function CliWindow() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div class="font-mono flex w-full flex-col border border-neutral-800 bg-black text-neutral-200 overflow-hidden rounded-md shadow-2xl">
      <div class="flex items-center justify-between border-b border-neutral-800 bg-[#0c0c0c] px-4 py-3 text-xs">
        <div class="flex gap-1.5">
          <span class="h-2.5 w-2.5 bg-neutral-700 rounded-sm"></span>
          <span class="h-2.5 w-2.5 bg-neutral-700 rounded-sm"></span>
          <span class="h-2.5 w-2.5 bg-neutral-700 rounded-sm"></span>
        </div>

        <span class="text-neutral-500 truncate max-w-[180px] sm:max-w-none text-[11px] tracking-widest uppercase">
          wingbird-cli — v1.0
        </span>

        <div class="w-12"></div>
      </div>

      <div class="flex h-[380px] sm:h-[420px] flex-col justify-start bg-black p-4 sm:p-6 text-xs sm:text-sm overflow-x-auto overflow-y-auto">
        {step === 1 && (
          <div class="space-y-2 min-w-[300px]">
            <div class="flex items-center gap-2">
              <span class="text-cyan-400 font-bold">$</span>
              <span class="text-neutral-100 font-medium">wingbird auth login</span>
            </div>
            <pre class="text-cyan-400 text-[9px] sm:text-[10px] md:text-xs leading-none select-none my-3 overflow-hidden font-bold">
{` __          ___             _     _         _ 
 \\ \\        / (_)           | |   (_)       | |
  \\ \\  /\\  / / _ _ __   __ _| |__  _ _ __ __| |
   \\ \\/  \\/ / | | '_ \\ / _\` | '_ \\| | '__/ _\` |
    \\  /\\  /  | | | | | (_| | |_) | | | | (_| |
     \\/  \\/   |_|_| |_|\\__, |_.__/|_|_|  \\__,_|
                        __/ |
                       |___|`}
            </pre>
            <div class="space-y-1.5 pl-1">
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> No session token passed, opening browser for login...</div>
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> Click here to login <span class="underline break-all font-bold">https://wingbird.dev/auth/login?callbackUrl=...</span></div>
              <div class="text-emerald-400 font-normal"><span class="font-bold">[✔]</span> Received the token</div>
              <div class="text-emerald-400 font-bold">[✔] Login successful. Logged in as Saugat</div>
              <span class="inline-block w-2 h-4 bg-cyan-400 blink align-middle ml-0.5"></span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div class="space-y-2 min-w-[300px]">
            <div class="flex items-center gap-2">
              <span class="text-cyan-400 font-bold">$</span>
              <span class="text-neutral-100 font-medium">wingbird release android production</span>
            </div>
            <div class="space-y-1.5 pl-1 pt-2">
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> Building release APK...</div>
              <div class="text-emerald-400 font-normal"><span class="font-bold">[✔]</span> APK built successfully</div>
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> Output build/app/outputs/flutter-apk/app-release.apk</div>
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> APK size: 18.4 MB</div>
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> Computing file hash...</div>
              <div class="text-amber-400 font-normal"><span class="font-bold">[⧗]</span> Requesting upload URL...</div>
              <div class="text-emerald-400 font-normal"><span class="font-bold">[✔]</span> Upload complete (id: upl_48a92f1)</div>
              <div class="text-amber-400 font-normal"><span class="font-bold">[⧗]</span> Creating release record on server...</div>
              <div class="text-emerald-400 font-bold">[✔] Release created successfully (ID: rel_99a82b)</div>
              <span class="inline-block w-2 h-4 bg-cyan-400 blink align-middle ml-0.5"></span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div class="space-y-2 min-w-[300px]">
            <div class="flex items-center gap-2">
              <span class="text-cyan-400 font-bold">$</span>
              <span class="text-neutral-100 font-medium">wingbird patch android production</span>
            </div>
            <div class="space-y-1.5 pl-1 pt-2">
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> Building release APK...</div>
              <div class="text-amber-400 font-normal"><span class="font-bold">[⧗]</span> Downloading base release APK...</div>
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> Processing architecture: arm64-v8a</div>
              <div class="text-cyan-400 font-normal"><span class="font-bold">[➜]</span> Generating patch diff for arm64-v8a...</div>
              <div class="text-amber-400 font-normal"><span class="font-bold">[⧗]</span> Creating patch records...</div>
              <div class="text-emerald-400 font-bold">[✔] Successfully created 1 patch artifact(s) (1 architecture(s))!</div>
              <span class="inline-block w-2 h-4 bg-cyan-400 blink align-middle ml-0.5"></span>
            </div>
          </div>
        )}

        <div class="mt-auto pt-5 flex items-center justify-between border-t border-neutral-900 text-[11px] text-neutral-600">
          <span class="tracking-widest font-mono">STEP {step}/3</span>
          <div class="flex gap-1.5">
            <span class={`h-1 w-6 rounded-full transition-colors ${step === 1 ? 'bg-cyan-400' : 'bg-neutral-800'}`}></span>
            <span class={`h-1 w-6 rounded-full transition-colors ${step === 2 ? 'bg-cyan-400' : 'bg-neutral-800'}`}></span>
            <span class={`h-1 w-6 rounded-full transition-colors ${step === 3 ? 'bg-cyan-400' : 'bg-neutral-800'}`}></span>
          </div>
        </div>
      </div>
    </div>
  );
}
