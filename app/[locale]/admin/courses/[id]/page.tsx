import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';

async function updateCourse(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim();
  const price = String(formData.get('price') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const syllabus = String(formData.get('syllabus') || '').trim();
  const mediaUrl = String(formData.get('mediaUrl') || '').trim();
  const categoryId = String(formData.get('categoryId') || '').trim();
  const published = formData.get('published') ? true : false;

  const admin = await requireAdmin();
  if (!admin) return;
  if (!id) return;

  await prisma.course.update({
    where: { id },
    data: ({
      title,
      description: description || (syllabus ? syllabus.slice(0, 140) : ''),
      syllabus: syllabus || null,
      mediaUrl: mediaUrl || null,
      price: new Prisma.Decimal(price),
      published,
      categoryId
    } as any)
  });
  revalidatePath('/fa/admin');
  revalidatePath('/en/admin');
}

export default async function EditCoursePage({ params }: { params: { locale: string; id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin/courses/${params.id}`);
  }
  const [course, categories] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ]);
  if (!course) redirect(`/${params.locale}/admin`);
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit course</h1>
      <form action={updateCourse} className="space-y-4">
        <input type="hidden" name="id" value={course.id} />
        <div>
          <label className="block mb-1">Title</label>
          <input name="title" defaultValue={course.title} className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1">Price (e.g., 49.00)</label>
          <input name="price" defaultValue={course.price.toString()} className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1">Short description</label>
          <textarea name="description" defaultValue={course.description || ''} className="border p-2 w-full" rows={2} />
        </div>
        <div>
          <label className="block mb-1">Syllabus</label>
          <textarea name="syllabus" defaultValue={(course as any).syllabus || ''} className="border p-2 w-full" rows={6} />
        </div>
        <div>
          <label className="block mb-1">Media URL</label>
          <input name="mediaUrl" defaultValue={(course as any).mediaUrl || ''} className="border p-2 w-full" />
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <select name="categoryId" defaultValue={course.categoryId} className="border p-2 w-full" required>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={course.published} /> <span>Published</span>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          <a className="px-4 py-2 border rounded" href={`/${params.locale}/admin`}>Cancel</a>
        </div>
      </form>
    </div>
  );
}
