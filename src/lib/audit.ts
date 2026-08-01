import { AuditActionType, AuditLogEntry, Participant, Trip } from '@/types/trip';

export function createAuditEntry(
  actionType: AuditActionType,
  details: string,
  actor?: Participant,
): AuditLogEntry {
  const timestamp = new Date().toISOString();
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp,
    performedBy: actor
      ? { id: actor.id, name: actor.name, avatar: actor.avatar, photoId: actor.photoId }
      : { id: 'local-user', name: 'Local user', avatar: '👤' },
    actionType,
    details,
  };
}

export function appendAuditLog(
  trip: Trip,
  actionType: AuditActionType,
  details: string,
  actor?: Participant,
): Trip {
  return {
    ...trip,
    updatedAt: new Date().toISOString(),
    auditLogs: [...(trip.auditLogs || []), createAuditEntry(actionType, details, actor)],
  };
}
