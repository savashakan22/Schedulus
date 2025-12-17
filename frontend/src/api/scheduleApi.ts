/**
 * Schedule API Functions
 * 
 * API calls for schedule optimization and management.
 */

import apiClient from './client';
import type { 
    Timetable, 
    OptimizationJob, 
    OptimizationRequest,
    Lesson,
    Timeslot,
    Room,
} from './types';

// Default data for new optimization requests
const DEFAULT_TIMESLOTS: Timeslot[] = [
    { dayOfWeek: 'MONDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'MONDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { dayOfWeek: 'MONDAY', startTime: '14:45', endTime: '16:15', preferenceBonus: 0.7 },
    { dayOfWeek: 'TUESDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'TUESDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { dayOfWeek: 'TUESDAY', startTime: '14:45', endTime: '16:15', preferenceBonus: 0.7 },
    { dayOfWeek: 'WEDNESDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'WEDNESDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { dayOfWeek: 'WEDNESDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { dayOfWeek: 'THURSDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'THURSDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { dayOfWeek: 'THURSDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { dayOfWeek: 'THURSDAY', startTime: '14:45', endTime: '16:15', preferenceBonus: 0.7 },
    { dayOfWeek: 'FRIDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'FRIDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 0.95 },
    { dayOfWeek: 'FRIDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.75 },
];

const DEFAULT_ROOMS: Room[] = [
    { name: 'Lecture Hall A', capacity: 200 },
    { name: 'Lecture Hall B', capacity: 150 },
    { name: 'Seminar Room 101', capacity: 40 },
    { name: 'Seminar Room 102', capacity: 40 },
    { name: 'Lab 201', capacity: 30 },
    { name: 'Lab 202', capacity: 30 },
    { name: 'Computer Lab', capacity: 25 },
];

const DEFAULT_LESSONS: Lesson[] = [
    { id: 'l1', subject: 'Introduction to Programming', teacher: 'Dr. Smith', studentGroup: 'CS-1', difficultyWeight: 0.7, satisfactionScore: 0.85, pinned: false },
    { id: 'l2', subject: 'Data Structures', teacher: 'Dr. Johnson', studentGroup: 'CS-2', difficultyWeight: 0.85, satisfactionScore: 0.8, pinned: false },
    { id: 'l3', subject: 'Algorithms', teacher: 'Dr. Johnson', studentGroup: 'CS-2', difficultyWeight: 0.9, satisfactionScore: 0.75, pinned: false },
    { id: 'l4', subject: 'Database Systems', teacher: 'Prof. Williams', studentGroup: 'CS-3', difficultyWeight: 0.75, satisfactionScore: 0.88, pinned: false },
    { id: 'l5', subject: 'Operating Systems', teacher: 'Dr. Brown', studentGroup: 'CS-3', difficultyWeight: 0.82, satisfactionScore: 0.7, pinned: false },
    { id: 'l6', subject: 'Computer Networks', teacher: 'Dr. Davis', studentGroup: 'CS-3', difficultyWeight: 0.78, satisfactionScore: 0.82, pinned: false },
    { id: 'l7', subject: 'Linear Algebra', teacher: 'Prof. Miller', studentGroup: 'MATH-1', difficultyWeight: 0.88, satisfactionScore: 0.65, pinned: false },
    { id: 'l8', subject: 'Calculus II', teacher: 'Prof. Miller', studentGroup: 'MATH-1', difficultyWeight: 0.92, satisfactionScore: 0.6, pinned: false },
    { id: 'l9', subject: 'Statistics', teacher: 'Dr. Wilson', studentGroup: 'MATH-2', difficultyWeight: 0.72, satisfactionScore: 0.78, pinned: false },
    { id: 'l10', subject: 'Machine Learning', teacher: 'Dr. Anderson', studentGroup: 'CS-4', difficultyWeight: 0.95, satisfactionScore: 0.92, pinned: false },
];

// In-memory lesson state for client-side management
// This persists lessons across optimization runs
let clientLessons: Lesson[] = [...DEFAULT_LESSONS];

/**
 * Get the latest completed schedule from the backend.
 * Returns null if no schedule exists yet.
 */
export async function getSchedule(): Promise<Timetable | null> {
    try {
        const response = await apiClient.get<Timetable>('/schedules/latest');
        return response.data;
    } catch (error: unknown) {
        // 404 means no schedule exists yet, not an error
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 404) {
                return null;
            }
        }
        throw error;
    }
}

/**
 * Start a new optimization job.
 * Uses the current lesson state and default timeslots/rooms.
 */
export async function startOptimization(): Promise<OptimizationJob> {
    const request: OptimizationRequest = {
        timeslots: DEFAULT_TIMESLOTS,
        rooms: DEFAULT_ROOMS,
        lessons: clientLessons.map(lesson => ({
            id: lesson.id,
            subject: lesson.subject,
            teacher: lesson.teacher,
            studentGroup: lesson.studentGroup,
            difficultyWeight: lesson.difficultyWeight,
            satisfactionScore: lesson.satisfactionScore,
            pinned: lesson.pinned,
        })),
        solverTimeLimitSeconds: 30,
    };
    
    const response = await apiClient.post<OptimizationJob>('/schedules/optimize', request);
    return response.data;
}

/**
 * Get the status of an optimization job.
 */
export async function getJobStatus(jobId: string): Promise<OptimizationJob> {
    const response = await apiClient.get<OptimizationJob>(`/schedules/jobs/${jobId}`);
    return response.data;
}

/**
 * Get all lessons (client-side state).
 * Backend doesn't have a dedicated lessons endpoint, so we manage locally.
 */
export async function getLessons(): Promise<Lesson[]> {
    return [...clientLessons];
}

/**
 * Toggle the pinned status of a lesson.
 */
export async function toggleLessonPin(lessonId: string): Promise<Lesson> {
    const lessonIndex = clientLessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) {
        throw new Error('Lesson not found');
    }
    
    clientLessons[lessonIndex] = {
        ...clientLessons[lessonIndex],
        pinned: !clientLessons[lessonIndex].pinned,
    };
    
    return { ...clientLessons[lessonIndex] };
}

/**
 * Add a new lesson.
 */
export async function addLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson> {
    const newLesson: Lesson = {
        ...lesson,
        id: `l${Date.now()}`,
    };
    clientLessons.push(newLesson);
    return { ...newLesson };
}

/**
 * Remove a lesson.
 */
export async function removeLesson(lessonId: string): Promise<void> {
    clientLessons = clientLessons.filter(l => l.id !== lessonId);
}

/**
 * Update lesson state from a completed optimization result.
 * This syncs the timeslot and room assignments back to client state.
 */
export function syncLessonsFromTimetable(timetable: Timetable): void {
    for (const scheduledLesson of timetable.lessons) {
        const clientIndex = clientLessons.findIndex(l => l.id === scheduledLesson.id);
        if (clientIndex !== -1) {
            clientLessons[clientIndex] = {
                ...clientLessons[clientIndex],
                timeslot: scheduledLesson.timeslot,
                room: scheduledLesson.room,
            };
        }
    }
}

/**
 * Get timeslots (static data).
 */
export async function getTimeslots(): Promise<Timeslot[]> {
    return [...DEFAULT_TIMESLOTS];
}

/**
 * Get rooms (static data).
 */
export async function getRooms(): Promise<Room[]> {
    return [...DEFAULT_ROOMS];
}
