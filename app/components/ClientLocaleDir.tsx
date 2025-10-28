'use client';
import { useEffect } from 'react';

export default function ClientLocaleDir({ locale }: { locale: 'fa' | 'en' }) {
  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }, [locale]);
  return null;
}
