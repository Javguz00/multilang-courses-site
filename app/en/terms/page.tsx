export const metadata = {
  title: 'Terms of Service | Programming Courses',
  description: 'The terms governing your use of the site and purchased content.',
};

export default function TermsEn() {
  return (
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>
      <p className="text-gray-700 mb-4">
        By accessing or using this site, you agree to our terms. You receive a
        personal, non-transferable license to access purchased course content.
        You agree not to share, resell, or publicly distribute the content.
      </p>
      <p className="text-gray-700 mb-4">
        We may update these terms from time to time. Continued use of the site
        constitutes acceptance of the updated terms.
      </p>
      <p className="text-gray-700">
        For questions, please reach out via the Contact page.
      </p>
    </main>
  );
}
