import dbConnect from "@/lib/db";
import ActivityLog from "@/models/activity-log.model";

export async function logAction(
  action: string,
  resource: string,
  performedBy: string,
  details?: string,
  resourceId?: string,
  ip?: string
) {
  await dbConnect();
  await ActivityLog.create({
    action,
    resource,
    resourceId,
    performedBy,
    details,
    ip,
  });
}
