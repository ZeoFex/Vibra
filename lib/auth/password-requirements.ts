export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a–z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A–Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "One symbol (!@#$%^&* etc.)",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function getPasswordValidationError(password: string): string | null {
  const failed = passwordRequirements.find((req) => !req.test(password));
  return failed ? `Password must include: ${failed.label.toLowerCase()}` : null;
}

export function isPasswordValid(password: string): boolean {
  return passwordRequirements.every((req) => req.test(password));
}
