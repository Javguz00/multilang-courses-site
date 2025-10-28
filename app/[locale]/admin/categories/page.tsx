import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function createCategory(formData: FormData) {
  'use server';
  const admin = await requireAdmin();
  if (!admin) return;
  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  if (!name || !slug) return;
  await prisma.category.create({ data: { name, slug } });
  revalidatePath('/fa/admin/categories');
  revalidatePath('/en/admin/categories');
}

async function updateCategory(formData: FormData) {
  'use server';
  const admin = await requireAdmin();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  if (!id || !name || !slug) return;
  await prisma.category.update({ where: { id }, data: { name, slug } });
  revalidatePath('/fa/admin/categories');
  revalidatePath('/en/admin/categories');
}

async function deleteCategory(formData: FormData) {
  'use server';
  const admin = await requireAdmin();
  if (!admin) return;
  const id = String(formData.get('id') || '');
  if (!id) return;
  await prisma.category.delete({ where: { id } });
  revalidatePath('/fa/admin/categories');
  revalidatePath('/en/admin/categories');
}

export default async function CategoriesPage({ params }: { params: { locale: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin/categories`);
  }
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <a className="underline" href={`/${params.locale}/admin`}>Back to dashboard</a>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">Create new</h2>
          <form action={createCategory} className="space-y-3">
            <input name="name" placeholder="Name" className="border p-2 w-full" required />
            <input name="slug" placeholder="Slug" className="border p-2 w-full" required />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          </form>
        </div>
        <div>
          <h2 className="font-medium mb-2">Existing</h2>
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.id} className="border p-3 rounded">
                <form action={updateCategory} className="space-y-2">
                  <input type="hidden" name="id" value={cat.id} />
                  <input name="name" defaultValue={cat.name} className="border p-2 w-full" />
                  <input name="slug" defaultValue={cat.slug} className="border p-2 w-full" />
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button type="submit" className="px-3 py-1 text-red-600 underline">Delete</button>
                    </form>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
