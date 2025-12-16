import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi, OptimizationJob, Lesson } from '../data/mockData';
import { useState, useEffect, useCallback } from 'react';

// Query keys
export const queryKeys = {
    schedule: ['schedule'] as const,
    lessons: ['lessons'] as const,
    rooms: ['rooms'] as const,
    timeslots: ['timeslots'] as const,
    job: (id: string) => ['job', id] as const,
};

// Hook to get current schedule
export function useSchedule() {
    return useQuery({
        queryKey: queryKeys.schedule,
        queryFn: mockApi.getSchedule,
        refetchInterval: false,
    });
}

// Hook to get all lessons
export function useLessons() {
    return useQuery({
        queryKey: queryKeys.lessons,
        queryFn: mockApi.getLessons,
    });
}

// Hook to start optimization
export function useStartOptimization() {
    return useMutation({
        mutationFn: mockApi.startOptimization,
    });
}

// Hook to toggle lesson pin
export function useToggleLessonPin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mockApi.toggleLessonPin,
        onSuccess: () => {
            // Invalidate both lessons and schedule to get fresh data
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
        },
    });
}

// Hook to add a new lesson
export function useAddLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mockApi.addLesson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
        },
    });
}

// Hook to remove a lesson
export function useRemoveLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: mockApi.removeLesson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
        },
    });
}

// Hook to poll optimization job status
export function useOptimizationJob(jobId: string | null) {
    const [job, setJob] = useState<OptimizationJob | null>(null);

    useEffect(() => {
        if (!jobId) {
            setJob(null);
            return;
        }

        const pollInterval = setInterval(async () => {
            try {
                const status = await mockApi.getJobStatus(jobId);
                setJob(status);

                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Failed to get job status:', error);
                clearInterval(pollInterval);
            }
        }, 200); // Faster polling

        return () => clearInterval(pollInterval);
    }, [jobId]);

    return job;
}

// Hook to manage optimization workflow
export function useOptimizationWorkflow() {
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const startMutation = useStartOptimization();
    const job = useOptimizationJob(currentJobId);
    const queryClient = useQueryClient();

    const startOptimization = useCallback(async () => {
        const result = await startMutation.mutateAsync();
        setCurrentJobId(result.id);
    }, [startMutation]);

    // When job completes, invalidate schedule and lessons
    useEffect(() => {
        if (job?.status === 'COMPLETED') {
            queryClient.invalidateQueries({ queryKey: queryKeys.schedule });
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons });
        }
    }, [job?.status, queryClient]);

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

