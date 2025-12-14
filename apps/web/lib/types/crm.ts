/**
 * CRM Types
 * 
 * Type definitions for the CRM Lite feature.
 */

// LeadStatus enum matches Prisma schema
export type LeadStatus = 
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST";

// Full list for iteration
export const LEAD_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "NEGOTIATING",
  "CLOSED_WON",
  "CLOSED_LOST",
];
