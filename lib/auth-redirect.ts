export function getSafeRedirect(redirect: string | null | undefined): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/home";
  }
  return redirect;
}
