"use client";

import { useState } from "react";

export default function ContactEn() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("locale", "en");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error");
      setStatus("success");
      setMessage(data?.message || "Thanks! Your message was sent.");
      form.reset();
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong.");
    }
  }

  return (
    <main className="container py-10 max-w-2xl">
      <h2 className="text-3xl font-semibold mb-6">Contact Us</h2>
      <p className="text-gray-600 mb-8">
        Have a question about our courses or your account? Send us a message and
        we’ll get back to you.
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
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Honeypot field for spam bots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
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
            Email
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
            Message
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
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
      </form>
    </main>
  );
}
