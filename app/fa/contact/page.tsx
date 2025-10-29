"use client";

import { useState } from "react";

export default function ContactFa() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 600));
    setStatus("sent");
  }

  return (
    <main className="container py-10 max-w-2xl" dir="rtl">
      <h2 className="text-3xl font-semibold mb-6">تماس با ما</h2>
      <p className="text-gray-600 mb-8">
        سوالی درباره دورهها یا حساب کاربری دارید؟ پیام بگذارید تا با شما تماس
        بگیریم.
      </p>

      {status === "sent" ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
          ممنون! پیام شما ثبت شد. این فرم نمونه است و ایمیلی ارسال نمیشود.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              نام
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
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
      )}
    </main>
  );
}
