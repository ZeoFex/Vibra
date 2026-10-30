"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { CircleStop, FastForward, Maximize2, Moon, PanelLeft, Pause, Play, Rewind, RotateCcw, RotateCw, Sun } from "lucide-react";
import { DjEngine, SONG_DRAG_TYPE, type DeckId, type StingerKind } from "@/lib/dj/engine";
import { useDjChrome } from "@/lib/dj/chrome";
import { usePlayer } from "@/lib/contexts/app-context";
import { readId3 } from "@/lib/audio/id3";
import { getAudioDurationFromFile } from "@/lib/audio/resolve-audio-url";
import type { Song } from "@/types";
import { cn } from "@/lib/utils";

type DeckState = ReturnType<typeof emptyDeck>;

const emptyDeck = () => ({
  track: null as Song | null,
  playing: false,
  current: 0,
  duration: 0,
  rate: 1,
  keyLock: true,
  volume: 0.85,
  low: 0.5,
  mid: 0.5,
  high: 0.5,
  loopOn: false,
  loopSeconds: 4,
  cue: 0,
  hotCues: [null, null, null, null] as Array<number | null>,
  queue: [] as Song[],
  filter: 1,
  bpm: 128,
});

const loops = [1, 2, 4, 8, 16];
const loopColors = ["#f5a524", "#16a34a", "#f97316", "#7c3aed", "#db2777"];
const stingers: StingerKind[] = ["airhorn", "impact", "riser", "siren", "stab"];

