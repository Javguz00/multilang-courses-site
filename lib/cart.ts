import { cookies } from 'next/headers';

export type CartItem = { id: string; qty: number };
const CART_COOKIE = 'cart';

export function readCart(): CartItem[] {
  try {
    const raw = cookies().get(CART_COOKIE)?.value || '[]';
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x) => x && typeof x.id === 'string' && Number.isFinite(Number(x.qty)) && Number(x.qty) > 0).map((x) => ({ id: x.id, qty: Math.max(1, Math.min(99, Number(x.qty))) }));
    }
    return [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  const value = JSON.stringify(items);
  cookies().set(CART_COOKIE, value, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function addToCart(id: string, qty = 1) {
  const items = readCart();
  const i = items.findIndex((it) => it.id === id);
  if (i >= 0) items[i].qty = Math.min(99, items[i].qty + qty);
  else items.push({ id, qty: Math.max(1, Math.min(99, qty)) });
  writeCart(items);
}

export function updateQty(id: string, qty: number) {
  let items = readCart();
  items = items.map((it) => (it.id === id ? { ...it, qty: Math.max(1, Math.min(99, qty)) } : it));
  writeCart(items);
}

export function removeItem(id: string) {
  writeCart(readCart().filter((it) => it.id !== id));
}

export function clearCart() {
  writeCart([]);
}
