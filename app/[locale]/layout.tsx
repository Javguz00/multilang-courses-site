import Header from '../components/Header';
import Footer from '../components/Footer';

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
      <Footer locale={locale} />
    </>
  );
}
