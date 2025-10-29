export const metadata = {
  title: 'FAQ | Programming Courses',
  description: 'Common questions about accessing courses, refunds, and reviews.',
};

export default function FaqEn() {
  const faqs = [
    {
      q: "How do I access my purchased courses?",
      a: "Visit Profile → Enrollments, then click ‘Go to content’. You'll also receive a confirmation email after checkout.",
    },
    {
      q: "Do you offer refunds?",
      a: "Yes, we offer a 14-day refund window for most courses if less than 20% has been consumed. See the Refund Policy for details.",
    },
    {
      q: "Can I leave a review?",
      a: "Absolutely. After enrollment, navigate to the course page and submit your rating and review.",
    },
  ];

  return (
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">FAQ</h1>
      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">{f.q}</h3>
            <p className="text-gray-700">{f.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
