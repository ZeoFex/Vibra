export type ReleaseType = "single" | "album" | "ep" | "mixtape" | "compilation" | "live" | "remix";

export interface ReleaseTypeConfig {
  value: ReleaseType;
  label: string;
  projectLabel: string;
  projectPlaceholder: string;
  allowsMultipleTracks: boolean;
  minTracks: number;
  maxTracks: number;
  trackSectionLabel: string;
}

export const releaseTypeOptions: ReleaseTypeConfig[] = [
  {
    value: "single",
    label: "Single",
    projectLabel: "Single Title",
    projectPlaceholder: "e.g. Midnight Confessions",
    allowsMultipleTracks: false,
    minTracks: 1,
    maxTracks: 1,
    trackSectionLabel: "Track Details",
  },
  {
    value: "album",
    label: "Album",
    projectLabel: "Album Title",
    projectPlaceholder: "e.g. Bloom",
    allowsMultipleTracks: true,
    minTracks: 2,
    maxTracks: 20,
    trackSectionLabel: "Album Tracks",
  },
  {
    value: "ep",
    label: "EP",
    projectLabel: "EP Title",
    projectPlaceholder: "e.g. Golden Hour EP",
    allowsMultipleTracks: true,
    minTracks: 2,
    maxTracks: 6,
    trackSectionLabel: "EP Tracks",
  },
  {
    value: "mixtape",
    label: "Mixtape",
    projectLabel: "Mixtape Title",
    projectPlaceholder: "e.g. Summer Vibes Vol. 1",
    allowsMultipleTracks: true,
    minTracks: 2,
    maxTracks: 15,
    trackSectionLabel: "Mixtape Tracks",
  },
  {
    value: "compilation",
    label: "Compilation",
    projectLabel: "Compilation Title",
    projectPlaceholder: "e.g. Best of 2026",
    allowsMultipleTracks: true,
    minTracks: 2,
    maxTracks: 25,
    trackSectionLabel: "Compilation Tracks",
  },
  {
    value: "live",
    label: "Live Album",
    projectLabel: "Live Album Title",
    projectPlaceholder: "e.g. Live at Madison Square Garden",
    allowsMultipleTracks: true,
    minTracks: 2,
    maxTracks: 20,
    trackSectionLabel: "Live Tracks",
  },
  {
    value: "remix",
    label: "Remix",
    projectLabel: "Remix Project Title",
    projectPlaceholder: "e.g. Midnight Confessions (Remixes)",
    allowsMultipleTracks: true,
    minTracks: 1,
    maxTracks: 10,
    trackSectionLabel: "Remix Tracks",
  },
];

export function getReleaseTypeConfig(type: ReleaseType): ReleaseTypeConfig {
  return releaseTypeOptions.find((o) => o.value === type) ?? releaseTypeOptions[0];
}
