import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
    return time;
}

export function getDayNumber(day: string): number {
    const days: Record<string, number> = {
        'SUNDAY': 0,
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5,
        'SATURDAY': 6,
    };
    return days[day] ?? 1;
}

export function getDifficultyClass(weight: number | undefined): string {
    const w = weight ?? 0.5;
    if (w >= 0.8) return 'difficulty-high';
    if (w >= 0.6) return 'difficulty-medium';
    return 'difficulty-low';
}

export function getDifficultyLabel(weight: number | undefined): string {
    const w = weight ?? 0.5;
    if (w >= 0.8) return 'Hard';
    if (w >= 0.6) return 'Medium';
    return 'Easy';
}

export function getScoreColor(hardScore: number, softScore: number): string {
    if (hardScore < 0) return 'text-red-500';
    if (softScore < -50) return 'text-amber-500';
    return 'text-emerald-500';
}
