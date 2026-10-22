import Image from "next/image";
import { cn } from "@/lib/utils";

export function VibraLogo({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/vibra-logo.jpg"
      alt="Vibra"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-xl object-cover", className)}
      priority
    />
  );
}
