"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch(`/api/auth/artist/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message ?? "Email verified!");
        } else {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="glass max-w-md rounded-2xl p-8 text-center">
      {status === "loading" && (
        <>
          <Loader2 size={40} className="mx-auto mb-4 animate-spin text-violet-400" />
          <h1 className="text-xl font-bold">Verifying your email...</h1>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 size={48} className="mx-auto mb-4 text-green-400" />
          <h1 className="text-xl font-bold">Email Verified!</h1>
          <p className="mt-3 text-sm text-white/60">{message}</p>
          <Link href="/artist/login">
            <Button className="mt-6 w-full">Sign in to Artist Portal</Button>
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold">Verification Failed</h1>
          <p className="mt-3 text-sm text-white/60">{message}</p>
          <Link href="/artist/register">
            <Button variant="secondary" className="mt-6 w-full">Register Again</Button>
          </Link>
        </>
      )}
    </div>
  );
}

export default function ArtistVerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg px-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-violet-400" />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
