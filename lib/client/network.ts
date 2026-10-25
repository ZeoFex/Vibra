export function reportOffline() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vibra-offline"));
}

export async function checkOnline() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    reportOffline();
    return false;
  }
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
    if (response.status >= 500) {
      reportOffline();
      return false;
    }
    return true;
  } catch {
    reportOffline();
    return false;
  }
}
