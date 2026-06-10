import { cn } from "@/lib/utils";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  placeholder = "Select...",
  className,
}: SelectFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm text-white/70">
        {label} {required && "*"}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        {!value && (
          <option value="" disabled className="bg-zinc-900">
            {placeholder}
          </option>
        )}
        {value && !options.includes(value) && (
          <option value={value} className="bg-zinc-900">
            {value}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option} className="bg-zinc-900">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
