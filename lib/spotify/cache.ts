import { promises as fs } from "fs";
import path from "path";
import { loadSpotifyCatalog } from "@/lib/spotify/catalog";
import type { Album, Song } from "@/types";

const CACHE_PATH = path.join(process.cwd(), ".cache", "spotify-catalog.json");
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

type CatalogFile = { savedAt: number; songs: Song[]; albums: Album[] };

let memory: CatalogFile | null = null;
let inflight: Promise<CatalogFile> | null = null;

async function readDisk(): Promise<CatalogFile | null> {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw) as CatalogFile;
    if (!Array.isArray(parsed.songs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeDisk(catalog: CatalogFile) {
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(catalog));
}

export async function getSpotifyCatalog(): Promise<{ songs: Song[]; albums: Album[] }> {
  const now = Date.now();
  if (memory && now - memory.savedAt < MAX_AGE_MS && memory.songs.length > 0) {
    return memory;
  }

  const disk = await readDisk();
  if (disk && now - disk.savedAt < MAX_AGE_MS && disk.songs.length > 0) {
    memory = disk;
    return disk;
  }

  if (!inflight) {
    inflight = (async () => {
      const fresh = await loadSpotifyCatalog();
      const next = { savedAt: Date.now(), ...fresh };
      if (next.songs.length > 0) {
        memory = next;
        await writeDisk(next);
      } else if (disk) {
        memory = disk;
        return disk;
      }
      return next;
    })().finally(() => {
      inflight = null;
    });
  }

  return inflight;
}
