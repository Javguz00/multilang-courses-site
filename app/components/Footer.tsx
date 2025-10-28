export default function Footer({ locale }: { locale: 'fa' | 'en' }) {
  const isFa = locale === 'fa';
  return (
    <footer className="border-t mt-8">
      <div className="container py-6 text-sm text-gray-600 flex items-center justify-between">
        <span>{isFa ? '© تمامی حقوق محفوظ است' : '© All rights reserved'}</span>
        <a className="underline" href={isFa ? '/fa/contact' : '/en/contact'}>
          {isFa ? 'تماس' : 'Contact'}
        </a>
      </div>
    </footer>
  );
}
