"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Maximize2, PanelLeft, Pause, Play } from "lucide-react";
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
});

const loops = [1, 2, 4, 8, 16];
const stingers: StingerKind[] = ["airhorn", "impact", "riser", "siren", "stab"];

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
  const [master, setMaster] = useState(0.9);
  const [levels, setLevels] = useState<Record<DeckId, number[]>>({ a: [], b: [] });
  const [over, setOver] = useState<DeckId | null>(null);
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
      engine.stopAll();
    };
  }, [engine, pause]);

  const patch = (id: DeckId, partial: Partial<DeckState>) => {
    setDecks((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  };

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
    patch(id, { track: song, playing: false, current: 0, cue: 0, loopOn: false, hotCues: [null, null, null, null], duration: song.duration });
  };

  return (
    <div className="flex min-h-full flex-col gap-2 text-white">
      <header className="flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200">Vibra Studio</h1>
        <button
          type="button"
          onClick={() => setImmersive(!immersive)}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-[#5b21b6] px-3 text-xs font-semibold"
        >
          {immersive ? <PanelLeft size={14} /> : <Maximize2 size={14} />}
          <span className="hidden sm:inline">{immersive ? "Show sidebar" : "Full mixer"}</span>
        </button>
      </header>

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)]">
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
            if (song) void loadTrack("a", song);
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
        />

        <section className="flex flex-col gap-3 rounded-2xl border border-violet-400/20 bg-[#1a1028] p-3">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Mixer</p>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-wider text-white/45">
            <span>Gain</span>
            <span>Master</span>
            <span>Gain</span>
          </div>
          <div className="grid grid-cols-3 items-end gap-2">
            <Fader label="A" value={decks.a.volume} onChange={(value) => {
              engine.setVolume("a", value);
              patch("a", { volume: value });
            }} />
            <Fader label="M" value={master} onChange={(value) => {
              setMaster(value);
              engine.setMaster(value);
            }} />
            <Fader label="B" value={decks.b.volume} onChange={(value) => {
              engine.setVolume("b", value);
              patch("b", { volume: value });
            }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EqStack deck={decks.a} onEq={(band, value) => {
              engine.setEq("a", band, value);
              patch("a", { [band]: value });
            }} />
            <EqStack deck={decks.b} onEq={(band, value) => {
              engine.setEq("b", band, value);
              patch("b", { [band]: value });
            }} />
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
            if (song) void loadTrack("b", song);
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
        />
      </div>

      <Browser onLoad={(song, deck) => void loadTrack(deck, song)} />
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
}) {
  const duration = deck.duration || deck.track?.duration || 0;
  const ratio = duration ? Math.min(1, deck.current / duration) : 0;
  const remain = Math.max(duration - deck.current, 0);
  const bars = (levels.length ? levels : Array.from({ length: 42 }, () => 10)).slice(0, 42);

  return (
    <article
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "rounded-2xl border bg-[#140c22] p-3",
        over ? "border-fuchsia-300" : "border-violet-400/25"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{deck.track?.title ?? `Deck ${id.toUpperCase()}`}</p>
          <p className="truncate text-xs text-white/45">{deck.track?.artistName ?? "Drop a song here"}</p>
        </div>
        <p className="text-lg font-semibold tabular-nums text-violet-200">{deck.rate.toFixed(2)}</p>
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
        <span>Elapsed {formatTime(deck.current)}</span>
        <span>Remain {formatTime(remain)}</span>
        <span>Pitch {deck.rate >= 1 ? "+" : ""}{((deck.rate - 1) * 100).toFixed(0)}</span>
      </div>
      <button
        type="button"
        aria-label={`Waveform deck ${id}`}
        className="mt-2 flex h-12 w-full touch-none items-end gap-px overflow-hidden rounded-md bg-black/50 px-1"
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
            className={cn("min-w-0 flex-1 rounded-sm", index / bars.length <= ratio ? "bg-fuchsia-400" : "bg-violet-900")}
            style={{ height: `${Math.max(18, (bar / 255) * 100)}%` }}
          />
        ))}
      </button>

      <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="grid grid-cols-2 gap-1">
          {stingers.slice(0, 4).map((kind) => (
            <button key={kind} type="button" onClick={() => onStinger(kind)} className="rounded-md bg-[#241433] px-1 py-2 text-[9px] uppercase text-violet-200">
              {kind}
            </button>
          ))}
        </div>
        <div
          className="mx-auto flex h-28 w-28 touch-none items-center justify-center rounded-full border-[10px] border-[#2a1844] bg-[#0c0714] shadow-inner"
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
          <span className={cn("h-3 w-10 rounded-full bg-fuchsia-400", deck.playing && "animate-spin")} />
        </div>
        <div className="flex flex-col gap-1">
          {deck.hotCues.map((cue, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onHotCue(index)}
              className={cn("rounded-md px-2 py-1 text-[10px] font-semibold", cue == null ? "bg-white/10 text-white/50" : "bg-[#5b21b6]")}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <button type="button" onClick={onSetCue} className="rounded-md bg-white/10 px-2 py-1.5 text-[10px]">Set</button>
        <button type="button" onClick={onCue} className="rounded-md bg-violet-700 px-3 py-1.5 text-[10px] font-bold">Cue</button>
        <button type="button" onClick={onToggle} disabled={!deck.track} className="flex h-9 w-9 items-center justify-center rounded-full bg-fuchsia-500 text-white disabled:opacity-40">
          {deck.playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <button type="button" onClick={onSync} className="rounded-md bg-violet-700 px-3 py-1.5 text-[10px] font-bold">Sync</button>
        <button type="button" onClick={onKeyLock} className={cn("rounded-md px-2 py-1.5 text-[10px]", deck.keyLock ? "bg-fuchsia-600" : "bg-white/10")}>Key</button>
        <button type="button" onClick={() => onRate(-1)} className="h-7 w-7 rounded-md bg-white/10">−</button>
        <button type="button" onClick={() => onRate(1)} className="h-7 w-7 rounded-md bg-white/10">+</button>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {loops.map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => onLoop(seconds)}
            className={cn("rounded-md px-2 py-1 text-[10px]", deck.loopOn && deck.loopSeconds === seconds ? "bg-fuchsia-500" : "bg-[#241433] text-white/60")}
          >
            {seconds}
          </button>
        ))}
      </div>
    </article>
  );
}

