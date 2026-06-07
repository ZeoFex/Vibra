"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-white/20">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20", accent)}>
          <Icon size={20} className="text-violet-400" />
        </div>
        {change && (
          <span className={cn("text-xs font-medium", change.startsWith("+") ? "text-green-400" : "text-red-400")}>
            {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-white/50">{label}</p>
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  under_review: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  needs_more_info: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  verified: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  open: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  investigating: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  dismissed: "bg-white/10 text-white/50 border-white/20",
  changes_requested: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  assigned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  closed: "bg-white/10 text-white/50 border-white/20",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-white/10 text-white/50 border-white/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors = statusColors[status] ?? "bg-white/10 text-white/60 border-white/20";
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", colors, className)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function SimpleBarChart({
  data,
  labelKey,
  valueKey,
  formatValue,
}: {
  data: Record<string, string | number>[];
  labelKey: string;
  valueKey: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])));
  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((d) => {
        const val = Number(d[valueKey]);
        return (
          <div key={String(d[labelKey])} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[10px] text-white/40">
              {formatValue ? formatValue(val) : val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400"
              style={{ height: `${(val / max) * 100}%`, minHeight: 4 }}
            />
            <span className="text-xs text-white/50">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <button onClick={onCancel} className="absolute right-4 top-4 text-white/40 hover:text-white">
          <X size={18} />
        </button>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-white/60">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            className="flex-1"
            onClick={() => { onConfirm(); onCancel(); }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminSearchInput({ placeholder, value, onChange }: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="search"
      placeholder={placeholder ?? "Search..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
    />
  );
}

export function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(({ id, label, count }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            active === id ? "bg-violet-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
          )}
        >
          {label}
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-xs">{count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function useConfirmModal() {
  const [state, setState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; destructive?: boolean; confirmLabel?: string }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const confirm = (opts: Omit<typeof state, "open">) => setState({ ...opts, open: true });
  const close = () => setState((s) => ({ ...s, open: false }));

  const modal = (
    <ConfirmModal
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      destructive={state.destructive}
      onConfirm={state.onConfirm}
      onCancel={close}
    />
  );

  return { confirm, modal };
}
