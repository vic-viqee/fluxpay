import AuditLog from '../models/AuditLog';
import { Request } from 'express';
import logger from '../utils/logger';

export type AuditAction = 
  | 'VIEW_OVERVIEW'
  | 'VIEW_BUSINESSES'
  | 'VIEW_BUSINESS_DETAIL'
  | 'VIEW_TRANSACTIONS'
  | 'VIEW_SUBSCRIPTIONS'
  | 'VIEW_API_KEYS'
  | 'VIEW_WEBHOOKS'
  | 'VIEW_PLAN_LIMITS'
  | 'EXPORT_DATA'
  | 'SEARCH_RECORDS';

export type AuditResource = 
  | 'admin'
  | 'business'
  | 'transaction'
  | 'subscription'
  | 'api_key'
  | 'webhook'
  | 'plan_limits';

export const logAdminAction = async (
  adminId: string,
  action: AuditAction,
  resource: AuditResource,
  req?: Request,
  details?: Record<string, any>
) => {
  try {
    const auditEntry = new AuditLog({
      adminId,
      action,
      resource,
      resourceId: details?.resourceId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers['user-agent'],
    });
    
    await auditEntry.save();
  } catch (error) {
    logger.error('Failed to log admin action:', error);
  }
};
