"use client";

import { useState } from "react";

export default function ContactFa() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", "fa");
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا");
      setStatus("success");
      setMsg(data?.message || "ممنون! پیام شما ارسال شد.");
      form.reset();
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message || "مشکلی پیش آمد.");
    }
  }

  return (
    <main className="container py-10 max-w-2xl" dir="rtl">
      <h2 className="text-3xl font-semibold mb-6">تماس با ما</h2>
      <p className="text-gray-600 mb-8">
        سوالی درباره دوره‌ها یا حساب کاربری دارید؟ پیام بگذارید تا با شما تماس
        بگیریم.
      </p>

      {status !== "idle" && (
        <div
          role="status"
          className={
            "mb-4 rounded-md border p-4 " +
            (status === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-gray-200 bg-gray-50 text-gray-700")
          }
        >
          {msg}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Honeypot field */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            نام
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-required="true"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            ایمیل
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-required="true"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            پیام
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            aria-required="true"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {status === "sending" ? "در حال ارسال…" : "ارسال پیام"}
        </button>
      </form>
    </main>
  );
}
