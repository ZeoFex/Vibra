import Image from "next/image";
import { cn } from "@/lib/utils";

export function AuthSplit({
  children,
  tone = "default",
  sideSrc = "/vibra-login-hero.jpg",
  sideAlt = "Listener wearing headphones",
}: {
  children: React.ReactNode;
  tone?: "default" | "admin";
  sideSrc?: string;
  sideAlt?: string;
}) {
  const admin = tone === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-[#100818] lg:flex-row">
      <div
        className={cn(
          admin
            ? "hidden w-1/2 items-center justify-center bg-[#1a1028]/80 px-10 lg:flex"
            : "relative h-48 w-full shrink-0 overflow-hidden sm:h-56 lg:h-auto lg:min-h-screen lg:w-1/2"
        )}
      >
        {admin ? (
          <Image
            src="/vibra-logo-clear.png"
            alt="Vibra"
            width={560}
            height={560}
            priority
            className="h-auto w-full max-w-[560px]"
          />
        ) : (
          <>
            <Image
              src={sideSrc}
              alt={sideAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[center_22%]"
            />
            <div className="pointer-events-none absolute inset-0 bg-[#100818]/45" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#100818] lg:hidden" />
          </>
        )}
      </div>
      <div
        className={cn(
          "flex w-full flex-1 items-start justify-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 lg:w-1/2 lg:items-center lg:px-4 lg:py-10",
          "items-center bg-[#1a1028]/90 py-10"
        )}
      >
        {children}
      </div>
    </div>
  );
}
