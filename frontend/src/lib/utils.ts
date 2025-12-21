import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
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

export function getDayLabel(date: Date): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
    return days[date.getDay()] ?? 'MONDAY';
}

export function formatTimeFromDate(date: Date): string {
    return date.toTimeString().slice(0, 5);
}

const CLASS_COLOR_CLASSES = [
    'class-color-rose',
    'class-color-emerald',
    'class-color-sky',
    'class-color-amber',
    'class-color-violet',
    'class-color-lime',
];

export function getClassColorClass(studentGroup: string | undefined): string {
    if (!studentGroup) return 'class-color-rose';
    const hash = Array.from(studentGroup).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % CLASS_COLOR_CLASSES.length;
    return CLASS_COLOR_CLASSES[index];
}
