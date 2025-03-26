import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { z } from "zod";
import {
  teacherSearchSchema,
  insertTeacherSchema,
  leaveFormSchema,
  insertLeaveSchema,
  leaveTypes,
  leaveStatuses
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Teacher routes
  app.get("/api/teachers", async (_req: Request, res: Response) => {
    try {
      const teachers = await storage.getTeachers();
      return res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.get("/api/teachers/search", async (req: Request, res: Response) => {
    try {
      const { query } = teacherSearchSchema.parse({ query: req.query.q });
      const teachers = await storage.searchTeachers(query);
      return res.json(teachers);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error searching teachers:", error);
      return res.status(500).json({ message: "Failed to search teachers" });
    }
  });

  app.get("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }

      const teacher = await storage.getTeacher(id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      return res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      return res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  app.post("/api/teachers", async (req: Request, res: Response) => {
    try {
      const teacherData = insertTeacherSchema.parse(req.body);
      const newTeacher = await storage.createTeacher(teacherData);
      return res.status(201).json(newTeacher);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating teacher:", error);
      return res.status(500).json({ message: "Failed to create teacher" });
    }
  });

  // Leave routes
  app.get("/api/leaves", async (_req: Request, res: Response) => {
    try {
      const leaves = await storage.getLeaves();
      return res.json(leaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      return res.status(500).json({ message: "Failed to fetch leaves" });
    }
  });

  app.get("/api/leaves/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave ID" });
      }

      const leave = await storage.getLeave(id);
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      return res.json(leave);
    } catch (error) {
      console.error("Error fetching leave:", error);
      return res.status(500).json({ message: "Failed to fetch leave" });
    }
  });

  app.get("/api/teachers/:id/leaves", async (req: Request, res: Response) => {
    try {
      const teacherId = Number(req.params.id);
      if (isNaN(teacherId)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }

      const type = req.query.type as string | undefined;
      
      let leaves;
      if (type && type !== "all" && Object.values(leaveTypes).includes(type as any)) {
        leaves = await storage.getLeavesByTeacherAndType(teacherId, type);
      } else {
        leaves = await storage.getLeavesByTeacher(teacherId);
      }

      return res.json(leaves);
    } catch (error) {
      console.error("Error fetching teacher leaves:", error);
      return res.status(500).json({ message: "Failed to fetch teacher leaves" });
    }
  });

  app.post("/api/leaves", async (req: Request, res: Response) => {
    try {
      const leaveData = leaveFormSchema.parse(req.body);
      
      // Ensure the teacher exists
      const teacher = await storage.getTeacher(leaveData.teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // Convert to correct format for storage
      const newLeave = await storage.createLeave({
        ...leaveData,
        // Convert Date objects to ISO strings for storage
        startDate: leaveData.startDate.toISOString(),
        endDate: leaveData.endDate.toISOString(),
        status: leaveData.status || leaveStatuses.PENDING
      });

      return res.status(201).json(newLeave);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating leave:", error);
      return res.status(500).json({ message: "Failed to create leave" });
    }
  });

  app.patch("/api/leaves/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid leave ID" });
      }

      // Get existing leave
      const existingLeave = await storage.getLeave(id);
      if (!existingLeave) {
        return res.status(404).json({ message: "Leave not found" });
      }

      // Validate update data
      const updateData = req.body;
      
      // Update leave
      const updatedLeave = await storage.updateLeave(id, updateData);
      return res.json(updatedLeave);
    } catch (error) {
      console.error("Error updating leave:", error);
      return res.status(500).json({ message: "Failed to update leave" });
    }
  });

  // Leave usage routes
  app.get("/api/teachers/:id/leave-usage", async (req: Request, res: Response) => {
    try {
      const teacherId = Number(req.params.id);
      if (isNaN(teacherId)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }

      const leaveUsage = await storage.getLeaveUsage(teacherId);
      if (!leaveUsage) {
        return res.status(404).json({ message: "Leave usage not found" });
      }

      return res.json(leaveUsage);
    } catch (error) {
      console.error("Error fetching leave usage:", error);
      return res.status(500).json({ message: "Failed to fetch leave usage" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
