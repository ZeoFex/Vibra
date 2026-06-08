import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Sparkles,
  Crown,
  Music,
  Headphones,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sparkles,
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
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between gap-2 border-b border-white/5 bg-black/60 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 sm:h-9 sm:w-9">
            <span className="text-base font-bold sm:text-lg">V</span>
          </div>
          <span className="truncate text-lg font-bold sm:text-xl">Vibra</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="px-3 sm:px-4">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="default" size="sm" className="px-3 sm:px-4">
              <span className="hidden sm:inline">Sign up free</span>
              <span className="sm:hidden">Sign up</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-fuchsia-600/15 blur-[100px] animate-pulse-glow" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-violet-400">
            Feel Every Beat
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-7xl">
            Music that moves
            <br />
            <span className="gradient-text">with you</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60">
            Vibra combines the best of streaming with AI-powered recommendations
            to deliver the perfect soundtrack for every moment.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button variant="premium" size="lg" className="gap-2">
                <Play size={18} fill="currentColor" />
                Start Listening Free
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="outline" size="lg" className="gap-2">
                <Crown size={18} />
                Go Premium
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating album art */}
        <div className="absolute bottom-20 left-10 hidden h-32 w-32 overflow-hidden rounded-2xl shadow-2xl shadow-violet-600/20 animate-float lg:block">
          <Image src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop" alt="" fill className="object-cover" />
        </div>
        <div className="absolute bottom-32 right-16 hidden h-24 w-24 overflow-hidden rounded-2xl shadow-2xl shadow-fuchsia-600/20 animate-float lg:block" style={{ animationDelay: "1s" }}>
          <Image src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop" alt="" fill className="object-cover" />
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
                  <Icon size={24} className="text-violet-400" />
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
                  <Sparkles size={16} className="shrink-0 text-violet-400" />
                  <span className="text-sm text-white/70">&ldquo;{prompt}&rdquo;</span>
                  <ChevronRight size={16} className="ml-auto text-white/30" />
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-80 w-full max-w-md overflow-hidden rounded-3xl glass lg:h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20" />
            <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
              <Sparkles size={48} className="mb-4 text-violet-400" />
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
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <span className="text-sm font-bold">V</span>
            </div>
            <span className="font-bold">Vibra</span>
          </div>
          <p className="text-sm text-white/40">© 2026 Vibra. Feel Every Beat.</p>
        </div>
      </footer>
    </div>
  );
}
