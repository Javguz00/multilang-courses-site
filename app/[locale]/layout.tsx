import Header from '../components/Header';

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: 'fa' | 'en' };
}) {
  const locale = params.locale || 'fa';
  return (
    <>
      <Header locale={locale} />
      {children}
    </>
  );
}
