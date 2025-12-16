import axios from 'axios';

// Interfaces based on requirements
export interface Lesson {
  id: string;
  title: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  room: string;
  professor: string;
  type: 'Lecture' | 'Lab';
  mlScore?: number; // Optional as per discussion
}

export type JobStatus = 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface ScheduleJobStatus {
  jobId: string;
  status: JobStatus;
  progress?: number; // 0-100
  message?: string;
}

export interface ScheduleResult {
  jobId: string;
  schedule: Lesson[];
}

export interface ScheduleRequest {
  semesterId: string;
  // Add other constraint config here if needed
}

// Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Services
export const startScheduleGeneration = async (data: ScheduleRequest): Promise<{ jobId: string }> => {
  // Mock implementation for development until backend is ready
  // return new Promise((resolve) => setTimeout(() => resolve({ jobId: 'mock-job-123' }), 1000));

  const response = await api.post<{ jobId: string }>('/schedule/generate', data);
  return response.data;
};

export const getScheduleStatus = async (jobId: string): Promise<ScheduleJobStatus> => {
   // Mock implementation
   /*
   return new Promise((resolve) => {
     // Randomly simulate progress
     resolve({
       jobId,
       status: 'IN_PROGRESS',
       progress: Math.floor(Math.random() * 100),
       message: 'Optimizing...'
     });
   });
   */
  const response = await api.get<ScheduleJobStatus>(`/schedule/status/${jobId}`);
  return response.data;
};

export const getScheduleResult = async (jobId: string): Promise<ScheduleResult> => {
  const response = await api.get<ScheduleResult>(`/schedule/result/${jobId}`);
  return response.data;
};

export default api;
