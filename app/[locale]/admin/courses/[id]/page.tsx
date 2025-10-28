import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/authz';
import CourseForm, { type CourseFormState } from '@/app/components/forms/CourseForm';
import { courseSchema, type FieldErrors } from '@/lib/validation';
import { logAdminAction } from '@/lib/audit';

export default async function EditCoursePage({ params }: { params: { locale: string; id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect(`/${params.locale}/auth/sign-in?callbackUrl=/${params.locale}/admin/courses/${params.id}`);
  }
  const [course, categories] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);
  if (!course) redirect(`/${params.locale}/admin`);

  async function updateCourseAction(_state: CourseFormState, formData: FormData): Promise<CourseFormState> {
    'use server';
    const admin = await requireAdmin();
    if (!admin) return { message: 'Unauthorized' };
    const id = String(formData.get('id') || '');
    if (!id) return { message: 'Invalid request' };
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
    try {
      const updated = await prisma.course.update({
        where: { id },
        data: ({
          title: parsed.data.title.trim(),
          slug: parsed.data.slug.trim(),
          description: parsed.data.description?.trim() || (parsed.data.syllabus ? parsed.data.syllabus.slice(0, 140) : ''),
          syllabus: parsed.data.syllabus || null,
          mediaUrl: parsed.data.mediaUrl || null,
          price: new Prisma.Decimal(parsed.data.price),
          published: !!parsed.data.published,
          categoryId: parsed.data.categoryId,
        } as any),
      });
      await logAdminAction({ userId: admin.id, action: 'UPDATE', entity: 'Course', entityId: id, meta: { title: updated.title, slug: (updated as any).slug } });
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

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit course</h1>
      <CourseForm
        action={updateCourseAction}
        initial={{
          id: course.id,
          title: course.title,
          slug: (course as any).slug,
          price: course.price,
          description: course.description,
          syllabus: (course as any).syllabus || '',
          mediaUrl: (course as any).mediaUrl || '',
          categoryId: course.categoryId,
          published: course.published,
        }}
        categories={categories}
        locale={params.locale as any}
      />
    </div>
  );
}
