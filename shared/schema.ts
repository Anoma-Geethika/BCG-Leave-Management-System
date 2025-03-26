import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Teacher schema
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  teacherId: text("teacher_id").notNull().unique(),
  name: text("name").notNull(),
  department: text("department").notNull(),
});

export const insertTeacherSchema = createInsertSchema(teachers).pick({
  teacherId: true,
  name: true,
  department: true,
});

// Leave types
export const leaveTypes = {
  CASUAL: "casual",
  SICK: "sick",
  DUTY: "duty",
  OTHER: "other",
} as const;

// Leave limits
export const leaveLimits = {
  [leaveTypes.CASUAL]: 12,
  [leaveTypes.SICK]: 15,
  [leaveTypes.DUTY]: 10,
  [leaveTypes.OTHER]: 5,
};

// Leave status
export const leaveStatuses = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

// Leave schema
export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  leaveType: text("leave_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default(leaveStatuses.PENDING),
  approvedBy: text("approved_by"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertLeaveSchema = createInsertSchema(leaves).pick({
  teacherId: true,
  leaveType: true,
  startDate: true,
  endDate: true,
  days: true,
  reason: true,
  status: true,
  approvedBy: true,
  notes: true,
});

// Leave usage summary
export const leaveUsage = pgTable("leave_usage", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().unique(),
  casualUsed: integer("casual_used").notNull().default(0),
  sickUsed: integer("sick_used").notNull().default(0),
  dutyUsed: integer("duty_used").notNull().default(0),
  otherUsed: integer("other_used").notNull().default(0),
});

export const insertLeaveUsageSchema = createInsertSchema(leaveUsage).pick({
  teacherId: true,
  casualUsed: true,
  sickUsed: true,
  dutyUsed: true,
  otherUsed: true,
});

// Types
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;

export type LeaveUsage = typeof leaveUsage.$inferSelect;
export type InsertLeaveUsage = z.infer<typeof insertLeaveUsageSchema>;

export type LeaveType = keyof typeof leaveTypes;
export type LeaveStatus = keyof typeof leaveStatuses;

// Extended schemas for form validation
export const leaveFormSchema = insertLeaveSchema.extend({
  leaveType: z.enum([leaveTypes.CASUAL, leaveTypes.SICK, leaveTypes.DUTY, leaveTypes.OTHER]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  days: z.number().min(1, "At least one day is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const teacherSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});
