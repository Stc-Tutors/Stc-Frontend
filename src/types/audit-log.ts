// AuditLogRepository.findMany() populates this to {id, firstName, lastName,
// email, role} for display; entries recorded before that lookup succeeds
// (or for deleted users) stay a plain user-id string - handle both shapes.
export type AuditLogActor = string | { id: string; firstName: string; lastName: string; email: string; role: string };

export interface AuditLog {
  id: string;
  actor: AuditLogActor;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  actor?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
