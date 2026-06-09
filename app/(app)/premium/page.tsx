"use client";

import { useState } from "react";
import { Check, Crown, Sparkles, Download, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/app-context";
import { cn } from "@/lib/utils";

const freeFeatures = [
  { icon: Volume2, text: "Standard audio quality" },
  { icon: SkipForward, text: "6 skips per hour" },
  { text: "Ads between songs" },
  { text: "Basic recommendations" },
];

const premiumFeatures = [
  { icon: Volume2, text: "High-fidelity audio" },
  { icon: SkipForward, text: "Unlimited skips" },
  { icon: Download, text: "Offline downloads" },
  { icon: Sparkles, text: "Vibra AI smart playlists" },
  { text: "No ads" },
  { text: "Exclusive content" },
];

export default function PremiumPage() {
  const { user, upgradeToPremium } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState("");
  const isPremium = user?.tier === "premium";

  const handleUpgrade = async () => {
    setUpgrading(true);
    setMessage("");
    const result = await upgradeToPremium();
    setUpgrading(false);
    if (result.ok) {
      setMessage("Premium activated! Payment integration coming soon.");
    } else {
      setMessage(result.error ?? "Upgrade failed");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-indigo-600/30 p-8 text-center md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.3),transparent_70%)]" />
        <Crown size={48} className="relative mx-auto mb-4 text-violet-400" />
        <h1 className="relative text-3xl font-bold md:text-4xl">
          {isPremium ? "You're Premium!" : "Upgrade to Vibra Premium"}
        </h1>
        <p className="relative mx-auto mt-3 max-w-lg text-white/60">
          {isPremium
            ? "Enjoy unlimited access to all premium features."
            : "Unlock the full Vibra experience with unlimited skips, hi-fi audio, and AI-powered playlists."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-1 text-3xl font-bold">$0<span className="text-base font-normal text-white/50">/mo</span></p>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                {Icon ? <Icon size={16} className="text-white/40" /> : <Check size={16} className="text-white/40" />}
                {text}
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-8 w-full" disabled={!isPremium}>
            {isPremium ? "Previous Plan" : "Current Plan"}
          </Button>
        </div>

        <div className={cn("rounded-2xl p-6 ring-2 ring-violet-500", "bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10")}>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Premium</h2>
            <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium">Popular</span>
          </div>
          <p className="mt-1 text-3xl font-bold">$9.99<span className="text-base font-normal text-white/50">/mo</span></p>
          <ul className="mt-6 space-y-3">
            {premiumFeatures.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                {Icon ? <Icon size={16} className="text-violet-400" /> : <Check size={16} className="text-violet-400" />}
                {text}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <Button variant="premium" className="mt-8 w-full" disabled>
              Active
            </Button>
          ) : (
            <Button variant="premium" className="mt-8 w-full" onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? "Activating..." : "Activate Premium (no payment yet)"}
            </Button>
          )}
        </div>
      </div>

      {message && (
        <p className="text-center text-sm text-violet-300">{message}</p>
      )}

      <p className="text-center text-xs text-white/40">
        Payment integration coming soon. Cancel anytime. Prices in USD.
      </p>
    </div>
  );
}