function Fader({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex flex-col items-center gap-1 text-[10px] text-white/40">
      <input
        aria-label={`${label} fader`}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="dj-eq"
      />
      {label}
    </label>
  );
}

function EqStack({ deck, onEq }: { deck: DeckState; onEq: (band: "low" | "mid" | "high", value: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {(["high", "mid", "low"] as const).map((band) => (
        <label key={band} className="text-center text-[9px] uppercase text-white/35">
          <input
            aria-label={band}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={deck[band]}
            onChange={(event) => onEq(band, Number(event.target.value))}
            className="dj-fader w-full"
          />
          {band}
        </label>
      ))}
    </div>
  );
}

function Browser({ onLoad }: { onLoad: (song: Song, deck: DeckId) => void }) {
  const [tab, setTab] = useState<"vibra" | "online" | "device">("vibra");
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [note, setNote] = useState("");
  const [rights, setRights] = useState(true);
  const [busy, setBusy] = useState(false);

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
    <section className="rounded-2xl border border-violet-400/20 bg-[#100818] p-3">
      <div className="flex flex-wrap items-center gap-2">
        {(["vibra", "online", "device"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn("rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide", tab === item ? "bg-[#5b21b6]" : "bg-white/10 text-white/60")}
          >
            {item === "vibra" ? "Vibra" : item === "online" ? "Online" : "This device"}
          </button>
        ))}
        {tab === "vibra" && (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Vibra"
            className="h-9 min-w-0 flex-1 rounded-full bg-[#0c0714]/80 px-3 text-sm outline-none"
          />
        )}
        {tab === "device" && (
          <label className="inline-flex h-9 cursor-pointer items-center rounded-full bg-[#5b21b6] px-4 text-xs font-semibold">
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
      {note && <p className="mt-2 text-xs text-violet-200">{note}</p>}
      {tab === "online" && <WebBrowser onLoad={onLoad} />}
      {tab !== "online" && (
      <div className="mt-3 max-h-52 space-y-1 overflow-y-auto">
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
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{song.title}</p>
              <p className="truncate text-xs text-white/40">{song.artistName}</p>
            </div>
            <button type="button" onClick={() => onLoad(song, "a")} className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold">A</button>
            <button type="button" onClick={() => onLoad(song, "b")} className="rounded-full bg-fuchsia-600 px-2 py-1 text-[10px] font-semibold">B</button>
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

function WebBrowser({ onLoad }: { onLoad: (song: Song, deck: DeckId) => void }) {
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
    <div className="mt-3 overflow-hidden rounded-xl border border-violet-400/20 bg-[#0c0714]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
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
            className="h-9 w-full rounded-full bg-[#1a1028] px-3 text-sm outline-none"
          />
        </form>
      </div>
      <div className="h-[28rem] overflow-y-auto">
        {page ? (
          <iframe title="Web search" src={page} className="h-full w-full bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        ) : (
          <div className="space-y-1 p-2">
            {searching && <p className="px-2 py-3 text-sm text-white/40">Searching the web…</p>}
            {notice && <p className="px-2 py-3 text-sm text-fuchsia-200">{notice}</p>}
            {!searching && results.length === 0 && <p className="px-2 py-6 text-center text-sm text-white/40">Search a song. Results open in this browser, under the mixer.</p>}
            {results.map((result) => {
              const audio = /\.(mp3|wav|m4a|aac|ogg|flac)(\?|$)/i.test(result.url);
              return (
                <div key={result.url} className="rounded-xl px-2 py-2 hover:bg-white/5">
                  <button type="button" onClick={() => openResult(result.url)} className="block w-full text-left">
                    <p className="truncate text-sm text-violet-200">{result.title}</p>
                    <p className="truncate text-[11px] text-fuchsia-300/80">{result.url}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-white/45">{result.snippet}</p>
                  </button>
                  {audio && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => loadAudio(result.url, result.title, "a")} className="rounded-full bg-white/10 px-2 py-1 text-[10px]">Load A</button>
                      <button type="button" onClick={() => loadAudio(result.url, result.title, "b")} className="rounded-full bg-fuchsia-600 px-2 py-1 text-[10px]">Load B</button>
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
