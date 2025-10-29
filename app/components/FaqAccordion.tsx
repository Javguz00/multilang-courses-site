"use client";

import { useId, useState } from "react";

export function FaqItem({ q, a, rtl = false }: { q: string; a: string; rtl?: boolean }) {
  const [open, setOpen] = useState(false);
  const btnId = useId();
  const panelId = `${btnId}-panel`;
  return (
    <div className="rounded-lg border">
      <h3>
        <button
          id={btnId}
          className="w-full text-left px-4 py-3 font-medium flex items-center justify-between"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{q}</span>
          <span aria-hidden="true" className="ml-3 text-gray-500">
            {open ? (rtl ? "−" : "−") : rtl ? "+" : "+"}
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        hidden={!open}
        className="px-4 pb-4 text-gray-700"
      >
        {a}
      </div>
    </div>
  );
}

export default function FaqAccordion({ faqs, rtl = false }: { faqs: { q: string; a: string }[]; rtl?: boolean }) {
  return (
    <div className="space-y-3" {...(rtl ? { dir: "rtl" } : {})}>
      {faqs.map((f, i) => (
        <FaqItem key={i} q={f.q} a={f.a} rtl={rtl} />
      ))}
    </div>
  );
}
