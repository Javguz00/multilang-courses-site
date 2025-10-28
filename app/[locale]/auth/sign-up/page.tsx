"use client";
import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage({ params }: { params: { locale: "fa" | "en" } }) {
  const locale = params.locale;
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Registration failed");
      return;
    }
    const signInRes = await signIn("credentials", { redirect: false, email, password, callbackUrl: `/${locale}/profile` });
    if (signInRes?.url) router.push(signInRes.url);
  }

  return (
    <main className="container py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{locale === 'fa' ? 'ثبت‌نام' : 'Sign Up'}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border p-2" placeholder={locale === 'fa' ? 'نام' : 'Name'} value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border p-2" type="password" placeholder={locale === 'fa' ? 'رمز عبور (حداقل 6)' : 'Password (min 6)'} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white py-2" type="submit">{locale === 'fa' ? 'ثبت‌نام' : 'Sign Up'}</button>
      </form>
    </main>
  );
}
