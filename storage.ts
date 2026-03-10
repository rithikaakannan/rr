import {
  users, attendance, marks, assignments, materials, announcements,
  type User, type InsertUser,
  type Attendance, type InsertAttendance,
  type Marks, type InsertMarks,
  type Assignment, type InsertAssignment,
  type Material, type InsertMaterial,
  type Announcement, type InsertAnnouncement
} from "@shared/schema";

import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getStudents(): Promise<User[]>;
  createStudent(user: InsertUser): Promise<User>;
  
  getAttendance(studentId?: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  
  getMarks(studentId?: number): Promise<Marks[]>;
  createMarks(marks: InsertMarks): Promise<Marks>;
  
  getAssignments(): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  
  getMaterials(): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getStudents(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "student"));
  }
  
  async createStudent(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  
  async getAttendance(studentId?: number): Promise<Attendance[]> {
    if (studentId) {
      return await db.select().from(attendance).where(eq(attendance.studentId, studentId));
    }
    return await db.select().from(attendance);
  }
  
  async createAttendance(att: InsertAttendance): Promise<Attendance> {
    const [created] = await db.insert(attendance).values(att).returning();
    return created;
  }
  
  async getMarks(studentId?: number): Promise<Marks[]> {
    if (studentId) {
      return await db.select().from(marks).where(eq(marks.studentId, studentId));
    }
    return await db.select().from(marks);
  }
  
  async createMarks(m: InsertMarks): Promise<Marks> {
    const [created] = await db.insert(marks).values(m).returning();
    return created;
  }
  
  async getAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments);
  }
  
  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [created] = await db.insert(assignments).values(assignment).returning();
    return created;
  }
  
  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials);
  }
  
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [created] = await db.insert(materials).values(material).returning();
    return created;
  }
  
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements);
  }
  
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
