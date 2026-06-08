import type { ArtistAccount } from "@/types/artist";
import { seedArtistAccounts } from "@/lib/mock-data/artist-accounts";

const ACCOUNTS_KEY = "vibra-artist-accounts";

export function loadArtistAccounts(): ArtistAccount[] {
  if (typeof window === "undefined") return seedArtistAccounts;
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ArtistAccount[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    /* fall through */
  }
  return seedArtistAccounts;
}

export function saveArtistAccounts(accounts: ArtistAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function findAccountByEmail(email: string): ArtistAccount | undefined {
  return loadArtistAccounts().find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
}

export function addArtistAccount(account: ArtistAccount): void {
  const accounts = loadArtistAccounts();
  saveArtistAccounts([account, ...accounts]);
}

export function updateArtistAccount(
  id: string,
  updates: Partial<ArtistAccount>
): ArtistAccount | null {
  const accounts = loadArtistAccounts();
  let updated: ArtistAccount | null = null;
  const next = accounts.map((a) => {
    if (a.id !== id) return a;
    updated = { ...a, ...updates };
    return updated;
  });
  saveArtistAccounts(next);
  return updated;
}
