import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // auth routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password, role } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password || user.role !== role) {
        return res.status(401).json({ message: "Invalid credentials or role" });
      }
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.users.listStudents.path, async (req, res) => {
    const students = await storage.getStudents();
    res.json(students);
  });

  app.get(api.attendance.list.path, async (req, res) => {
    const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
    const records = await storage.getAttendance(studentId);
    res.json(records);
  });

  app.post(api.attendance.create.path, async (req, res) => {
    try {
      const data = api.attendance.create.input.parse(req.body);
      const created = await storage.createAttendance(data);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // marks
  app.get(api.marks.list.path, async (req, res) => {
    const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
    const records = await storage.getMarks(studentId);
    res.json(records);
  });
  
  app.post(api.marks.create.path, async (req, res) => {
    try {
      // Coerce numeric inputs for foreign keys
      const schema = api.marks.create.input.extend({
        studentId: z.coerce.number(),
        internalMarks: z.coerce.number(),
        totalMarks: z.coerce.number(),
      });
      const data = schema.parse(req.body);
      const created = await storage.createMarks(data);
      res.status(201).json(created);
    } catch(err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // assignments
  app.get(api.assignments.list.path, async (req, res) => {
    res.json(await storage.getAssignments());
  });

  app.post(api.assignments.create.path, async (req, res) => {
    try {
      const schema = api.assignments.create.input.extend({
        facultyId: z.coerce.number(),
      });
      const data = schema.parse(req.body);
      const created = await storage.createAssignment(data);
      res.status(201).json(created);
    } catch(err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // materials
  app.get(api.materials.list.path, async (req, res) => {
    res.json(await storage.getMaterials());
  });

  app.post(api.materials.create.path, async (req, res) => {
    try {
      const schema = api.materials.create.input.extend({
        facultyId: z.coerce.number(),
      });
      const data = schema.parse(req.body);
      const created = await storage.createMaterial(data);
      res.status(201).json(created);
    } catch(err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // announcements
  app.get(api.announcements.list.path, async (req, res) => {
    res.json(await storage.getAnnouncements());
  });

  app.post(api.announcements.create.path, async (req, res) => {
    try {
      const schema = api.announcements.create.input.extend({
        facultyId: z.coerce.number(),
      });
      const data = schema.parse(req.body);
      const created = await storage.createAnnouncement(data);
      res.status(201).json(created);
    } catch(err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Call seed immediately
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingUsers = await storage.getStudents();
    if (existingUsers.length === 0) {
      // Add student
      const student = await storage.createStudent({ username: "student1", password: "password", role: "student", name: "Alice Smith", department: "Computer Science" });
      // Add faculty
      const faculty = await storage.createStudent({ username: "faculty1", password: "password", role: "faculty", name: "Dr. Bob", department: "Computer Science" });
  
      await storage.createAttendance({ studentId: student.id, subject: "Mathematics", totalClasses: 40, attendedClasses: 35 });
      await storage.createAttendance({ studentId: student.id, subject: "Physics", totalClasses: 35, attendedClasses: 30 });
      await storage.createAttendance({ studentId: student.id, subject: "Computer Science", totalClasses: 45, attendedClasses: 42 });
      
      await storage.createMarks({ studentId: student.id, subject: "Mathematics", internalMarks: 45, totalMarks: 50 });
      await storage.createMarks({ studentId: student.id, subject: "Physics", internalMarks: 38, totalMarks: 50 });
      await storage.createMarks({ studentId: student.id, subject: "Computer Science", internalMarks: 48, totalMarks: 50 });
  
      await storage.createAssignment({ title: "Math Assignment 1", description: "Solve equations 1 to 10", subject: "Mathematics", dueDate: "2024-05-10", facultyId: faculty.id });
      await storage.createMaterial({ title: "Physics Notes", subject: "Physics", url: "https://example.com/physics", facultyId: faculty.id });
      await storage.createAnnouncement({ title: "Exam Schedule", content: "Midterms start next week", date: "2024-05-01", facultyId: faculty.id });
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}
