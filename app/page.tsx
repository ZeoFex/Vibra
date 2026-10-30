import Link from "next/link";
import {
  Play,
  Crown,
  Music,
  Headphones,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VibraLogo } from "@/components/brand/vibra-logo";
import { VoiceRecorder } from "@/components/voice/voice-recorder";

const features = [
  {
    icon: null,
    title: "Vibra AI",
    description: "Smart recommendations that learn your taste and mood.",
  },
  {
    icon: Music,
    title: "Unlimited Library",
    description: "Millions of songs, albums, and artists at your fingertips.",
  },
  {
    icon: Headphones,
    title: "Premium Audio",
    description: "Crystal-clear high-fidelity streaming for audiophiles.",
  },
  {
    icon: Zap,
    title: "Instant Playlists",
    description: "AI-generated playlists for every moment and activity.",
  },
];

const plans = [
  { name: "Free", price: "$0", features: ["Ads", "Limited skips", "Standard audio"] },
  { name: "Premium", price: "$9.99/mo", features: ["No ads", "Unlimited skips", "Hi-Fi audio", "Offline downloads", "Vibra AI playlists"], highlight: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="app-chrome fixed top-0 z-50 flex w-full items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <VibraLogo size={36} className="h-9 w-9 rounded-lg" />
          <span className="truncate text-base font-semibold tracking-tight">Vibra</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="px-3">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="default" size="sm" className="px-3">Sign up</Button>
          </Link>
        </div>
      </nav>

      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 pt-20 pb-16">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
          <VibraLogo size={88} className="mb-5 h-20 w-20 rounded-2xl sm:h-24 sm:w-24" />
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-400">
            Feel every beat
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Music that moves
            <br />
            <span className="gradient-text">with you</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/55 sm:text-base">
            Listen, discover, and mix in one place.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/home">
              <Button variant="premium" size="lg" className="w-full gap-2 sm:w-auto">
                <Play size={18} fill="currentColor" />
                Start listening
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                <Crown size={18} />
                Go Premium
              </Button>
            </Link>
          </div>
          <div className="mt-8">
            <VoiceRecorder />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Everything you need
          </h2>
          <p className="mb-16 text-center text-white/50">
            A premium music experience built for the modern listener
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20">
                  {title === "Vibra AI" || !Icon ? (
                    <VibraLogo size={28} className="h-7 w-7 rounded-lg" />
                  ) : (
                    <Icon size={24} className="text-violet-400" />
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm text-white/50">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row">
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium text-violet-400">Vibra AI</p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Your personal music curator
            </h2>
            <p className="mb-6 text-white/60">
              Ask Vibra AI to generate playlists, discover similar tracks, or find
              the perfect music for any mood. It learns from every listen.
            </p>
            <div className="space-y-3">
              {["Generate a workout playlist", "Create a chill evening mix", "Songs similar to this track"].map((prompt) => (
                <div key={prompt} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <VibraLogo size={18} className="h-[18px] w-[18px] shrink-0 rounded-md" />
                  <span className="text-sm text-white/70">&ldquo;{prompt}&rdquo;</span>
                  <ChevronRight size={16} className="ml-auto text-white/30" />
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-80 w-full max-w-md overflow-hidden rounded-3xl glass lg:h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20" />
            <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
              <VibraLogo size={56} className="mb-4 h-14 w-14 rounded-2xl" />
              <p className="text-lg font-medium">AI-Powered Discovery</p>
              <p className="mt-2 text-sm text-white/50">Personalized for your unique taste</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Choose your plan</h2>
          <p className="mb-12 text-white/50">Start free, upgrade when you&apos;re ready</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 text-left ${plan.highlight ? "bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 ring-2 ring-violet-500" : "glass"}`}
              >
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <ChevronRight size={14} className="text-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-8 block">
                  <Button variant={plan.highlight ? "premium" : "secondary"} className="w-full">
                    {plan.highlight ? "Start Premium Trial" : "Get Started"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <VibraLogo size={40} />
          <p className="text-sm text-white/40">© 2026 Vibra. Feel Every Beat.</p>
        </div>
      </footer>
    </div>
  );
}
