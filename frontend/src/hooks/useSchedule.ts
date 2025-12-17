/**
 * Schedule Hooks
 * 
 * React Query hooks for schedule data and optimization workflow.
 * Uses real API calls to the backend.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import * as scheduleApi from '../api/scheduleApi';
import type { Timetable, OptimizationJob, Lesson } from '../api/types';

// Re-export types for backward compatibility
export type { Timetable, OptimizationJob, Lesson };

// Query keys
export const queryKeys = {
    schedule: ['schedule'] as const,
    lessons: ['lessons'] as const,
    rooms: ['rooms'] as const,
    timeslots: ['timeslots'] as const,
    job: (id: string) => ['job', id] as const,
};

/**
 * Hook to get current schedule from the backend.
 */
export function useSchedule() {
    return useQuery({
        queryKey: queryKeys.schedule,
        queryFn: async (): Promise<Timetable | null> => {
            return scheduleApi.getSchedule();
        },
        refetchInterval: false,
        // Don't treat null as an error (no schedule yet)
        retry: (failureCount, error) => {
            // Don't retry 404s
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response?.status === 404) {
                    return false;
                }
            }
            return failureCount < 2;
        },
    });
}

/**
 * Hook to get all lessons (client-side state).
 */
export function useLessons() {
    return useQuery({
        queryKey: queryKeys.lessons,
        queryFn: scheduleApi.getLessons,
    });
}

/**
 * Hook to start optimization.
 */
export function useStartOptimization() {
    return useMutation({
        mutationFn: scheduleApi.startOptimization,
    });
}

/**
 * Hook to toggle lesson pin.
 */
export function useToggleLessonPin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: scheduleApi.toggleLessonPin,
        onSuccess: () => {
            // Invalidate both lessons and schedule to get fresh data
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
        },
    });
}

/**
 * Hook to add a new lesson.
 */
export function useAddLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: scheduleApi.addLesson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
        },
    });
}

/**
 * Hook to remove a lesson.
 */
export function useRemoveLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: scheduleApi.removeLesson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
        },
    });
}

/**
 * Hook to poll optimization job status.
 */
export function useOptimizationJob(jobId: string | null) {
    const [job, setJob] = useState<OptimizationJob | null>(null);

    useEffect(() => {
        if (!jobId) {
            setJob(null);
            return;
        }

        let isCancelled = false;
        
        const pollStatus = async () => {
            try {
                const status = await scheduleApi.getJobStatus(jobId);
                if (!isCancelled) {
                    setJob(status);
                    
                    // If job is still running, continue polling
                    if (status.status === 'RUNNING' || status.status === 'PENDING') {
                        setTimeout(pollStatus, 500);
                    }
                }
            } catch (error) {
                console.error('Failed to get job status:', error);
                if (!isCancelled) {
                    setJob(prev => prev ? { ...prev, status: 'FAILED', error: 'Failed to get status' } : null);
                }
            }
        };

        // Start polling
        pollStatus();

        return () => {
            isCancelled = true;
        };
    }, [jobId]);

    return job;
}

/**
 * Hook to manage the full optimization workflow.
 */
export function useOptimizationWorkflow() {
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const startMutation = useStartOptimization();
    const job = useOptimizationJob(currentJobId);
    const queryClient = useQueryClient();

    const startOptimization = useCallback(async () => {
        try {
            const result = await startMutation.mutateAsync();
            setCurrentJobId(result.id);
        } catch (error) {
            console.error('Failed to start optimization:', error);
        }
    }, [startMutation]);

    // When job completes, sync lessons and invalidate queries
    useEffect(() => {
        if (job?.status === 'COMPLETED' && job.result) {
            // Sync lesson assignments from the result
            scheduleApi.syncLessonsFromTimetable(job.result);
            
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
        }
    }, [job?.status, job?.result, queryClient]);

    const reset = useCallback(() => {
        setCurrentJobId(null);
    }, []);

    return {
        startOptimization,
        job,
        isStarting: startMutation.isPending,
        reset,
    };
}
