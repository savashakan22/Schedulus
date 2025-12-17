/**
 * API Type Definitions
 * 
 * TypeScript interfaces matching backend response format.
 * These mirror the Pydantic schemas from main-backend/schemas.py
 */

// ========== Core Domain Types ==========

export interface Timeslot {
    id?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    preferenceBonus?: number;
}

export interface Room {
    id?: string;
    name: string;
    capacity?: number;
}

export interface Lesson {
    id: string;
    subject: string;
    teacher: string;
    studentGroup: string;
    timeslot?: Timeslot;
    room?: Room;
    difficultyWeight?: number;
    satisfactionScore?: number;
    pinned: boolean;
    pinnedTimeslotIndex?: number;
    pinnedRoomIndex?: number;
}

export interface Score {
    hardScore: number;
    softScore: number;
}

export interface Timetable {
    timeslots: Timeslot[];
    rooms: Room[];
    lessons: Lesson[];
    score?: Score;
}

// ========== Job Types ==========

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface OptimizationJob {
    id: string;
    status: JobStatus;
    progress: number;
    startedAt: string;
    completedAt?: string;
    result?: Timetable;
    error?: string;
}

// ========== Request Types ==========

export interface TimeslotCreate {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    preferenceBonus?: number;
}

export interface RoomCreate {
    name: string;
    capacity?: number;
}

export interface LessonCreate {
    id: string;
    subject: string;
    teacher: string;
    studentGroup: string;
    difficultyWeight?: number;
    satisfactionScore?: number;
    pinned?: boolean;
    pinnedTimeslotIndex?: number;
    pinnedRoomIndex?: number;
}

export interface OptimizationRequest {
    timeslots: TimeslotCreate[];
    rooms: RoomCreate[];
    lessons: LessonCreate[];
    solverTimeLimitSeconds?: number;
}

// ========== Health Check ==========

export interface HealthResponse {
    status: string;
    version: string;
    services: Record<string, string>;
}
