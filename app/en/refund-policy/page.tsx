export const metadata = {
  title: 'Refund Policy | Programming Courses',
  description: 'Refund eligibility and how to request a refund for your purchase.',
};

export default function RefundPolicyEn() {
  return (
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-semibold mb-6">Refund Policy</h1>
      <p className="text-gray-700 mb-4">
        We want you to be satisfied with your learning experience. Most courses
        are eligible for a refund within 14 days of purchase if less than 20%
        of the content has been consumed.
      </p>
      <p className="text-gray-700 mb-4">
        To request a refund, please contact support with your order ID and
        reason for the request. Approved refunds are returned to the original
        payment method.
      </p>
      <p className="text-gray-700">
        Some promotional or bundle purchases may be excluded. See the course
        page for any special terms.
      </p>
    </main>
  );
}
