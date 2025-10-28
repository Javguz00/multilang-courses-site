import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email } as any;
      }
    })
  ],
  pages: {
    signIn: '/fa/auth/sign-in' // default locale page; links will swap per locale
  },
  callbacks: {
    async session({ session, user }) {
      // Ensure email/name present; using database sessions
      if (session.user) {
        session.user.email = user.email ?? session.user.email ?? undefined;
        session.user.name = user.name ?? session.user.name ?? undefined;
        // expose role/id for server/client checks (augment types or cast when needed)
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
