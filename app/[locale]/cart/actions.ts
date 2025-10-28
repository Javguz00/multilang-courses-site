"use server";
import { addToCart, updateQty, removeItem, clearCart } from '@/lib/cart';
import { revalidatePath } from 'next/cache';

export async function addAction(_state: any, fd: FormData) {
  const id = String(fd.get('id') || '');
  const qty = Number(fd.get('qty') || 1);
  if (!id) return;
  addToCart(id, Number.isFinite(qty) ? qty : 1);
  revalidatePath('/fa/cart');
  revalidatePath('/en/cart');
}

export async function updateAction(_state: any, fd: FormData) {
  const id = String(fd.get('id') || '');
  const qty = Number(fd.get('qty') || 1);
  if (!id) return;
  updateQty(id, Number.isFinite(qty) ? qty : 1);
  revalidatePath('/fa/cart');
  revalidatePath('/en/cart');
}

export async function removeAction(_state: any, fd: FormData) {
  const id = String(fd.get('id') || '');
  if (!id) return;
  removeItem(id);
  revalidatePath('/fa/cart');
  revalidatePath('/en/cart');
}

export async function clearAction() {
  clearCart();
  revalidatePath('/fa/cart');
  revalidatePath('/en/cart');
}

// Single-parameter wrappers for direct form action usage
export async function updateActionForm(fd: FormData) {
  return updateAction(null as any, fd);
}
export async function removeActionForm(fd: FormData) {
  return removeAction(null as any, fd);
}
export async function addActionForm(fd: FormData) {
  return addAction(null as any, fd);
}
