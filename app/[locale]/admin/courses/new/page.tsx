import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin, getSessionUser } from '@/lib/authz';
import { revalidatePath } from 'next/cache';

async function createCourse(formData: FormData) {
  'use server';
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/fa/auth/sign-in');
  }
  const title = String(formData.get('title') || '').trim();
  const price = String(formData.get('price') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const syllabus = String(formData.get('syllabus') || '').trim();
  const mediaUrl = String(formData.get('mediaUrl') || '').trim();
  const categoryId = String(formData.get('categoryId') || '').trim();
  const published = formData.get('published') ? true : false;

  if (!title || !price || !categoryId) return;

  const instructor = await getSessionUser();
  await prisma.course.create({
    data: ({
      title,
      description: description || (syllabus ? syllabus.slice(0, 140) : ''),
      syllabus: syllabus || null,
      mediaUrl: mediaUrl || null,
      price: new Prisma.Decimal(price),
      published,
      categoryId,
      instructorId: instructor!.id
    } as any)
  });
  revalidatePath('/fa/admin');
  revalidatePath('/en/admin');
}

export default async function NewCoursePage({ params }: { params: { locale: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin/courses/new`);
  }
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">New course</h1>
      <form action={createCourse} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input name="title" className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1">Price (e.g., 49.00)</label>
          <input name="price" className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1">Short description</label>
          <textarea name="description" className="border p-2 w-full" rows={2} />
        </div>
        <div>
          <label className="block mb-1">Syllabus</label>
          <textarea name="syllabus" className="border p-2 w-full" rows={6} />
        </div>
        <div>
          <label className="block mb-1">Media URL</label>
          <input name="mediaUrl" className="border p-2 w-full" />
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <select name="categoryId" className="border p-2 w-full" required>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="published" /> <span>Published</span>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          <a className="px-4 py-2 border rounded" href={`/${params.locale}/admin`}>Cancel</a>
        </div>
      </form>
    </div>
  );
}
