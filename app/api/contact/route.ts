import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

function getIP(req: NextRequest): string {
  // Prefer NextRequest.ip when populated (Vercel/Node), fall back to X-Forwarded-For, else remote address-like
  const xf = req.headers.get("x-forwarded-for");
  const ip = (req as any).ip || (xf ? xf.split(",")[0]?.trim() : "127.0.0.1");
  return ip || "unknown";
}

function t(locale: string, key: string): string {
  const map: Record<string, Record<string, string>> = {
    en: {
      ok: "Thanks! Your message was sent.",
      invalid: "Please provide your name, a valid email, and a message.",
      rate: "Too many messages. Please try again later.",
      spam: "Spam check failed.",
      method: "Method not allowed.",
    },
    fa: {
      ok: "ممنون! پیام شما ارسال شد.",
      invalid: "لطفاً نام، ایمیل معتبر و پیام خود را وارد کنید.",
      rate: "درخواست‌های بیش از حد. بعداً دوباره تلاش کنید.",
      spam: "بررسی ضد اسپم ناموفق بود.",
      method: "روش مجاز نیست.",
    },
  };
  return (map[locale]?.[key] ?? map.en[key]) || key;
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const isJSON = contentType.includes("application/json");
  const body = isJSON ? await req.json() : Object.fromEntries((await req.formData()).entries());

  const locale = (body.locale as string) === "fa" ? "fa" : "en";
  // Honeypot: hidden field must be empty
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return new Response(JSON.stringify({ ok: false, message: t(locale, "spam") }), { status: 400 });
  }

  const name = (body.name as string)?.toString().trim();
  const email = (body.email as string)?.toString().trim();
  const message = (body.message as string)?.toString().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !email || !emailRegex.test(email) || !message || message.length < 8) {
    return new Response(JSON.stringify({ ok: false, message: t(locale, "invalid") }), { status: 400 });
  }

  // Rate-limit: 5 requests per 60s per IP
  const ip = getIP(req);
  const key = `contact:${ip}`;
  if (!rateLimit(key, 5, 60_000)) {
    return new Response(JSON.stringify({ ok: false, message: t(locale, "rate") }), { status: 429 });
  }

  // For MVP, we do not send email. In production, integrate an email/SaaS and audit-log.
  // Simulate async processing
  await new Promise((r) => setTimeout(r, 150));

  return new Response(JSON.stringify({ ok: true, message: t(locale, "ok") }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

export async function GET() {
  return new Response("", { status: 405 });
}
