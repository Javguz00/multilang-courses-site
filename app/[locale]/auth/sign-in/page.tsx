"use client";
import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage({ params }: { params: { locale: "fa" | "en" } }) {
  const locale = params.locale;
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const callbackUrl = sp.get("callbackUrl") || `/${locale}/profile`;
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl
    });
    if (res?.error) {
      setError("Invalid credentials");
    } else if (res?.url) {
      router.push(res.url);
    }
  }

  return (
    <main className="container py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{locale === 'fa' ? 'ورود' : 'Sign In'}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border p-2" type="password" placeholder={locale === 'fa' ? 'رمز عبور' : 'Password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white py-2" type="submit">{locale === 'fa' ? 'ورود' : 'Sign In'}</button>
      </form>
    </main>
  );
}
