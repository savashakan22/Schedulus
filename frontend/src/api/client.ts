/**
 * API Client Configuration
 * 
 * Axios instance configured for communication with the backend.
 * Uses Vite proxy in development (/api → http://localhost:8080)
 */

import axios from 'axios';

// Create axios instance with base configuration
export const apiClient = axios.create({
    baseURL: '/api',
    timeout: 60000, // 60 seconds for optimization requests
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Transform snake_case keys to camelCase
 */
function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively transform object keys from snake_case to camelCase
 */
function transformKeys(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(transformKeys);
    }
    
    if (typeof obj === 'object') {
        const transformed: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            transformed[snakeToCamel(key)] = transformKeys(value);
        }
        return transformed;
    }
    
    return obj;
}

/**
 * Transform camelCase keys to snake_case for requests
 */
function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transform object keys from camelCase to snake_case
 */
function transformKeysToSnake(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(transformKeysToSnake);
    }
    
    if (typeof obj === 'object') {
        const transformed: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            transformed[camelToSnake(key)] = transformKeysToSnake(value);
        }
        return transformed;
    }
    
    return obj;
}

// Response interceptor - transform snake_case to camelCase
apiClient.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = transformKeys(response.data);
        }
        return response;
    },
    (error) => {
        // Log error for debugging
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Request interceptor - transform camelCase to snake_case
apiClient.interceptors.request.use(
    (config) => {
        // Do not transform multipart/form-data payloads (e.g., file uploads)
        if (config.data instanceof FormData) {
            return config;
        }

        if (config.data) {
            config.data = transformKeysToSnake(config.data);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
