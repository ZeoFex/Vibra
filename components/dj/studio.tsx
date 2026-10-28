"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Disc3, Maximize2, PanelLeft, Pause, Play, RotateCcw, Search, Zap } from "lucide-react";
import { DjEngine, SONG_DRAG_TYPE, type DeckId, type DjTrack, type StingerKind } from "@/lib/dj/engine";
import { useDjChrome } from "@/lib/dj/chrome";
import { usePlayer } from "@/lib/contexts/app-context";
import type { Song } from "@/types";
import { cn } from "@/lib/utils";

const emptyDeck = () => ({
  track: null as DjTrack | null,
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
});

const stingers: Array<{ kind: StingerKind; label: string }> = [
  { kind: "airhorn", label: "Airhorn" },
  { kind: "impact", label: "Impact" },
  { kind: "riser", label: "Riser" },
  { kind: "siren", label: "Siren" },
  { kind: "stab", label: "Stab" },
];

function songPayload(song: Song) {
  return JSON.stringify({
    id: song.id,
    title: song.title,
    artistName: song.artistName,
    cover: song.cover,
    audioUrl: song.audioUrl,
    duration: song.duration,
  });
}

function readDroppedSong(event: DragEvent): Song | null {
  const raw = event.dataTransfer.getData(SONG_DRAG_TYPE);
  if (!raw) return null;
  try {
    const song = JSON.parse(raw) as Song;
    return song.audioUrl ? song : null;
  } catch {
    return null;
  }
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function DjStudio() {
  const engine = useMemo(() => new DjEngine(), []);
  const { pause } = usePlayer();
  const [decks, setDecks] = useState({ a: emptyDeck(), b: emptyDeck() });
  const [cross, setCross] = useState(0.5);
  const [master, setMaster] = useState(0.9);
  const [levels, setLevels] = useState<Record<DeckId, number[]>>({ a: [], b: [] });
  const [picker, setPicker] = useState<DeckId | "crate" | null>(null);
  const [over, setOver] = useState<DeckId | null>(null);
  const [jingles, setJingles] = useState<Array<DjTrack | null>>([null, null, null]);
  const [crate, setCrate] = useState<Song[]>([]);
  const { immersive, setImmersive } = useDjChrome();
  const decksRef = useRef(decks);
  decksRef.current = decks;

  useEffect(() => {
    pause();
    const timer = window.setInterval(() => {
      setDecks((prev) => {
        let changed = false;
        const next = { ...prev };
        (["a", "b"] as DeckId[]).forEach((id) => {
          const live = engine.read(id);
          if (!live || !prev[id].track) return;
          if (
            live.playing !== prev[id].playing ||
            Math.abs(live.current - prev[id].current) > 0.2 ||
            live.duration !== prev[id].duration
          ) {
            changed = true;
            next[id] = { ...prev[id], ...live };
          }
        });
        return changed ? next : prev;
      });
      setLevels({ a: engine.levels("a"), b: engine.levels("b") });
    }, 200);
    return () => {
      window.clearInterval(timer);
      engine.stopAll();
    };
  }, [engine, pause]);

  const loadTrack = async (id: DeckId, song: Song) => {
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
    setDecks((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        track: {
          id: song.id,
          title: song.title,
          artistName: song.artistName,
          cover: song.cover,
          audioUrl: song.audioUrl!,
          duration: song.duration,
        },
        playing: false,
        current: 0,
        cue: 0,
        loopOn: false,
        hotCues: [null, null, null, null],
      },
    }));
    setPicker(null);
    setCrate((prev) => [song, ...prev.filter((item) => item.id !== song.id)].slice(0, 16));
  };

  const onDropDeck = (id: DeckId, event: DragEvent) => {
    event.preventDefault();
    setOver(null);
    const song = readDroppedSong(event);
    if (song) void loadTrack(id, song);
  };

  const patch = (id: DeckId, partial: Partial<ReturnType<typeof emptyDeck>>) => {
    setDecks((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  };

  return (
    <div className={cn("mx-auto flex flex-col gap-3", immersive ? "h-full max-w-none" : "max-w-6xl gap-4")}>
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-base font-semibold tracking-[0.18em] text-violet-200 uppercase sm:text-lg">Vibra Studio</h1>
        {immersive ? (
          <button
            type="button"
            onClick={() => setImmersive(false)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-black"
          >
            <PanelLeft size={14} />
            <span className="hidden min-[380px]:inline">Show sidebar</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setImmersive(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#5b21b6] px-3 text-xs font-semibold text-white"
          >
            <Maximize2 size={14} />
            <span className="hidden min-[380px]:inline">Full mixer</span>
          </button>
        )}
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {(["a", "b"] as DeckId[]).map((id) => (
          <DeckPanel
            key={id}
            id={id}
            deck={decks[id]}
            levels={levels[id]}
            over={over === id}
            onDragOver={(event) => {
              event.preventDefault();
              setOver(id);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(event) => onDropDeck(id, event)}
            onScratch={(delta) => {
              engine.scratch(id, delta);
              const live = engine.read(id);
              if (live) patch(id, { current: live.current });
            }}
            onLoad={() => setPicker(id)}
            onToggle={() => {
              engine.toggle(id);
              patch(id, { playing: !decks[id].playing });
            }}
            onSeek={(ratio) => {
              const seconds = ratio * (decks[id].duration || decks[id].track?.duration || 0);
              engine.seek(id, seconds);
              patch(id, { current: seconds });
            }}
            onCue={() => {
              engine.jumpCue(id, decks[id].cue);
            }}
            onSetCue={() => patch(id, { cue: decks[id].current })}
            onRate={(direction) => patch(id, { rate: engine.nudgeRate(id, direction) })}
            onKeyLock={() => {
              const keyLock = !decks[id].keyLock;
              engine.setKeyLock(id, keyLock);
              patch(id, { keyLock });
            }}
            onVolume={(volume) => {
              engine.setVolume(id, volume);
              patch(id, { volume });
            }}
            onEq={(band, value) => {
              engine.setEq(id, band, value);
              patch(id, { [band]: value });
            }}
            onLoop={(seconds) => {
              const loop = engine.toggleLoop(id, seconds);
              patch(id, { loopOn: loop.on, loopSeconds: loop.seconds });
            }}
            onHotCue={(index) => {
              const existing = decks[id].hotCues[index];
              if (existing == null) {
                const hotCues = [...decks[id].hotCues];
                hotCues[index] = decks[id].current;
                patch(id, { hotCues });
                return;
              }
              engine.jumpCue(id, existing);
            }}
            onClearCue={(index) => {
              const hotCues = [...decks[id].hotCues];
              hotCues[index] = null;
              patch(id, { hotCues });
            }}
            onSync={() => {
              const other: DeckId = id === "a" ? "b" : "a";
              patch(id, { rate: engine.syncRate(other, id) });
            }}
          />
        ))}
      </div>

      <section className="rounded-2xl border border-violet-400/15 bg-[#1a1028] p-3 sm:rounded-3xl sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wider text-white/45">
          <span>Deck A</span>
          <span>Crossfader</span>
          <span>Deck B</span>
        </div>
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
          className="dj-fader w-full"
        />
        <label className="mt-4 flex items-center gap-3 text-sm text-white/70">
          Master
          <input
            aria-label="Master volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={master}
            onChange={(event) => {
              const value = Number(event.target.value);
              setMaster(value);
              engine.setMaster(value);
            }}
            className="dj-fader min-w-0 flex-1"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-violet-400/15 bg-[#1a1028] p-3 sm:rounded-3xl sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Jingles</h2>
          <p className="text-xs text-white/40">Tap a sound, or drop a song on an open pad</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {stingers.map((stinger) => (
            <button
              key={stinger.kind}
              type="button"
              onClick={() => {
                void engine.resume().then(() => engine.playStinger(stinger.kind));
              }}
              className="min-h-12 rounded-2xl bg-[#5b21b6] px-2 py-3 text-xs font-semibold text-white sm:text-sm"
            >
              {stinger.label}
            </button>
          ))}
          {jingles.map((jingle, index) => (
            <button
              key={`slot-${index}`}
              type="button"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const song = readDroppedSong(event);
                if (!song?.audioUrl) return;
                const next = [...jingles];
                next[index] = {
                  id: song.id,
                  title: song.title,
                  artistName: song.artistName,
                  cover: song.cover,
                  audioUrl: song.audioUrl,
                  duration: song.duration,
                };
                setJingles(next);
                setCrate((prev) => [song, ...prev.filter((item) => item.id !== song.id)].slice(0, 16));
              }}
              onClick={() => {
                if (!jingle) return;
                engine.playJingle(jingle.audioUrl);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                const next = [...jingles];
                next[index] = null;
                setJingles(next);
              }}
              className={cn(
                "min-h-12 truncate rounded-2xl px-2 py-3 text-[11px] font-semibold sm:text-xs",
                jingle ? "bg-fuchsia-700 text-white" : "border border-dashed border-white/20 text-white/40"
              )}
            >
              {jingle ? jingle.title : "Drop jingle"}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-violet-400/15 bg-[#241433]/70 p-3 sm:rounded-3xl sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Crate</h2>
          <button type="button" onClick={() => setPicker("crate")} className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white">
            Add songs
          </button>
        </div>
        {crate.length === 0 ? (
          <p className="text-sm text-white/40">Search a song, then drag it onto Deck A, Deck B, or a jingle pad.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {crate.map((song) => (
              <button
                key={song.id}
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(SONG_DRAG_TYPE, songPayload(song));
                  event.dataTransfer.effectAllowed = "copy";
                }}
                className="w-36 shrink-0 rounded-2xl bg-black/30 p-2 text-left"
              >
                <span className="relative block h-16 overflow-hidden rounded-xl bg-black/40">
                  {song.cover && <Image src={song.cover} alt="" fill className="object-cover" sizes="144px" unoptimized />}
                </span>
                <span className="mt-2 block truncate text-xs font-medium text-white">{song.title}</span>
                <span className="block truncate text-[10px] text-white/40">{song.artistName}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {picker && (
        <TrackPicker
          onClose={() => setPicker(null)}
          onPick={(song) => {
            if (picker === "crate") {
              setCrate((prev) => [song, ...prev.filter((item) => item.id !== song.id)].slice(0, 16));
              setPicker(null);
              return;
            }
            void loadTrack(picker, song);
          }}
        />
      )}
    </div>
  );
}

function DeckPanel({
  id,
  deck,
  levels,
  over,
  onDragOver,
  onDragLeave,
  onDrop,
  onScratch,
  onLoad,
  onToggle,
  onSeek,
  onCue,
  onSetCue,
  onRate,
  onKeyLock,
  onVolume,
  onEq,
  onLoop,
  onHotCue,
  onClearCue,
  onSync,
}: {
  id: DeckId;
  deck: ReturnType<typeof emptyDeck>;
  levels: number[];
  over: boolean;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
  onScratch: (deltaSeconds: number) => void;
  onLoad: () => void;
  onToggle: () => void;
  onSeek: (ratio: number) => void;
  onCue: () => void;
  onSetCue: () => void;
  onRate: (direction: -1 | 1) => void;
  onKeyLock: () => void;
  onVolume: (value: number) => void;
  onEq: (band: "low" | "mid" | "high", value: number) => void;
  onLoop: (seconds: number) => void;
  onHotCue: (index: number) => void;
  onClearCue: (index: number) => void;
  onSync: () => void;
}) {
  const duration = deck.duration || deck.track?.duration || 0;
  const ratio = duration ? Math.min(1, deck.current / duration) : 0;
  const accent = id === "a" ? "from-fuchsia-500 to-violet-500" : "from-cyan-400 to-violet-500";

  return (
    <article
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "min-w-0 rounded-2xl border bg-[#241433]/80 p-3 sm:rounded-3xl sm:p-4",
        over ? "border-fuchsia-300 bg-fuchsia-500/10" : "border-violet-400/15"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className={cn("bg-gradient-to-r bg-clip-text text-sm font-bold uppercase tracking-[0.18em] text-transparent", accent)}>
          Deck {id}
        </p>
        <button type="button" onClick={onLoad} className="rounded-full bg-[#5b21b6] px-3 py-1.5 text-xs font-semibold text-white">
          Load track
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black/40">
          {deck.track?.cover ? (
            <Image src={deck.track.cover} alt="" fill className="object-cover" sizes="80px" unoptimized />
          ) : (
            <Disc3 className="m-auto mt-6 text-white/30" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">{deck.track?.title ?? "Empty deck"}</p>
          <p className="truncate text-sm text-white/45">{deck.track?.artistName ?? "Load a song to mix"}</p>
          <p className="mt-1 text-xs tabular-nums text-white/50">
            {formatTime(deck.current)} / {formatTime(duration)} · {deck.rate.toFixed(2)}×
          </p>
        </div>
      </div>

      <div
        className="mx-auto mt-3 flex h-16 w-16 cursor-grab touch-none items-center justify-center rounded-full border-4 border-violet-400/40 bg-black/50 active:cursor-grabbing sm:h-24 sm:w-24"
        onPointerDown={(event) => {
          let lastX = event.clientX;
          const target = event.currentTarget;
          target.setPointerCapture(event.pointerId);
          const move = (pointer: PointerEvent) => {
            onScratch((pointer.clientX - lastX) / 45);
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
        <Disc3 className={cn("text-violet-200", deck.playing && "animate-spin")} size={36} />
      </div>
      <button
        type="button"
        aria-label={`Seek deck ${id}`}
        className="mt-3 h-10 w-full cursor-ew-resize touch-none overflow-hidden rounded-xl bg-black/40"
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
        <span className="flex h-full items-end gap-0.5 px-1">
          {(levels.length ? levels : Array.from({ length: 24 }, () => 8)).slice(0, 24).map((bar, index) => (
            <span
              key={index}
              className={cn("flex-1 rounded-sm", index / 24 <= ratio ? "bg-violet-400" : "bg-white/15")}
              style={{ height: `${Math.max(12, (bar / 255) * 100)}%` }}
            />
          ))}
        </span>
      </button>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <button type="button" onClick={onToggle} disabled={!deck.track} className="flex h-11 items-center justify-center rounded-full bg-white text-black disabled:opacity-40">
          {deck.playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <button type="button" onClick={onCue} className="h-11 rounded-full border border-white/15 text-xs font-semibold text-white">
          Cue
        </button>
        <button type="button" onClick={onSync} className="inline-flex h-11 items-center justify-center gap-1 rounded-full border border-white/15 text-xs text-white/80">
          <Zap size={12} /> Sync
        </button>
        <button
          type="button"
          onClick={onKeyLock}
          className={cn("h-11 rounded-full text-[11px] font-semibold", deck.keyLock ? "bg-violet-600 text-white" : "border border-white/15 text-white/70")}
        >
          Key
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={onSetCue} className="h-9 flex-1 rounded-full border border-white/15 text-xs text-white/70">
          Set cue
        </button>
        <button type="button" onClick={() => onRate(-1)} className="h-9 w-9 rounded-lg bg-white/10 text-sm text-white">−</button>
        <span className="w-12 text-center text-xs tabular-nums text-white/70">{deck.rate.toFixed(2)}×</span>
        <button type="button" onClick={() => onRate(1)} className="h-9 w-9 rounded-lg bg-white/10 text-sm text-white">+</button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {(["low", "mid", "high"] as const).map((band) => (
          <label key={band} className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-wider text-white/40">
            <input
              aria-label={`${band} EQ`}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={deck[band]}
              onChange={(event) => onEq(band, Number(event.target.value))}
              className="dj-eq"
            />
            {band}
          </label>
        ))}
      </div>

      <label className="mt-3 flex items-center gap-3 text-xs text-white/50">
        Gain
        <input
          aria-label={`Deck ${id} gain`}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={deck.volume}
          onChange={(event) => onVolume(Number(event.target.value))}
          className="dj-fader min-w-0 flex-1"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 4, 8].map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => onLoop(seconds)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs",
              deck.loopOn && deck.loopSeconds === seconds ? "bg-fuchsia-600 text-white" : "bg-white/10 text-white/70"
            )}
          >
            <RotateCcw size={12} />
            {seconds}s
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {deck.hotCues.map((cue, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onHotCue(index)}
            onContextMenu={(event) => {
              event.preventDefault();
              onClearCue(index);
            }}
            className={cn(
              "rounded-xl py-2 text-xs font-semibold",
              cue == null ? "border border-dashed border-white/20 text-white/40" : "bg-[#5b21b6] text-white"
            )}
          >
            {cue == null ? `Pad ${index + 1}` : formatTime(cue)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] leading-snug text-white/35">Tap a pad to store or jump. Right-click a pad to clear it.</p>
    </article>
  );
}

function TrackPicker({ onClose, onPick }: { onClose: () => void; onPick: (song: Song) => void }) {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const q = query.trim();
      if (q.length < 2) {
        setSongs([]);
        return;
      }
      setLoading(true);
      fetch(`/api/music/search?q=${encodeURIComponent(q)}`)
        .then((response) => response.json())
        .then((body: { songs?: Song[] }) => {
          setSongs((body.songs ?? []).filter((song) => song.audioUrl).slice(0, 12));
        })
        .catch(() => setSongs([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-3 sm:items-center">
      <div className="w-full max-w-lg rounded-3xl border border-violet-400/20 bg-[#1a1028] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Load a track</h2>
          <button type="button" onClick={onClose} className="text-sm text-white/50">
            Close
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-[#0c0714]/70 px-3">
          <Search size={16} className="text-white/40" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search songs"
            className="h-11 w-full bg-transparent text-sm text-white outline-none"
          />
        </div>
        <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {loading && <p className="px-2 py-4 text-sm text-white/40">Searching…</p>}
          {!loading && query.trim().length >= 2 && songs.length === 0 && (
            <p className="px-2 py-4 text-sm text-white/40">No playable songs for that search.</p>
          )}
          {songs.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => onPick(song)}
              className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-white/5"
            >
              <span className="relative h-10 w-10 overflow-hidden rounded-lg bg-black/40">
                {song.cover && <Image src={song.cover} alt="" fill className="object-cover" sizes="40px" unoptimized />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-white">{song.title}</span>
                <span className="block truncate text-xs text-white/45">{song.artistName}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
