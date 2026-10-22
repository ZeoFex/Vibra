import Image from "next/image";

export function AuthSplit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center px-10 lg:flex">
        <Image
          src="/vibra-logo-clear.png"
          alt="Vibra"
          width={560}
          height={560}
          priority
          className="h-auto w-full max-w-[560px]"
        />
      </div>
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
