/** Royalty-free demo tracks for mock catalog playback (SoundHelix samples). */
export const DEMO_AUDIO_URLS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
];

export function getDemoAudioUrl(songId: string): string {
  const numeric = Number.parseInt(songId.replace(/\D/g, ""), 10) || 1;
  return DEMO_AUDIO_URLS[(numeric - 1) % DEMO_AUDIO_URLS.length];
}
