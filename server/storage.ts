import {
  Teacher, InsertTeacher,
  Leave, InsertLeave,
  LeaveUsage, InsertLeaveUsage,
  leaveTypes, leaveStatuses
} from "@shared/schema";

export interface IStorage {
  // Teacher operations
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined>;
  searchTeachers(query: string): Promise<Teacher[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;

  // Leave operations
  getLeaves(): Promise<Leave[]>;
  getLeave(id: number): Promise<Leave | undefined>;
  getLeavesByTeacher(teacherId: number): Promise<Leave[]>;
  getLeavesByTeacherAndType(teacherId: number, leaveType: string): Promise<Leave[]>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeave(id: number, leave: Partial<Leave>): Promise<Leave | undefined>;

  // Leave usage operations
  getLeaveUsage(teacherId: number): Promise<LeaveUsage | undefined>;
  createOrUpdateLeaveUsage(teacherId: number, leaveType: string, days: number): Promise<LeaveUsage>;
}

export class MemStorage implements IStorage {
  private teachers: Map<number, Teacher>;
  private leaves: Map<number, Leave>;
  private leaveUsages: Map<number, LeaveUsage>;
  private teacherIdCounter: number;
  private leaveIdCounter: number;
  private leaveUsageIdCounter: number;

  constructor() {
    this.teachers = new Map();
    this.leaves = new Map();
    this.leaveUsages = new Map();
    this.teacherIdCounter = 1;
    this.leaveIdCounter = 1;
    this.leaveUsageIdCounter = 1;

    // Add some sample teachers for testing
    this.initializeData();
  }

  private initializeData() {
    // Add sample teachers
    const teacher1 = this.createTeacher({
      teacherId: "TCH-2023-001",
      name: "Sarah Johnson",
      department: "Mathematics"
    });

    const teacher2 = this.createTeacher({
      teacherId: "TCH-2023-002",
      name: "Michael Brown",
      department: "Science"
    });

    // Initialize their leave usage
    this.createOrUpdateLeaveUsage(teacher1.id, leaveTypes.CASUAL, 0);
    this.createOrUpdateLeaveUsage(teacher1.id, leaveTypes.SICK, 0);
    this.createOrUpdateLeaveUsage(teacher1.id, leaveTypes.DUTY, 0);
    this.createOrUpdateLeaveUsage(teacher1.id, leaveTypes.OTHER, 0);

    this.createOrUpdateLeaveUsage(teacher2.id, leaveTypes.CASUAL, 0);
    this.createOrUpdateLeaveUsage(teacher2.id, leaveTypes.SICK, 0);
    this.createOrUpdateLeaveUsage(teacher2.id, leaveTypes.DUTY, 0);
    this.createOrUpdateLeaveUsage(teacher2.id, leaveTypes.OTHER, 0);
  }

  // Teacher operations
  async getTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeacherByTeacherId(teacherId: string): Promise<Teacher | undefined> {
    return Array.from(this.teachers.values()).find(
      (teacher) => teacher.teacherId === teacherId
    );
  }

  async searchTeachers(query: string): Promise<Teacher[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.teachers.values()).filter(
      (teacher) => 
        teacher.name.toLowerCase().includes(lowerQuery) || 
        teacher.teacherId.toLowerCase().includes(lowerQuery)
    );
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const id = this.teacherIdCounter++;
    const newTeacher: Teacher = { ...teacher, id };
    this.teachers.set(id, newTeacher);
    return newTeacher;
  }

  // Leave operations
  async getLeaves(): Promise<Leave[]> {
    return Array.from(this.leaves.values());
  }

  async getLeave(id: number): Promise<Leave | undefined> {
    return this.leaves.get(id);
  }

  async getLeavesByTeacher(teacherId: number): Promise<Leave[]> {
    return Array.from(this.leaves.values()).filter(
      (leave) => leave.teacherId === teacherId
    );
  }

  async getLeavesByTeacherAndType(teacherId: number, leaveType: string): Promise<Leave[]> {
    return Array.from(this.leaves.values()).filter(
      (leave) => leave.teacherId === teacherId && leave.leaveType === leaveType
    );
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const id = this.leaveIdCounter++;
    const submittedAt = new Date();
    const newLeave: Leave = { ...leave, id, submittedAt };
    this.leaves.set(id, newLeave);

    // Update leave usage
    await this.createOrUpdateLeaveUsage(leave.teacherId, leave.leaveType, leave.days);

    return newLeave;
  }

  async updateLeave(id: number, leave: Partial<Leave>): Promise<Leave | undefined> {
    const existingLeave = this.leaves.get(id);
    if (!existingLeave) return undefined;

    const updatedLeave = { ...existingLeave, ...leave };
    this.leaves.set(id, updatedLeave);
    return updatedLeave;
  }

  // Leave usage operations
  async getLeaveUsage(teacherId: number): Promise<LeaveUsage | undefined> {
    return Array.from(this.leaveUsages.values()).find(
      (usage) => usage.teacherId === teacherId
    );
  }

  async createOrUpdateLeaveUsage(teacherId: number, leaveType: string, days: number): Promise<LeaveUsage> {
    let leaveUsage = await this.getLeaveUsage(teacherId);

    if (!leaveUsage) {
      // Create new
      const id = this.leaveUsageIdCounter++;
      leaveUsage = {
        id,
        teacherId,
        casualUsed: 0,
        sickUsed: 0,
        dutyUsed: 0,
        otherUsed: 0
      };
    }

    // Update used days based on leave type
    if (leaveType === leaveTypes.CASUAL) {
      leaveUsage.casualUsed += days;
    } else if (leaveType === leaveTypes.SICK) {
      leaveUsage.sickUsed += days;
    } else if (leaveType === leaveTypes.DUTY) {
      leaveUsage.dutyUsed += days;
    } else if (leaveType === leaveTypes.OTHER) {
      leaveUsage.otherUsed += days;
    }

    this.leaveUsages.set(leaveUsage.id, leaveUsage);
    return leaveUsage;
  }
}

export const storage = new MemStorage();
