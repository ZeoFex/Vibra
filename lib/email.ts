import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { randomBytes } from "crypto";

export function generateVerifyToken(): string {
  return randomBytes(32).toString("hex");
}

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (url.startsWith("http")) return url.replace(/\/$/, "");
  return `http://${url.replace(/\/$/, "")}`;
}

function envBool(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

function smtpCredentials() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "").trim();
  return { user, pass };
}

function buildTransportOptions(): SMTPTransport.Options | null {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const { user, pass } = smtpCredentials();

  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = envBool(process.env.SMTP_SECURE) || port === 465;

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: !secure,
    tls: {
      minVersion: "TLSv1.2",
      servername: host,
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
    pool: false,
  } as SMTPTransport.Options;
}

function createTransport() {
  const options = buildTransportOptions();
  if (!options) return null;
  return nodemailer.createTransport(options);
}

async function sendWithTransport(
  transport: nodemailer.Transporter,
  mail: { from: string; to: string; subject: string; html: string }
) {
  return transport.sendMail(mail);
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<{ sent: boolean; error?: string }> {
  const from = process.env.SMTP_FROM?.trim() ?? process.env.SMTP_USER?.trim();
  const transport = createTransport();

  if (!transport || !from) {
    console.warn("[email] SMTP not configured — verification URL:", verifyUrl);
    return { sent: false, error: "Email service not configured" };
  }

  const mail = {
    from,
    to,
    subject: "Verify your Vibra artist account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Welcome to Vibra, ${name}!</h2>
        <p>Click the button below to verify your artist account and start uploading music.</p>
        <p style="margin:24px 0">
          <a href="${verifyUrl}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Verify Email
          </a>
        </p>
        <p style="color:#666;font-size:14px">Or copy this link: ${verifyUrl}</p>
        <p style="color:#666;font-size:14px">This link expires in 24 hours.</p>
      </div>
    `,
  };

  const attempts = [
    () => sendWithTransport(transport, mail),
    async () => {
      // Fallback: Gmail SSL on 465 (more reliable than STARTTLS on some networks)
      const { user, pass } = smtpCredentials();
      if (!user || !pass) throw new Error("SMTP credentials missing");
      const fallback = nodemailer.createTransport({
        host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
        tls: { minVersion: "TLSv1.2" },
        pool: false,
      } as SMTPTransport.Options);
      return sendWithTransport(fallback, mail);
    },
  ];

  let lastError: Error | null = null;

  for (const attempt of attempts) {
    try {
      await attempt();
      return { sent: true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown error");
      console.warn("[email] attempt failed:", lastError.message);
    }
  }

  console.error("[email] send failed:", lastError);
  return {
    sent: false,
    error:
      process.env.NODE_ENV === "development" && lastError
        ? `Failed to send email: ${lastError.message}`
        : "Failed to send verification email",
  };
}
