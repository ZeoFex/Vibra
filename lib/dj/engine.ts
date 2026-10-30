"use client";

export type DeckId = "a" | "b";
export type StingerKind = "airhorn" | "impact" | "riser" | "siren" | "stab";

export const SONG_DRAG_TYPE = "application/vibra-song";

export interface DjTrack {
  id: string;
  title: string;
  artistName: string;
  cover: string;
  audioUrl: string;
  duration: number;
}

interface DeckNodes {
  audio: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
  low: BiquadFilterNode;
  mid: BiquadFilterNode;
  high: BiquadFilterNode;
  gain: GainNode;
  filter: BiquadFilterNode;
  delay: DelayNode;
  feedback: GainNode;
  analyser: AnalyserNode;
}

export interface DeckLive {
  playing: boolean;
  current: number;
  duration: number;
  rate: number;
  keyLock: boolean;
  volume: number;
  low: number;
  mid: number;
  high: number;
  loopOn: boolean;
  loopSeconds: number;
  cue: number;
  hotCues: Array<number | null>;
}

const rates = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2];

function dbFromKnob(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return (clamped - 0.5) * 24;
}

export class DjEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private decks = new Map<DeckId, DeckNodes>();
  private cross = 0.5;
  private volumes: Record<DeckId, number> = { a: 0.85, b: 0.85 };
  private loops: Record<DeckId, { on: boolean; start: number; seconds: number }> = {
    a: { on: false, start: 0, seconds: 4 },
    b: { on: false, start: 0, seconds: 4 },
  };
  private jingleAudio: HTMLAudioElement | null = null;
  private ended = new Map<DeckId, () => void>();
  private baseRate: Record<DeckId, number> = { a: 1, b: 1 };

  async resume() {
    const ctx = this.context();
    if (ctx.state === "suspended") await ctx.resume();
  }

  private context() {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
    }
    return this.ctx;
  }

  load(id: DeckId, url: string) {
    const ctx = this.context();
    this.destroyDeck(id);
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "auto";
    audio.src = url;
    const source = ctx.createMediaElementSource(audio);
    const low = ctx.createBiquadFilter();
    low.type = "lowshelf";
    low.frequency.value = 140;
    const mid = ctx.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 1000;
    mid.Q.value = 0.8;
    const high = ctx.createBiquadFilter();
    high.type = "highshelf";
    high.frequency.value = 6500;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 18000;
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(low);
    low.connect(mid);
    mid.connect(high);
    high.connect(filter);
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0;
    const feedback = ctx.createGain();
    feedback.gain.value = 0;
    filter.connect(gain);
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(gain);
    gain.connect(analyser);
    audio.addEventListener("ended", () => this.ended.get(id)?.());
    analyser.connect(this.master!);
    audio.addEventListener("timeupdate", () => this.applyLoop(id));
    this.decks.set(id, { audio, source, low, mid, high, gain, filter, delay, feedback, analyser });
    this.applyCrossfader();
    this.loops[id] = { on: false, start: 0, seconds: 4 };
  }

  play(id: DeckId) {
    const deck = this.decks.get(id);
    if (!deck) return;
    void this.resume().then(() => deck.audio.play().catch(() => {}));
  }

  pause(id: DeckId) {
    this.decks.get(id)?.audio.pause();
  }

  toggle(id: DeckId) {
    const audio = this.decks.get(id)?.audio;
    if (!audio) return;
    if (audio.paused) this.play(id);
    else audio.pause();
  }

  seek(id: DeckId, seconds: number) {
    const audio = this.decks.get(id)?.audio;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(0, seconds), audio.duration);
  }

  setCue(id: DeckId, seconds: number) {
    return seconds;
  }

  jumpCue(id: DeckId, seconds: number) {
    this.seek(id, seconds);
    this.play(id);
  }

  setRate(id: DeckId, rate: number) {
    const audio = this.decks.get(id)?.audio;
    if (!audio) return;
    const next = Math.min(2, Math.max(0.5, rate));
    audio.playbackRate = next;
    audio.defaultPlaybackRate = next;
    this.baseRate[id] = next;
  }

  onEnded(id: DeckId, callback: () => void) {
    this.ended.set(id, callback);
  }

  bend(id: DeckId, amount: number) {
    const audio = this.decks.get(id)?.audio;
    if (!audio) return;
    audio.playbackRate = Math.min(2, Math.max(0.5, this.baseRate[id] + amount));
  }

  releaseBend(id: DeckId) {
    const audio = this.decks.get(id)?.audio;
    if (!audio) return;
    audio.playbackRate = this.baseRate[id];
  }

  beatJump(id: DeckId, beats: number, bpm = 128) {
    const audio = this.decks.get(id)?.audio;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const step = (60 / bpm) * beats;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + step), audio.duration);
  }

  setEcho(id: DeckId, amount: number) {
    const deck = this.decks.get(id);
    if (!deck) return;
    const wet = Math.min(1, Math.max(0, amount));
    deck.delay.delayTime.value = wet === 0 ? 0 : 0.18 + wet * 0.28;
    deck.feedback.gain.value = wet * 0.45;
  }

  setFilter(id: DeckId, knob: number) {
    const filter = this.decks.get(id)?.filter;
    if (!filter) return;
    const amount = Math.min(1, Math.max(0, knob));
    filter.frequency.value = 180 + amount * 17820;
  }

  brake(id: DeckId) {
    const audio = this.decks.get(id)?.audio;
    if (!audio) return;
    const start = audio.playbackRate || 1;
    const begun = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - begun) / 700);
      audio.playbackRate = start * (1 - t) + 0.15 * t;
      if (t < 1) requestAnimationFrame(step);
      else audio.pause();
    };
    requestAnimationFrame(step);
  }

  nudgeRate(id: DeckId, direction: -1 | 1) {
    const audio = this.decks.get(id)?.audio;
    if (!audio) return 1;
    const current = audio.playbackRate || 1;
    const index = rates.reduce((best, value, i) => (Math.abs(value - current) < Math.abs(rates[best] - current) ? i : best), 0);
    const next = rates[Math.min(rates.length - 1, Math.max(0, index + direction))];
    this.setRate(id, next);
    return next;
  }

  setKeyLock(id: DeckId, locked: boolean) {
    const audio = this.decks.get(id)?.audio;
    if (audio) audio.preservesPitch = locked;
  }

  setEq(id: DeckId, band: "low" | "mid" | "high", knob: number) {
    const deck = this.decks.get(id);
    if (!deck) return;
    deck[band].gain.value = dbFromKnob(knob);
  }

  setVolume(id: DeckId, volume: number) {
    this.volumes[id] = Math.min(1, Math.max(0, volume));
    this.applyCrossfader();
  }

  setCrossfader(value: number) {
    this.cross = Math.min(1, Math.max(0, value));
    this.applyCrossfader();
  }

  setMaster(value: number) {
    if (this.master) this.master.gain.value = Math.min(1, Math.max(0, value));
  }

  toggleLoop(id: DeckId, seconds: number) {
    const audio = this.decks.get(id)?.audio;
    const loop = this.loops[id];
    if (!audio) return loop;
    if (loop.on && loop.seconds === seconds) {
      loop.on = false;
      return loop;
    }
    loop.on = true;
    loop.seconds = seconds;
    loop.start = audio.currentTime;
    return loop;
  }

  levels(id: DeckId) {
    const deck = this.decks.get(id);
    if (!deck) return [] as number[];
    const data = new Uint8Array(deck.analyser.frequencyBinCount);
    deck.analyser.getByteFrequencyData(data);
    return Array.from(data);
  }

  read(id: DeckId): Pick<DeckLive, "playing" | "current" | "duration" | "rate"> | null {
    const audio = this.decks.get(id)?.audio;
    if (!audio) return null;
    return {
      playing: !audio.paused && !audio.ended,
      current: audio.currentTime || 0,
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      rate: audio.playbackRate || 1,
    };
  }

  syncRate(from: DeckId, to: DeckId) {
    const source = this.decks.get(from)?.audio;
    if (!source) return 1;
    this.setRate(to, source.playbackRate || 1);
    return source.playbackRate || 1;
  }

  scratch(id: DeckId, deltaSeconds: number) {
    const audio = this.decks.get(id)?.audio;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + deltaSeconds), audio.duration);
  }

  playJingle(url: string) {
    const ctx = this.context();
    if (!this.jingleAudio) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gain.gain.value = 0.95;
      source.connect(gain);
      gain.connect(this.master!);
      this.jingleAudio = audio;
    }
    this.jingleAudio.src = url;
    this.jingleAudio.currentTime = 0;
    void this.resume().then(() => this.jingleAudio?.play().catch(() => {}));
  }

  playStinger(kind: StingerKind) {
    const ctx = this.context();
    void this.resume();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(this.master!);
    if (kind === "airhorn") {
      [220, 330, 440].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.7);
      });
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      return;
    }
    if (kind === "impact") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.5);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      return;
    }
    if (kind === "riser") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 1.2);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 1.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 1.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      return;
    }
    const osc = ctx.createOscillator();
    osc.type = kind === "siren" ? "square" : "triangle";
    osc.frequency.setValueAtTime(kind === "siren" ? 640 : 520, now);
    if (kind === "siren") osc.frequency.linearRampToValueAtTime(420, now + 0.35);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.4);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  }

  stopAll() {
    (["a", "b"] as DeckId[]).forEach((id) => this.destroyDeck(id));
    if (this.jingleAudio) {
      this.jingleAudio.pause();
      this.jingleAudio.src = "";
      this.jingleAudio = null;
    }
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }

  private applyLoop(id: DeckId) {
    const audio = this.decks.get(id)?.audio;
    const loop = this.loops[id];
    if (!audio || !loop.on) return;
    if (audio.currentTime >= loop.start + loop.seconds) {
      audio.currentTime = loop.start;
    }
  }

  private applyCrossfader() {
    (["a", "b"] as DeckId[]).forEach((id) => {
      const gain = this.decks.get(id)?.gain;
      if (!gain) return;
      const side = id === "a" ? 1 - this.cross : this.cross;
      const curve = Math.cos((1 - side) * Math.PI * 0.5);
      gain.gain.value = curve * this.volumes[id];
    });
  }

  private destroyDeck(id: DeckId) {
    const deck = this.decks.get(id);
    if (!deck) return;
    deck.audio.pause();
    deck.audio.src = "";
    deck.source.disconnect();
    this.decks.delete(id);
  }
}
