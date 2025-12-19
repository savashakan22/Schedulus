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
    // 2-hour morning blocks
    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.95 },
    // Lunch break 12:00 - 13:00
    { dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'MONDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.8 },
    // 3-hour options to support longer sessions
    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.95 },
    { dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'TUESDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.8 },
    { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'WEDNESDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.95 },
    { dayOfWeek: 'WEDNESDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'WEDNESDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.8 },
    { dayOfWeek: 'WEDNESDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'WEDNESDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'THURSDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.95 },
    { dayOfWeek: 'THURSDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'THURSDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.8 },
    { dayOfWeek: 'THURSDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'THURSDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'FRIDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 0.95 },
    { dayOfWeek: 'FRIDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.9 },
    { dayOfWeek: 'FRIDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'FRIDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.75 },
    { dayOfWeek: 'FRIDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 0.95 },
    { dayOfWeek: 'FRIDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.8 },
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
 * Fetches current lessons from backend and uses default timeslots/rooms.
 */
export async function startOptimization(): Promise<OptimizationJob> {
    // Get lessons from backend
    const lessons = await getLessons();
    
    const request: OptimizationRequest = {
        timeslots: DEFAULT_TIMESLOTS,
        rooms: DEFAULT_ROOMS,
        lessons: lessons.map(lesson => ({
            id: lesson.id,
            subject: lesson.subject,
            teacher: lesson.teacher,
            studentGroup: lesson.studentGroup,
            durationHours: lesson.durationHours ?? 2,
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
 * Get all lessons from the backend.
 */
export async function getLessons(): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>('/lessons');
    return response.data;
}

/**
 * Toggle the pinned status of a lesson.
 */
export async function toggleLessonPin(lessonId: string): Promise<Lesson> {
    const response = await apiClient.patch<Lesson>(`/lessons/${lessonId}/pin`);
    return response.data;
}

/**
 * Add a new lesson.
 */
export async function addLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson> {
    const newLesson = {
        ...lesson,
        id: `l${Date.now()}`,
    };
    const response = await apiClient.post<Lesson>('/lessons', newLesson);
    return response.data;
}

/**
 * Remove a lesson.
 */
export async function removeLesson(lessonId: string): Promise<void> {
    await apiClient.delete(`/lessons/${lessonId}`);
}

/**
 * Update lesson state from a completed optimization result.
 * This is now a no-op since lessons are stored on the backend.
 */
export function syncLessonsFromTimetable(_timetable: Timetable): void {
    // No-op: lessons are managed by the backend now
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
