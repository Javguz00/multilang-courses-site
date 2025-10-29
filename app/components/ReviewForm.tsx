"use client";
import { useState } from 'react';

export function ReviewForm({ courseId, locale }: { courseId: string; locale: 'fa' | 'en' }) {
  const isFa = locale === 'fa';
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && data?.error) {
          setMessage(data.error);
          return;
        }
        throw new Error('Failed');
      }
      setMessage(isFa ? 'با موفقیت ثبت شد.' : 'Saved.');
    } catch {
      setMessage(isFa ? 'خطا در ثبت نظر.' : 'Failed to save review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="border rounded p-4 space-y-3">
      <div className="font-medium">{isFa ? 'ثبت نظر' : 'Leave a review'}</div>
      <label className="block text-sm">
        {isFa ? 'امتیاز' : 'Rating'}
        <select className="block mt-1 border rounded p-1" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5,4,3,2,1].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        {isFa ? 'نظر' : 'Comment'}
        <textarea className="block mt-1 w-full border rounded p-2" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
      </label>
      <button className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" disabled={submitting}>
        {submitting ? (isFa ? 'در حال ثبت…' : 'Saving…') : (isFa ? 'ثبت' : 'Submit')}
      </button>
      {message && <div className="text-sm text-gray-700">{message}</div>}
    </form>
  );
}
