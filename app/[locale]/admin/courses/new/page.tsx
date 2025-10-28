import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin, getSessionUser } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { courseSchema, type FieldErrors } from '@/lib/validation';
import CourseForm, { type CourseFormState } from '@/app/components/forms/CourseForm';
import { logAdminAction } from '@/lib/audit';

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
  async function createCourseAction(_state: CourseFormState, formData: FormData): Promise<CourseFormState> {
    'use server';
    const admin = await requireAdmin();
    if (!admin) return { message: 'Unauthorized' };
    const raw = {
      title: String(formData.get('title') || ''),
      slug: String(formData.get('slug') || ''),
      price: String(formData.get('price') || ''),
      description: String(formData.get('description') || ''),
      syllabus: String(formData.get('syllabus') || ''),
      mediaUrl: String(formData.get('mediaUrl') || ''),
      categoryId: String(formData.get('categoryId') || ''),
      published: !!formData.get('published'),
    };
    const parsed = courseSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: FieldErrors<any> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        errors[key as any] = issue.message;
      }
      return { errors };
    }
    const instructor = await getSessionUser();
    try {
      const created = await prisma.course.create({
        data: ({
          title: parsed.data.title.trim(),
          slug: parsed.data.slug.trim(),
          description: parsed.data.description?.trim() || (parsed.data.syllabus ? parsed.data.syllabus.slice(0, 140) : ''),
          syllabus: parsed.data.syllabus || null,
          mediaUrl: parsed.data.mediaUrl || null,
          price: new Prisma.Decimal(parsed.data.price),
          published: !!parsed.data.published,
          categoryId: parsed.data.categoryId,
          instructorId: instructor!.id
        } as any)
      });
      await logAdminAction({ userId: admin.id, action: 'CREATE', entity: 'Course', entityId: created.id, meta: { title: created.title, slug: (created as any).slug } });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return { message: 'Duplicate value', errors: { slug: 'Slug already exists' } };
      }
      return { message: 'Server error' };
    }
    revalidatePath('/fa/admin');
    revalidatePath('/en/admin');
    redirect(`/${params.locale}/admin`);
  }
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin/courses/new`);
  }
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">New course</h1>
      <CourseForm action={createCourseAction} categories={categories} locale={params.locale as any} />
    </div>
  );
}
