"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { passwordRequirements } from "@/lib/auth/password-requirements";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  showRequirements?: boolean;
  id?: string;
}

export function PasswordField({
  value,
  onChange,
  label = "Password",
  required = true,
  showRequirements = true,
  id = "password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-white/70">
        {label} {required && "*"}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete="new-password"
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showRequirements && (
        <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-2 text-xs text-white/50">Password must contain:</p>
          <ul className="space-y-1">
            {passwordRequirements.map((req) => {
              const met = value.length > 0 && req.test(value);
              return (
                <li
                  key={req.id}
                  className={cn(
                    "text-xs",
                    value.length === 0 ? "text-white/40" : met ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {met ? "✓" : "○"} {req.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