function useKeyboardFrame() {
  const [frame, setFrame] = useState({ top: 0, height: 0, open: false });

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      setFrame({
        top: viewport.offsetTop,
        height: viewport.height,
        open: covered > 80,
      });
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return frame;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const whole = Math.floor(seconds);
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

function songPayload(song: Song) {
  return JSON.stringify(song);
}

function readDroppedSong(event: DragEvent): Song | null {
  const raw = event.dataTransfer.getData(SONG_DRAG_TYPE) || event.dataTransfer.getData("text/plain");
  if (!raw) return null;
  try {
    const song = JSON.parse(raw) as Song;
    return song.audioUrl ? song : null;
  } catch {
    return null;
  }
}

export function DjStudio() {
  const engine = useMemo(() => new DjEngine(), []);
  const { pause } = usePlayer();
  const { immersive, setImmersive } = useDjChrome();
  const [decks, setDecks] = useState({ a: emptyDeck(), b: emptyDeck() });
  const [cross, setCross] = useState(0.5);
  const [echoOn, setEchoOn] = useState(false);
  const [master, setMaster] = useState(0.9);
  const [levels, setLevels] = useState<Record<DeckId, number[]>>({ a: [], b: [] });
  const [over, setOver] = useState<DeckId | null>(null);
  const [lightTheme, setLightTheme] = useState(false);
  const [panel, setPanel] = useState<"a" | "mix" | "b" | ToolTab>("a");
  const decksRef = useRef(decks);
  decksRef.current = decks;
  const queuesRef = useRef<Record<DeckId, Song[]>>({ a: [], b: [] });
  const loadRef = useRef<(id: DeckId, song: Song, play?: boolean) => Promise<void>>(async () => {});

  useEffect(() => {
    const advance = (id: DeckId) => {
      const rest = queuesRef.current[id].slice(1);
      queuesRef.current[id] = rest;
      const nextSong = rest[0];
      setDecks((prev) => ({ ...prev, [id]: { ...prev[id], queue: rest, playing: false } }));
      if (nextSong) void loadRef.current(id, nextSong, true);
    };
    engine.onEnded("a", () => advance("a"));
    engine.onEnded("b", () => advance("b"));
    const syncTheme = () => setLightTheme(document.documentElement.dataset.theme === "light");
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    pause();
    const timer = window.setInterval(() => {
      setDecks((prev) => {
        let changed = false;
        const next = { ...prev };
        (["a", "b"] as DeckId[]).forEach((id) => {
          const live = engine.read(id);
          if (!live || !prev[id].track) return;
          if (live.playing !== prev[id].playing || Math.abs(live.current - prev[id].current) > 0.15 || live.duration !== prev[id].duration) {
            changed = true;
            next[id] = { ...prev[id], ...live };
          }
        });
        return changed ? next : prev;
      });
      setLevels({ a: engine.levels("a"), b: engine.levels("b") });
    }, 160);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      engine.stopAll();
    };
  }, [engine, pause]);

  const patch = (id: DeckId, partial: Partial<DeckState>) => {
    setDecks((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  };

  const loadTrack = async (id: DeckId, song: Song, play = false) => {
    if (!song.audioUrl) return;
    await engine.resume();
    engine.load(id, song.audioUrl);
    const deck = decksRef.current[id];
    engine.setRate(id, deck.rate);
    engine.setKeyLock(id, deck.keyLock);
    engine.setVolume(id, deck.volume);
    engine.setEq(id, "low", deck.low);
    engine.setEq(id, "mid", deck.mid);
    engine.setEq(id, "high", deck.high);
    engine.setFilter(id, deck.filter);
    patch(id, {
      track: song,
      playing: play,
      current: 0,
      cue: 0,
      loopOn: false,
      hotCues: [null, null, null, null],
      duration: song.duration,
      queue: queuesRef.current[id],
    });
    if (play) engine.play(id);
  };
  loadRef.current = loadTrack;

  const queueTracks = async (id: DeckId, songs: Song[]) => {
    const list = songs.filter((song) => song.audioUrl);
    if (!list.length) return;
    queuesRef.current[id] = list;
    await loadTrack(id, list[0], true);
  };

  return (
    <div className="dj-studio flex h-full min-h-0 flex-col gap-2 text-white lg:gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Vibra Studio</h1>
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const next = lightTheme ? "dark" : "light";
            document.documentElement.dataset.theme = next;
            localStorage.setItem("vibra-theme", next);
            setLightTheme(next === "light");
          }}
          aria-label={lightTheme ? "Switch to dark theme" : "Switch to white theme"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e10600] text-white"
        >
          {lightTheme ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button
          type="button"
          onClick={() => setImmersive(!immersive)}
          aria-label={immersive ? "Show sidebar" : "Full mixer"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e10600] text-white"
        >
          {immersive ? <PanelLeft size={16} /> : <Maximize2 size={16} />}
        </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {(
          [
            ["a", "Deck A"],
            ["mix", "Mixer"],
            ["b", "Deck B"],
            ["songs", "Songs"],
            ["jingles", "Jingles"],
            ["deck", "Deck"],
            ["loops", "Loops"],
            ["effects", "Effects"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            className="h-10 shrink-0 rounded-full px-3 text-xs font-semibold"
            style={{
              backgroundColor: panel === id ? (id === "b" ? "#1493ff" : "#e10600") : "#1c1c1c",
              color: "#ffffff",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={cn(
        "grid shrink-0 grid-cols-1 items-start gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_12.5rem_minmax(0,1fr)] lg:gap-3 xl:grid-cols-[minmax(0,1fr)_280px_minmax(0,1fr)]",
        panel !== "a" && panel !== "mix" && panel !== "b" && "max-lg:hidden",
        (panel === "a" || panel === "mix" || panel === "b") && "max-lg:min-h-0 max-lg:flex-1 max-lg:overflow-y-auto"
      )}>
        <div className={cn(panel !== "a" && "max-lg:hidden")}>
        <DeckFace
          id="a"
          deck={decks.a}
          levels={levels.a}
          over={over === "a"}
          onDragOver={(event) => {
            event.preventDefault();
            setOver("a");
          }}
          onDragLeave={() => setOver(null)}
          onDrop={(event) => {
            event.preventDefault();
            setOver(null);
            const song = readDroppedSong(event);
            if (song) void queueTracks("a", [song]);
          }}
          onToggle={() => {
            engine.toggle("a");
            patch("a", { playing: !decks.a.playing });
          }}
          onCue={() => engine.jumpCue("a", decks.a.cue)}
          onSetCue={() => patch("a", { cue: decks.a.current })}
          onSync={() => patch("a", { rate: engine.syncRate("b", "a") })}
          onRate={(direction) => patch("a", { rate: engine.nudgeRate("a", direction) })}
          onSeek={(ratio) => {
            const seconds = ratio * (decks.a.duration || decks.a.track?.duration || 0);
            engine.seek("a", seconds);
            patch("a", { current: seconds });
          }}
          onScratch={(delta) => engine.scratch("a", delta)}
          onLoop={(seconds) => {
            const loop = engine.toggleLoop("a", seconds);
            patch("a", { loopOn: loop.on, loopSeconds: loop.seconds });
          }}
          onHotCue={(index) => {
            const existing = decks.a.hotCues[index];
            if (existing == null) {
              const hotCues = [...decks.a.hotCues];
              hotCues[index] = decks.a.current;
              patch("a", { hotCues });
              return;
            }
            engine.jumpCue("a", existing);
          }}
          onEq={(band, value) => {
            engine.setEq("a", band, value);
            patch("a", { [band]: value });
          }}
          onVolume={(value) => {
            engine.setVolume("a", value);
            patch("a", { volume: value });
          }}
          onKeyLock={() => {
            const keyLock = !decks.a.keyLock;
            engine.setKeyLock("a", keyLock);
            patch("a", { keyLock });
          }}
          onStinger={(kind) => void engine.resume().then(() => engine.playStinger(kind))}
          onBend={(amount) => engine.bend("a", amount)}
          onReleaseBend={() => engine.releaseBend("a")}
          onBeat={(beats) => engine.beatJump("a", beats, decks.a.bpm)}
          onBrake={() => engine.brake("a")}
          onFilter={(value) => {
            engine.setFilter("a", value);
            patch("a", { filter: value });
          }}
          onBpm={(value) => patch("a", { bpm: value })}
        />
        </div>

        <section className={cn("flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111] p-3", panel !== "mix" && "max-lg:hidden")}>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500">Mixer</p>
          <div className="grid grid-cols-3 justify-items-center gap-2">
            <Fader tone="a" label="Gain A" value={decks.a.volume} onChange={(value) => {
              engine.setVolume("a", value);
              patch("a", { volume: value });
            }} />
            <Fader tone="m" label="Master" value={master} onChange={(value) => {
              setMaster(value);
              engine.setMaster(value);
            }} />
            <Fader tone="b" label="Gain B" value={decks.b.volume} onChange={(value) => {
              engine.setVolume("b", value);
              patch("b", { volume: value });
            }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <EqStack title="A" tone="a" deck={decks.a} onEq={(band, value) => {
              engine.setEq("a", band, value);
              patch("a", { [band]: value });
            }} />
            <EqStack title="B" tone="b" deck={decks.b} onEq={(band, value) => {
              engine.setEq("b", band, value);
              patch("b", { [band]: value });
            }} />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <MixerButton label="Horn" onClick={() => void engine.resume().then(() => engine.playStinger("airhorn"))} />
            <MixerButton label="Hit" onClick={() => void engine.resume().then(() => engine.playStinger("impact"))} />
            <MixerButton label="Rise" onClick={() => void engine.resume().then(() => engine.playStinger("riser"))} />
            <MixerButton label="Brake A" onClick={() => engine.brake("a")} />
            <MixerButton label={echoOn ? "Echo on" : "Echo"} onClick={() => {
              const next = !echoOn;
              setEchoOn(next);
              engine.setEcho("a", next ? 0.65 : 0);
              engine.setEcho("b", next ? 0.65 : 0);
            }} />
            <MixerButton label="Brake B" tone="b" onClick={() => engine.brake("b")} />
          </div>
          <label className="mt-auto block text-[10px] uppercase tracking-wider text-white/40">
            Crossfader
            <input
              aria-label="Crossfader"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={cross}
              onChange={(event) => {
                const value = Number(event.target.value);
                setCross(value);
                engine.setCrossfader(value);
              }}
              className="dj-fader mt-2 w-full"
            />
            <span className="mt-1 flex justify-between">
              <span>A</span>
              <span>B</span>
            </span>
          </label>
        </section>

        <div className={cn(panel !== "b" && "max-lg:hidden")}>
        <DeckFace
          id="b"
          deck={decks.b}
          levels={levels.b}
          over={over === "b"}
          onDragOver={(event) => {
            event.preventDefault();
            setOver("b");
          }}
          onDragLeave={() => setOver(null)}
          onDrop={(event) => {
            event.preventDefault();
            setOver(null);
            const song = readDroppedSong(event);
            if (song) void queueTracks("b", [song]);
          }}
          onToggle={() => {
            engine.toggle("b");
            patch("b", { playing: !decks.b.playing });
          }}
          onCue={() => engine.jumpCue("b", decks.b.cue)}
          onSetCue={() => patch("b", { cue: decks.b.current })}
          onSync={() => patch("b", { rate: engine.syncRate("a", "b") })}
          onRate={(direction) => patch("b", { rate: engine.nudgeRate("b", direction) })}
          onSeek={(ratio) => {
            const seconds = ratio * (decks.b.duration || decks.b.track?.duration || 0);
            engine.seek("b", seconds);
            patch("b", { current: seconds });
          }}
          onScratch={(delta) => engine.scratch("b", delta)}
          onLoop={(seconds) => {
            const loop = engine.toggleLoop("b", seconds);
            patch("b", { loopOn: loop.on, loopSeconds: loop.seconds });
          }}
          onHotCue={(index) => {
            const existing = decks.b.hotCues[index];
            if (existing == null) {
              const hotCues = [...decks.b.hotCues];
              hotCues[index] = decks.b.current;
              patch("b", { hotCues });
              return;
            }
            engine.jumpCue("b", existing);
          }}
          onEq={(band, value) => {
            engine.setEq("b", band, value);
            patch("b", { [band]: value });
          }}
          onVolume={(value) => {
            engine.setVolume("b", value);
            patch("b", { volume: value });
          }}
          onKeyLock={() => {
            const keyLock = !decks.b.keyLock;
            engine.setKeyLock("b", keyLock);
            patch("b", { keyLock });
          }}
          onStinger={(kind) => void engine.resume().then(() => engine.playStinger(kind))}
          onBend={(amount) => engine.bend("b", amount)}
          onReleaseBend={() => engine.releaseBend("b")}
          onBeat={(beats) => engine.beatJump("b", beats, decks.b.bpm)}
          onBrake={() => engine.brake("b")}
          onFilter={(value) => {
            engine.setFilter("b", value);
            patch("b", { filter: value });
          }}
          onBpm={(value) => patch("b", { bpm: value })}
        />
        </div>
      </div>

      <StudioTools
        mobileTab={panel === "songs" || panel === "jingles" || panel === "deck" || panel === "loops" || panel === "effects" ? panel : null}
        decks={decks}
        onJingle={(url) => void engine.resume().then(() => engine.playJingle(url))}
        onStinger={(kind) => void engine.resume().then(() => engine.playStinger(kind))}
        onRate={(id, rate) => {
          engine.setRate(id, rate);
          patch(id, { rate });
        }}
        onKeyLock={(id, locked) => {
          engine.setKeyLock(id, locked);
          patch(id, { keyLock: locked });
        }}
        onVolume={(id, value) => {
          engine.setVolume(id, value);
          patch(id, { volume: value });
        }}
        onBpm={(id, bpm) => patch(id, { bpm })}
        onLoop={(id, seconds) => {
          const loop = engine.toggleLoop(id, seconds);
          patch(id, { loopOn: loop.on, loopSeconds: loop.seconds });
        }}
        onFilter={(id, value) => {
          engine.setFilter(id, value);
          patch(id, { filter: value });
        }}
        onEcho={(id, value) => engine.setEcho(id, value)}
        onBrake={(id) => engine.brake(id)}
        onLoad={(song, deck) => void queueTracks(deck, [song])}
        onLoadMany={(songs, deck) => void queueTracks(deck, songs)}
      />
    </div>
  );
}

function DeckFace({
  id,
  deck,
  levels,
  over,
  onDragOver,
  onDragLeave,
  onDrop,
  onToggle,
  onCue,
  onSetCue,
  onSync,
  onRate,
  onSeek,
  onScratch,
  onLoop,
  onHotCue,
  onKeyLock,
  onStinger,
  onBend,
  onReleaseBend,
  onBeat,
  onBrake,
  onFilter,
  onBpm,
}: {
  id: DeckId;
  deck: DeckState;
  levels: number[];
  over: boolean;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
  onToggle: () => void;
  onCue: () => void;
  onSetCue: () => void;
  onSync: () => void;
  onRate: (direction: -1 | 1) => void;
  onSeek: (ratio: number) => void;
  onScratch: (delta: number) => void;
  onLoop: (seconds: number) => void;
  onHotCue: (index: number) => void;
  onKeyLock: () => void;
  onEq: (band: "low" | "mid" | "high", value: number) => void;
  onVolume: (value: number) => void;
  onStinger: (kind: StingerKind) => void;
  onBend: (amount: number) => void;
  onReleaseBend: () => void;
  onBeat: (beats: number) => void;
  onBrake: () => void;
  onFilter: (value: number) => void;
  onBpm: (value: number) => void;
}) {
  const duration = deck.duration || deck.track?.duration || 0;
  const ratio = duration ? Math.min(1, deck.current / duration) : 0;
  const remain = Math.max(duration - deck.current, 0);
  const bars = (levels.length ? levels : Array.from({ length: 42 }, () => 10)).slice(0, 42);
  const blue = id === "b";
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!deck.playing) return;
    let frame = 0;
    const tick = (now: number) => {
      setPhase(now / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [deck.playing]);

  return (
    <article
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "rounded-2xl border p-3",
        blue ? "bg-[#0c1c2e]" : "bg-[#111]",
        over ? (blue ? "border-[#1493ff]" : "border-[#e10600]") : "border-white/10"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{deck.track?.title ?? `Deck ${id.toUpperCase()}`}</p>
          <p className="truncate text-xs text-white/45">{deck.track?.artistName ?? "Drop a song here"}</p>
        </div>
        <p className={cn("text-lg font-semibold tabular-nums", blue ? "text-[#1493ff]" : "text-[#e10600]")}>{deck.rate.toFixed(2)}</p>
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
        <span>Elapsed {formatTime(deck.current)}</span>
        <span>Remain {formatTime(remain)}</span>
        <span>Pitch {deck.rate >= 1 ? "+" : ""}{((deck.rate - 1) * 100).toFixed(0)}</span>
      </div>
      <button
        type="button"
        aria-label={`Waveform deck ${id}`}
        className="mt-2 flex h-12 w-full touch-none items-end gap-px overflow-hidden rounded-md bg-black/50 px-1 sm:h-14"
        onPointerDown={(event) => {
          const bar = event.currentTarget;
          const seekAt = (clientX: number) => {
            const rect = bar.getBoundingClientRect();
            onSeek(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)));
          };
          seekAt(event.clientX);
          bar.setPointerCapture(event.pointerId);
          const move = (pointer: PointerEvent) => seekAt(pointer.clientX);
          const up = () => {
            bar.removeEventListener("pointermove", move);
            bar.removeEventListener("pointerup", up);
          };
          bar.addEventListener("pointermove", move);
          bar.addEventListener("pointerup", up);
        }}
      >
        {bars.map((bar, index) => (
          <span
            key={index}
            className={cn("min-w-0 flex-1 rounded-sm", index / bars.length <= ratio ? (blue ? "bg-[#1493ff]" : "bg-[#e10600]") : "bg-[#3a3a3a]")}
            style={{
              height: `${Math.max(
                18,
                ((bar / 255) * (deck.playing ? 0.45 + 0.55 * Math.abs(Math.sin(index * 0.5 + phase * 6) * Math.cos(index * 0.18 + phase * 3)) : 0.35)) * 100
              )}%`,
            }}
          />
        ))}
      </button>

      <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="grid grid-cols-2 gap-1">
          {stingers.slice(0, 4).map((kind) => (
            <button key={kind} type="button" onClick={() => onStinger(kind)} className="rounded-md bg-black px-1 py-2 text-[9px] uppercase text-white/80">
              {kind}
            </button>
          ))}
        </div>
        <div
          className={cn(
            "mx-auto flex h-16 w-16 touch-none items-center justify-center rounded-full border-8 bg-black shadow-inner sm:h-20 sm:w-20 sm:border-[10px]",
            blue ? "border-[#16324d]" : "border-[#2a2a2a]"
          )}
          onPointerDown={(event) => {
            let lastX = event.clientX;
            const target = event.currentTarget;
            target.setPointerCapture(event.pointerId);
            const move = (pointer: PointerEvent) => {
              onScratch((pointer.clientX - lastX) / 40);
              lastX = pointer.clientX;
            };
            const up = () => {
              target.removeEventListener("pointermove", move);
              target.removeEventListener("pointerup", up);
            };
            target.addEventListener("pointermove", move);
            target.addEventListener("pointerup", up);
          }}
        >
          <span className={cn("h-3 w-10 rounded-full", blue ? "bg-[#1493ff]" : "bg-[#e10600]", deck.playing && "animate-spin")} />
        </div>
        <div className="flex flex-col gap-1">
          {deck.hotCues.map((cue, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onHotCue(index)}
              className={cn("rounded-md px-2 py-1 text-[10px] font-semibold", cue == null ? "bg-black text-white/50" : blue ? "bg-[#1493ff] text-white" : "bg-[#e10600] text-white")}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <button type="button" onClick={onSetCue} className="rounded-md bg-black px-2 py-1.5 text-[10px] text-white">Set</button>
        <button type="button" onClick={onCue} className={cn("rounded-md px-3 py-1.5 text-[10px] font-bold text-white", blue ? "bg-[#1493ff]" : "bg-[#e10600]")}>Cue</button>
        <button type="button" onClick={onToggle} disabled={!deck.track} className={cn("flex h-9 w-9 items-center justify-center rounded-full text-white disabled:opacity-40", blue ? "bg-[#1493ff]" : "bg-[#e10600]")}>
          {deck.playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <button type="button" onClick={onSync} className="rounded-md bg-black px-3 py-1.5 text-[10px] font-bold text-white">Sync</button>
        <button type="button" onClick={onKeyLock} className={cn("rounded-md px-2 py-1.5 text-[10px]", deck.keyLock ? (blue ? "bg-[#1493ff] text-white" : "bg-[#e10600] text-white") : "bg-black text-white/70")}>Key</button>
        <button type="button" onClick={() => onRate(-1)} className="h-7 w-7 rounded-md bg-black text-white">−</button>
        <button type="button" onClick={() => onRate(1)} className="h-7 w-7 rounded-md bg-black text-white">+</button>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {loops.map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => onLoop(seconds)}
            className="h-8 min-w-8 rounded-full px-2 text-[11px] font-bold"
            style={{
              backgroundColor: deck.loopOn && deck.loopSeconds === seconds ? (blue ? "#1493ff" : "#e10600") : loopColors[loops.indexOf(seconds)],
              color: "#ffffff",
            }}
          >
            {seconds}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
        <button type="button" onClick={() => onBeat(-4)} aria-label="Jump back 4 beats" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1c1c]">
          <Rewind size={14} color="#ffffff" />
        </button>
        <button type="button" onClick={() => onBeat(4)} aria-label="Jump forward 4 beats" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1c1c]">
          <FastForward size={14} color="#ffffff" />
        </button>
        <button
          type="button"
          aria-label="Bend slower"
          onPointerDown={() => onBend(-0.08)}
          onPointerUp={onReleaseBend}
          onPointerCancel={onReleaseBend}
          onPointerLeave={onReleaseBend}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1c1c]"
        >
          <RotateCcw size={15} color="#ffffff" />
        </button>
        <button
          type="button"
          aria-label="Bend faster"
          onPointerDown={() => onBend(0.08)}
          onPointerUp={onReleaseBend}
          onPointerCancel={onReleaseBend}
          onPointerLeave={onReleaseBend}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1c1c]"
        >
          <RotateCw size={15} color="#ffffff" />
        </button>
        <button type="button" onClick={onBrake} aria-label="Brake" className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: blue ? "#1493ff" : "#e10600" }}>
          <CircleStop size={15} color="#ffffff" />
        </button>
      </div>
      <label className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wide text-white/50">
        Filter
        <input aria-label="Filter" type="range" min={0} max={1} step={0.01} value={deck.filter} onChange={(event) => onFilter(Number(event.target.value))} className={cn("min-w-0 flex-1", blue ? "dj-fader-b" : "dj-fader")} />
        <input aria-label="BPM" type="number" min={60} max={200} value={deck.bpm} onChange={(event) => onBpm(Number(event.target.value) || 128)} className="h-7 w-14 rounded bg-black px-1 text-center text-xs text-white" />
      </label>
      {deck.queue.length > 1 && (
        <p className="mt-2 truncate text-[10px] uppercase tracking-wide text-white/50">
          Autoplay · {deck.queue.length - 1} waiting · next {deck.queue[1]?.title}
        </p>
      )}
    </article>
  );
}

function Fader({ label, value, onChange, tone }: { label: string; value: number; onChange: (value: number) => void; tone: "a" | "m" | "b" }) {
  return (
    <label className="flex w-full flex-col items-center gap-2 text-[10px] text-white/55">
      <input
        aria-label={label}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={tone === "b" ? "dj-eq dj-eq-b" : "dj-eq"}
      />
      <span className="text-center leading-tight">{label}</span>
    </label>
  );
}

function MixerButton({ label, onClick, tone = "a" }: { label: string; onClick: () => void; tone?: "a" | "b" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("h-8 rounded-full text-[10px] font-semibold text-white", tone === "b" ? "bg-[#1493ff]" : "bg-[#e10600]")}
    >
      {label}
    </button>
  );
}

function EqStack({ title, tone, deck, onEq }: { title: string; tone: "a" | "b"; deck: DeckState; onEq: (band: "low" | "mid" | "high", value: number) => void }) {
  return (
    <div className="space-y-1">
      <p className={cn("text-center text-[10px] font-semibold", tone === "b" ? "text-[#1493ff]" : "text-[#e10600]")}>{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {(["high", "mid", "low"] as const).map((band) => (
          <label key={band} className="flex flex-col items-center gap-1 text-[9px] uppercase text-white/45">
            <input
              aria-label={`${title} ${band}`}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={deck[band]}
              onChange={(event) => onEq(band, Number(event.target.value))}
              className={cn("w-full", tone === "b" ? "dj-fader-b" : "dj-fader")}
            />
            {band === "high" ? "Hi" : band === "mid" ? "Mid" : "Lo"}
          </label>
        ))}
      </div>
    </div>
  );
}

const toolTabs = ["songs", "jingles", "deck", "loops", "effects"] as const;
type ToolTab = (typeof toolTabs)[number];

function StudioTools({
  decks,
  mobileTab = null,
  onJingle,
  onStinger,
  onRate,
  onKeyLock,
  onVolume,
  onBpm,
  onLoop,
  onFilter,
  onEcho,
  onBrake,
  onLoad,
  onLoadMany,
}: {
  decks: { a: DeckState; b: DeckState };
  onJingle: (url: string) => void;
  onStinger: (kind: StingerKind) => void;
  onRate: (id: DeckId, rate: number) => void;
  onKeyLock: (id: DeckId, locked: boolean) => void;
  onVolume: (id: DeckId, value: number) => void;
  onBpm: (id: DeckId, bpm: number) => void;
  onLoop: (id: DeckId, seconds: number) => void;
  onFilter: (id: DeckId, value: number) => void;
  onEcho: (id: DeckId, value: number) => void;
  onBrake: (id: DeckId) => void;
  onLoad: (song: Song, deck: DeckId) => void;
  onLoadMany: (songs: Song[], deck: DeckId) => void;
  mobileTab?: ToolTab | null;
}) {
  const [tab, setTab] = useState<ToolTab>("songs");
  const shown = mobileTab ?? tab;
  const [deckId, setDeckId] = useState<DeckId>("a");
  const [echo, setEcho] = useState(0);
  const [jingles, setJingles] = useState<Array<{ name: string; url: string }>>([]);
  const deck = decks[deckId];
  const labels: Record<ToolTab, string> = {
    songs: "Songs",
    jingles: "Jingles",
    deck: "Deck",
    loops: "Loops",
    effects: "Effects",
  };

  return (
    <section className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] p-3", mobileTab == null && "max-lg:hidden")}>
      <div className="hidden gap-2 overflow-x-auto pb-2 lg:flex">
        {toolTabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "h-10 shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-wide",
              tab === item ? "bg-[#e10600] text-white" : "bg-black text-white/60"
            )}
          >
            {labels[item]}
          </button>
        ))}
      </div>
      {shown !== "songs" && (
        <div className="mb-2 flex gap-2">
          {(["a", "b"] as DeckId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setDeckId(id)}
              className={cn("h-9 rounded-full px-3 text-xs font-semibold text-white", deckId === id ? (id === "b" ? "bg-[#1493ff]" : "bg-[#e10600]") : "bg-black")}
            >
              Deck {id.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      {shown === "songs" && <Browser onLoad={onLoad} onLoadMany={onLoadMany} embedded />}
      {shown === "jingles" && (
        <div className="space-y-3">
          <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-[#e10600] px-4 text-xs font-semibold text-white">
            Upload jingle
            <input
              className="sr-only"
              type="file"
              accept="audio/*,.mp3,.wav,.m4a"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setJingles((current) => [{ name: file.name.replace(/\.[^.]+$/, ""), url: URL.createObjectURL(file) }, ...current]);
                event.target.value = "";
              }}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {stingers.map((kind) => (
              <button key={kind} type="button" onClick={() => onStinger(kind)} className="rounded-md bg-black px-3 py-2 text-[10px] uppercase text-white">
                {kind}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {jingles.map((jingle) => (
              <button key={jingle.url} type="button" onClick={() => onJingle(jingle.url)} className="truncate rounded-xl bg-black px-3 py-3 text-left text-xs text-white">
                {jingle.name}
              </button>
            ))}
            {jingles.length === 0 && <p className="text-xs text-white/45">Upload a jingle, then tap it to play over the mix.</p>}
          </div>
        </div>
      )}
      {shown === "deck" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[10px] uppercase tracking-wide text-white/50">
            Pitch {deck.rate.toFixed(2)}
            <input type="range" min={0.5} max={2} step={0.01} value={deck.rate} onChange={(event) => onRate(deckId, Number(event.target.value))} className={cn("mt-1 w-full", deckId === "b" ? "dj-fader-b" : "dj-fader")} />
          </label>
          <label className="text-[10px] uppercase tracking-wide text-white/50">
            Gain
            <input type="range" min={0} max={1} step={0.01} value={deck.volume} onChange={(event) => onVolume(deckId, Number(event.target.value))} className={cn("mt-1 w-full", deckId === "b" ? "dj-fader-b" : "dj-fader")} />
          </label>
          <label className="text-[10px] uppercase tracking-wide text-white/50">
            BPM
            <input type="number" min={60} max={200} value={deck.bpm} onChange={(event) => onBpm(deckId, Number(event.target.value) || 128)} className="mt-1 h-10 w-full rounded-lg bg-black px-3 text-sm text-white" />
          </label>
          <button type="button" onClick={() => onKeyLock(deckId, !deck.keyLock)} className={cn("h-10 self-end rounded-full text-xs font-semibold text-white", deck.keyLock ? (deckId === "b" ? "bg-[#1493ff]" : "bg-[#e10600]") : "bg-black")}>
            Key lock {deck.keyLock ? "on" : "off"}
          </button>
        </div>
      )}
      {shown === "loops" && (
        <div className="flex flex-wrap gap-2">
          {loops.map((seconds) => (
            <button
              key={seconds}
              type="button"
              onClick={() => onLoop(deckId, seconds)}
              className={cn("h-10 min-w-10 rounded-full px-4 text-xs font-bold", deck.loopOn && deck.loopSeconds === seconds && "ring-2 ring-white")}
              style={{
                backgroundColor: loopColors[loops.indexOf(seconds)],
                color: "#ffffff",
              }}
            >
              {seconds} beats
            </button>
          ))}
        </div>
      )}
      {shown === "effects" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[10px] uppercase tracking-wide text-white/50">
            Filter
            <input type="range" min={0} max={1} step={0.01} value={deck.filter} onChange={(event) => onFilter(deckId, Number(event.target.value))} className={cn("mt-1 w-full", deckId === "b" ? "dj-fader-b" : "dj-fader")} />
          </label>
          <label className="text-[10px] uppercase tracking-wide text-white/50">
            Echo
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={echo}
              onChange={(event) => {
                const value = Number(event.target.value);
                setEcho(value);
                onEcho(deckId, value);
              }}
              className={cn("mt-1 w-full", deckId === "b" ? "dj-fader-b" : "dj-fader")}
            />
          </label>
          <button type="button" onClick={() => onBrake(deckId)} className={cn("h-10 rounded-full text-xs font-semibold text-white", deckId === "b" ? "bg-[#1493ff]" : "bg-[#e10600]")}>
            Brake deck {deckId.toUpperCase()}
          </button>
        </div>
      )}
    </section>
  );
}

function Browser({ onLoad, onLoadMany, embedded = false }: { onLoad: (song: Song, deck: DeckId) => void; onLoadMany: (songs: Song[], deck: DeckId) => void; embedded?: boolean }) {
  const keyboard = useKeyboardFrame();
  const [tab, setTab] = useState<"vibra" | "online" | "device">("vibra");
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [note, setNote] = useState("");
  const [rights, setRights] = useState(true);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (tab !== "vibra") return;
    const handle = window.setTimeout(() => {
      const q = query.trim();
      if (q.length < 2) {
        setSongs([]);
        return;
      }
      fetch(`/api/music/search?source=vibra&q=${encodeURIComponent(q)}`)
        .then((response) => response.json())
        .then((body: { songs?: Song[] }) => setSongs((body.songs ?? []).filter((song) => song.audioUrl).slice(0, 20)))
        .catch(() => setSongs([]));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query, tab]);

  const importLocal = async (file: File) => {
    setBusy(true);
    setNote("");
    const duration = Math.round(await getAudioDurationFromFile(file));
    const tags = readId3(new Uint8Array(await file.arrayBuffer()));
    const title = tags.title || file.name.replace(/\.[^.]+$/, "");
    const artistName = tags.artist || "Unknown artist";
    if (!rights) {
      const local: Song = {
        id: `local-${file.name}-${file.size}`,
        title,
        artistId: "local",
        artistName,
        albumId: "local",
        albumTitle: tags.album || title,
        cover: "/vibra-logo.jpg",
        duration,
        genre: "Music",
        plays: 0,
        releaseDate: new Date().toISOString().slice(0, 10),
        audioUrl: URL.createObjectURL(file),
      };
      setSongs((current) => [local, ...current.filter((song) => song.id !== local.id)]);
      setNote("Loaded on this device only.");
      setBusy(false);
      return;
    }
    const body = new FormData();
    body.set("audio", file);
    body.set("title", title);
    body.set("artistName", artistName);
    body.set("duration", String(duration));
    body.set("copyrightConfirmed", "true");
    const response = await fetch("/api/dj/import", { method: "POST", body });
    const data = (await response.json()) as { song?: Song; saved?: boolean; error?: string };
    setBusy(false);
    if (!response.ok || !data.song) {
      setNote(data.error || "Could not add that file");
      return;
    }
    setSongs((current) => [data.song!, ...current.filter((song) => song.id !== data.song!.id)]);
    setNote(data.saved ? "Saved to the Vibra catalog." : "Already in the Vibra catalog.");
  };

  return (
    <section
      className={cn(
        embedded && !keyboard.open ? "flex min-h-0 flex-1 flex-col bg-transparent p-0" : "rounded-2xl border border-white/10 bg-[#111] p-3",
        keyboard.open && "fixed inset-x-0 z-[80] flex flex-col overflow-hidden rounded-none border-x-0 px-3 pt-3"
      )}
      style={keyboard.open ? { top: keyboard.top, height: keyboard.height } : undefined}
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(["vibra", "online", "device"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn("h-10 shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-wide", tab === item ? "bg-[#e10600] text-white" : "bg-black text-white/60")}
          >
            {item === "vibra" ? "Vibra" : item === "online" ? "Online" : "This device"}
          </button>
        ))}
        {tab === "vibra" && (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Vibra"
            enterKeyHint="search"
            className="h-11 min-w-[10rem] flex-1 rounded-full bg-black px-3 text-base text-white outline-none"
          />
        )}
        {tab === "device" && (
          <label className="inline-flex h-9 cursor-pointer items-center rounded-full bg-[#e10600] px-4 text-xs font-semibold text-white">
            {busy ? "Adding…" : "Choose audio"}
            <input
              className="sr-only"
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.flac"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importLocal(file);
                event.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {tab === "device" && (
        <label className="mt-2 flex items-center gap-2 text-xs text-white/55">
          <input type="checkbox" checked={rights} onChange={(event) => setRights(event.target.checked)} />
          Add to the Vibra catalog when this song is not already there
        </label>
      )}
      {note && <p className="mt-2 text-xs text-white/70">{note}</p>}
      {tab === "online" && <WebBrowser onLoad={onLoad} lifted={keyboard.open} />}
      {tab !== "online" && (
      <div className={cn("mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto", keyboard.open && "pb-3")}>
        {picked.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => { onLoadMany(songs.filter((song) => picked.includes(song.id)), "a"); setPicked([]); }} className="h-10 rounded-full bg-black px-3 text-xs font-semibold text-white">Load {picked.length} on A</button>
            <button type="button" onClick={() => { onLoadMany(songs.filter((song) => picked.includes(song.id)), "b"); setPicked([]); }} className="h-10 rounded-full bg-[#1493ff] px-3 text-xs font-semibold text-white">Load {picked.length} on B</button>
          </div>
        )}
        {songs.map((song) => (
          <div
            key={song.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(SONG_DRAG_TYPE, songPayload(song));
              event.dataTransfer.setData("text/plain", songPayload(song));
            }}
            className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-white/5"
          >
            <input
              type="checkbox"
              aria-label={`Select ${song.title}`}
              checked={picked.includes(song.id)}
              onChange={() => setPicked((current) => current.includes(song.id) ? current.filter((id) => id !== song.id) : [...current, song.id])}
              className="h-4 w-4 accent-[#e10600]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{song.title}</p>
              <p className="truncate text-xs text-white/40">{song.artistName}</p>
            </div>
            <button type="button" onClick={() => onLoad(song, "a")} className="h-10 shrink-0 rounded-full bg-black px-3 text-xs font-semibold text-white">Deck A</button>
            <button type="button" onClick={() => onLoad(song, "b")} className="h-10 shrink-0 rounded-full bg-[#1493ff] px-3 text-xs font-semibold text-white">Deck B</button>
          </div>
        ))}
        {tab === "vibra" && query.trim().length >= 2 && songs.length === 0 && (
          <p className="px-2 py-3 text-sm text-white/40">No playable songs for that search.</p>
        )}
      </div>
      )}
    </section>
  );
}

