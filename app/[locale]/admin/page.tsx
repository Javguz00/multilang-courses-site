import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

async function deleteCourseAction(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/fa/auth/sign-in');
  }
  if (!id) return;
  await prisma.course.delete({ where: { id } });
  revalidatePath('/fa/admin');
  revalidatePath('/en/admin');
}

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin`);
  }
  const courses = await prisma.course.findMany({
    include: { category: true, instructor: true },
    orderBy: { createdAt: 'desc' }
  });
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <div className="space-x-3">
          <Link className="underline" href={`/${params.locale}/admin/categories`}>Manage categories</Link>
          <Link className="px-3 py-2 bg-blue-600 text-white rounded" href={`/${params.locale}/admin/courses/new`}>New course</Link>
        </div>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Title</th>
            <th className="py-2">Category</th>
            <th className="py-2">Price</th>
            <th className="py-2">Published</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.title}</td>
              <td className="py-2">{c.category?.name}</td>
              <td className="py-2">${'{'}c.price.toString(){'}'}</td>
              <td className="py-2">{c.published ? 'Yes' : 'No'}</td>
              <td className="py-2 space-x-2">
                <Link className="underline" href={`/${params.locale}/admin/courses/${c.id}`}>Edit</Link>
                <form action={deleteCourseAction} className="inline">
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-red-600 underline" type="submit">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
