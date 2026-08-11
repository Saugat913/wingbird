import { Script } from "vite-ssr-components/hono";
import Header from "./components/header";
import Hero from "./components/hero";
import HowItWorks from "./components/setup";
import Download from "./components/download";
import Pricing from "./components/pricing";
import FAQ from "./components/faq";
import CTA from "./components/cta";
import Footer from "./components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main class="overflow-hidden bg-white text-neutral-900">
        <Hero />
        <HowItWorks />
        <Download />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <Script src="/src/ui/client/cli-window.tsx"></Script>
      <Script src="/src/ui/client/premium.ts"></Script>
    </>
  );
}