function WebBrowser({ onLoad, lifted }: { onLoad: (song: Song, deck: DeckId) => void; lifted: boolean }) {
  const [address, setAddress] = useState("");
  const [page, setPage] = useState("");
  const [results, setResults] = useState<Array<{ title: string; url: string; snippet: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState("");

  const search = async (value: string) => {
    const q = value.trim();
    setPage("");
    setNotice("");
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const response = await fetch(`/api/dj/web-search?q=${encodeURIComponent(q)}`);
    const data = (await response.json()) as { results?: Array<{ title: string; url: string; snippet: string }>; error?: string };
    setSearching(false);
    setResults(data.results ?? []);
    if (!response.ok) setNotice(data.error || "Search failed");
  };

  const openResult = (url: string) => {
    setPage(url);
    setAddress(url);
  };

  const loadAudio = (url: string, title: string, deck: DeckId) => {
    onLoad({
      id: url,
      title,
      artistId: "web",
      artistName: new URL(url).hostname,
      albumId: "web",
      albumTitle: "Web",
      cover: "/vibra-logo.jpg",
      duration: 0,
      genre: "Music",
      plays: 0,
      releaseDate: new Date().toISOString().slice(0, 10),
      audioUrl: url,
    }, deck);
  };

  return (
    <div className={cn("mt-3 overflow-hidden rounded-xl border border-white/10 bg-black", lifted && "flex min-h-0 flex-1 flex-col")}>
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e10600]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        {page && (
          <button type="button" onClick={() => setPage("")} className="text-xs text-white/60">
            Back
          </button>
        )}
        <form
          className="min-w-0 flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            const value = address.trim();
            if (value.startsWith("http://") || value.startsWith("https://")) {
              openResult(value);
              return;
            }
            void search(value);
          }}
        >
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Search the web for a song"
            enterKeyHint="search"
            className="h-11 w-full rounded-full bg-[#111] px-3 text-base text-white outline-none"
          />
        </form>
      </div>
      <div className={cn("overflow-y-auto", lifted ? "min-h-0 flex-1" : "h-[min(28rem,55dvh)]")}>
        {page ? (
          <iframe title="Web search" src={page} className="h-full w-full bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        ) : (
          <div className="space-y-1 p-2">
            {searching && <p className="px-2 py-3 text-sm text-white/40">Searching the web…</p>}
            {notice && <p className="px-2 py-3 text-sm text-[#e10600]">{notice}</p>}
            {!searching && results.length === 0 && <p className="px-2 py-6 text-center text-sm text-white/40">Search a song. Results open in this browser, under the mixer.</p>}
            {results.map((result) => {
              const audio = /\.(mp3|wav|m4a|aac|ogg|flac)(\?|$)/i.test(result.url);
              return (
                <div key={result.url} className="rounded-xl px-2 py-2 hover:bg-white/5">
                  <button type="button" onClick={() => openResult(result.url)} className="block w-full text-left">
                    <p className="truncate text-sm text-white">{result.title}</p>
                    <p className="truncate text-[11px] text-[#e10600]">{result.url}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-white/45">{result.snippet}</p>
                  </button>
                  {audio && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => loadAudio(result.url, result.title, "a")} className="rounded-full bg-[#111] px-2 py-1 text-[10px] text-white">Load A</button>
                      <button type="button" onClick={() => loadAudio(result.url, result.title, "b")} className="rounded-full bg-[#1493ff] px-2 py-1 text-[10px] text-white">Load B</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
