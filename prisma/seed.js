/* eslint-disable no-console */
const { PrismaClient, Prisma } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Categories
  const web = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: { name: 'Web Development', slug: 'web-development' }
  });
  const data = await prisma.category.upsert({
    where: { slug: 'data-science' },
    update: {},
    create: { name: 'Data Science', slug: 'data-science' }
  });

  // Users (instructors and students)
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice Instructor', email: 'alice@example.com' }
  });
  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob Student', email: 'bob@example.com' }
  });

  // Test login user (with credentials)
  const testPasswordHash = await bcrypt.hash('Password123!', 10);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { name: 'Test User', email: 'test@example.com', passwordHash: testPasswordHash }
  });

  // Admin user (role: ADMIN)
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: adminPasswordHash },
    create: { name: 'Admin', email: 'admin@example.com', passwordHash: adminPasswordHash, role: 'ADMIN' }
  });

  // Courses
  const js101 = await prisma.course.upsert({
    where: { id: 'seed-js-101' },
    update: {},
    create: {
      id: 'seed-js-101',
      title: 'JavaScript 101',
      description: 'Beginner-friendly course to learn modern JavaScript.',
      price: new Prisma.Decimal('49.00'),
      published: true,
      categoryId: web.id,
      instructorId: alice.id
    }
  });

  const pyData = await prisma.course.upsert({
    where: { id: 'seed-py-data' },
    update: {},
    create: {
      id: 'seed-py-data',
      title: 'Python for Data Science',
      description: 'Hands-on introduction to data science with Python.',
      price: new Prisma.Decimal('79.00'),
      published: true,
      categoryId: data.id,
      instructorId: alice.id
    }
  });

  // Coupon
  const coupon = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: { code: 'WELCOME10', percentage: 10 }
  });

  // Order (Bob buys JS 101)
  const order = await prisma.order.create({
    data: {
      userId: bob.id,
      total: new Prisma.Decimal('44.10'),
      status: 'PAID',
      couponId: coupon.id,
      items: {
        create: [
          { courseId: js101.id, price: js101.price, quantity: 1 }
        ]
      }
    },
    include: { items: true }
  });

  // Enrollment
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: bob.id, courseId: js101.id } },
    update: {},
    create: { userId: bob.id, courseId: js101.id }
  });

  // Review
  await prisma.review.create({
    data: {
      userId: bob.id,
      courseId: js101.id,
      rating: 5,
      comment: 'Great intro course!'
    }
  });

  const courseCount = await prisma.course.count();
  const userCount = await prisma.user.count();
  console.log('Seed completed:', { users: userCount, courses: courseCount, orderId: order.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
