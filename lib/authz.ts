import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || null;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return null;
  // Cast to any to avoid type mismatch before Prisma client is regenerated
  if ((user as any).role !== 'ADMIN') return null;
  return user;
}
