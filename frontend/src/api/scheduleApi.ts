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

// Manual placement type for lessons dragged by user
export interface ManualPlacement {
    timeslot: Timeslot;
    roomName?: string;
}

// Default data for new optimization requests
export const DEFAULT_TIMESLOTS: Timeslot[] = [
    // 2-hour morning blocks
    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 1.0 },
    // Lunch break 12:00 - 13:00
    { dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'MONDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'MONDAY', startTime: '16:00', endTime: '18:00', preferenceBonus: 0.9 },
    // 3-hour options to support longer sessions
    { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 1.0 },
    { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'TUESDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'TUESDAY', startTime: '15:00', endTime: '18:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'TUESDAY', startTime: '16:00', endTime: '18:00', preferenceBonus: 0.75 },
    { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.85 },
    { dayOfWeek: 'WEDNESDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 0.7 },
    { dayOfWeek: 'WEDNESDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.7 },
    { dayOfWeek: 'WEDNESDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.7 },
    { dayOfWeek: 'WEDNESDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.7 },
    { dayOfWeek: 'WEDNESDAY', startTime: '15:00', endTime: '18:00', preferenceBonus: 0.7 },
    { dayOfWeek: 'WEDNESDAY', startTime: '16:00', endTime: '18:00', preferenceBonus: 0.6 },
    { dayOfWeek: 'WEDNESDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 0.7 },
    { dayOfWeek: 'WEDNESDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.7 },
    { dayOfWeek: 'THURSDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 0.35 },
    { dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.35 },
    { dayOfWeek: 'THURSDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.25 },
    { dayOfWeek: 'THURSDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.25 },
    { dayOfWeek: 'THURSDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 0.35 },
    { dayOfWeek: 'THURSDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.25 },
    { dayOfWeek: 'FRIDAY', startTime: '08:00', endTime: '10:00', preferenceBonus: 0.1 },
    { dayOfWeek: 'FRIDAY', startTime: '10:00', endTime: '12:00', preferenceBonus: 0.1 },
    { dayOfWeek: 'FRIDAY', startTime: '13:00', endTime: '15:00', preferenceBonus: 0.1 },
    { dayOfWeek: 'FRIDAY', startTime: '15:00', endTime: '17:00', preferenceBonus: 0.1 },
    { dayOfWeek: 'FRIDAY', startTime: '08:00', endTime: '11:00', preferenceBonus: 0.1 },
    { dayOfWeek: 'FRIDAY', startTime: '13:00', endTime: '16:00', preferenceBonus: 0.1 },
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
 * Find the index of a timeslot in DEFAULT_TIMESLOTS that matches the given timeslot.
 * Returns -1 if no exact match is found.
 */
export function findTimeslotIndex(timeslot: { dayOfWeek: string; startTime: string; endTime: string }): number {
    return DEFAULT_TIMESLOTS.findIndex(ts =>
        ts.dayOfWeek === timeslot.dayOfWeek &&
        ts.startTime === timeslot.startTime &&
        ts.endTime === timeslot.endTime
    );
}

/**
 * Find the index of a room in DEFAULT_ROOMS that matches the given room name.
 * Returns -1 if no match is found.
 */
export function findRoomIndex(roomName: string): number {
    return DEFAULT_ROOMS.findIndex(r => r.name === roomName);
}

/**
 * Start a new optimization job.
 * Fetches current lessons from backend and uses default timeslots/rooms.
 * @param manualPlacements - Map of lessonId to manually placed timeslot (from drag-drop)
 */
export async function startOptimization(
    manualPlacements?: Map<string, ManualPlacement>
): Promise<OptimizationJob> {
    // Get lessons from backend
    const lessons = await getLessons();

    const request: OptimizationRequest = {
        timeslots: DEFAULT_TIMESLOTS,
        rooms: DEFAULT_ROOMS,
        lessons: lessons.map(lesson => {
            const placement = manualPlacements?.get(lesson.id);
            let pinnedTimeslotIndex: number | undefined;
            let pinnedRoomIndex: number | undefined;
            let isPinned = lesson.pinned;

            // If there's a manual placement, set pinned indices
            if (placement) {
                pinnedTimeslotIndex = findTimeslotIndex(placement.timeslot);
                if (pinnedTimeslotIndex === -1) pinnedTimeslotIndex = undefined;

                if (placement.roomName) {
                    pinnedRoomIndex = findRoomIndex(placement.roomName);
                    if (pinnedRoomIndex === -1) pinnedRoomIndex = undefined;
                }

                // Auto-pin if there's a valid placement
                if (pinnedTimeslotIndex !== undefined) {
                    isPinned = true;
                }
            }

            return {
                id: lesson.id,
                subject: lesson.subject,
                teacher: lesson.teacher,
                studentGroup: lesson.studentGroup,
                durationHours: lesson.durationHours ?? 2,
                difficultyWeight: lesson.difficultyWeight,
                satisfactionScore: lesson.satisfactionScore,
                pinned: isPinned,
                pinnedTimeslotIndex,
                pinnedRoomIndex,
            };
        }),
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
 * Import lessons from XLSX.
 */
export async function importLessons(file: File): Promise<Lesson[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Lesson[]>('/lessons/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
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
