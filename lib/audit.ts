import { prisma } from './prisma';

export type AuditPayload = {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'Course' | 'Category';
  entityId: string;
  meta?: Record<string, unknown>;
};

export async function logAdminAction(payload: AuditPayload) {
  try {
    await (prisma as any).auditLog.create({
      data: {
        userId: payload.userId,
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId,
        meta: payload.meta ?? null,
      },
    });
  } catch (e) {
    // Swallow logging errors to avoid breaking main flow
    console.error('[audit-log]', e);
  }
}
