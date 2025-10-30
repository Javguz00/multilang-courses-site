import Script from 'next/script';

export default function Analytics() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS?.toLowerCase();
  if (provider === 'ga' && process.env.NEXT_PUBLIC_GA_ID) {
    const id = process.env.NEXT_PUBLIC_GA_ID;
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', '${id}');
          `}
        </Script>
      </>
    );
  }
  if (provider === 'matomo' && process.env.NEXT_PUBLIC_MATOMO_URL && process.env.NEXT_PUBLIC_MATOMO_SITE_ID) {
    const url = process.env.NEXT_PUBLIC_MATOMO_URL.replace(/\/$/, '');
    const siteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
    return (
      <Script id="matomo" strategy="afterInteractive">
        {`
          var _paq = window._paq = window._paq || [];
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u='${url}/';
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '${siteId}']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `}
      </Script>
    );
  }
  return null;
}
