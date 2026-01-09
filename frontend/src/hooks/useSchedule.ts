import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  startScheduleGeneration,
  getScheduleStatus,
  getScheduleResult,
  type ScheduleJobStatus,
} from '../services/api';

export const useSchedule = () => {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Mutation to start the generation
  const startMutation = useMutation({
    mutationFn: startScheduleGeneration,
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      // Invalidate queries if needed
    },
  });

  // Query to poll status
  const statusQuery = useQuery({
    queryKey: ['scheduleStatus', currentJobId],
    queryFn: () => getScheduleStatus(currentJobId!),
    enabled: !!currentJobId, // Only poll if we have a job ID
    refetchInterval: (query) => {
      const data = query.state.data as ScheduleJobStatus | undefined;
      // Stop polling if completed or failed
      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    // Keep data fresh
    staleTime: 0,
  });

  // Query to fetch final result
  const resultQuery = useQuery({
    queryKey: ['scheduleResult', currentJobId],
    queryFn: () => getScheduleResult(currentJobId!),
    enabled: !!currentJobId && statusQuery.data?.status === 'COMPLETED',
  });

  // Derived state
  const isGenerating = startMutation.isPending || (statusQuery.data?.status !== 'COMPLETED' && statusQuery.data?.status !== 'FAILED' && !!currentJobId);
  const isComplete = statusQuery.data?.status === 'COMPLETED';
  const isError = startMutation.isError || statusQuery.isError || statusQuery.data?.status === 'FAILED';

  const statusMessage = statusQuery.data?.message || (statusQuery.data?.status === 'IN_PROGRESS' ? 'Optimization in progress...' : 'Initializing...');
  const progress = statusQuery.data?.progress || 0;

  return {
    startGeneration: startMutation.mutate,
    currentJobId,
    status: statusQuery.data?.status,
    progress,
    message: statusMessage,
    result: resultQuery.data?.schedule,
    isGenerating,
    isComplete,
    isError,
    error: startMutation.error || statusQuery.error || (statusQuery.data?.status === 'FAILED' ? new Error('Job Failed') : null),
  };
};
