// Mock data for development - simulates backend responses with proper state management

export interface Timeslot {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    preferenceBonus?: number;
}

export interface Room {
    id: string;
    name: string;
    capacity: number;
}

export interface Lesson {
    id: string;
    subject: string;
    teacher: string;
    studentGroup: string;
    timeslot?: Timeslot;
    room?: Room;
    difficultyWeight: number;
    satisfactionScore: number;
    pinned: boolean;
}

export interface Timetable {
    timeslots: Timeslot[];
    rooms: Room[];
    lessons: Lesson[];
    score?: {
        hardScore: number;
        softScore: number;
    };
}

export interface OptimizationJob {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress: number;
    startedAt: string;
    completedAt?: string;
    result?: Timetable;
}

// Mock timeslots for a university week
const timeslots: Timeslot[] = [
    { id: 'ts1', dayOfWeek: 'MONDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { id: 'ts2', dayOfWeek: 'MONDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { id: 'ts3', dayOfWeek: 'MONDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { id: 'ts4', dayOfWeek: 'MONDAY', startTime: '14:45', endTime: '16:15', preferenceBonus: 0.7 },
    { id: 'ts5', dayOfWeek: 'TUESDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { id: 'ts6', dayOfWeek: 'TUESDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { id: 'ts7', dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { id: 'ts8', dayOfWeek: 'TUESDAY', startTime: '14:45', endTime: '16:15', preferenceBonus: 0.7 },
    { id: 'ts9', dayOfWeek: 'WEDNESDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { id: 'ts10', dayOfWeek: 'WEDNESDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { id: 'ts11', dayOfWeek: 'WEDNESDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { id: 'ts12', dayOfWeek: 'THURSDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.9 },
    { id: 'ts13', dayOfWeek: 'THURSDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 1.0 },
    { id: 'ts14', dayOfWeek: 'THURSDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.8 },
    { id: 'ts15', dayOfWeek: 'THURSDAY', startTime: '14:45', endTime: '16:15', preferenceBonus: 0.7 },
    { id: 'ts16', dayOfWeek: 'FRIDAY', startTime: '08:30', endTime: '10:00', preferenceBonus: 0.85 },
    { id: 'ts17', dayOfWeek: 'FRIDAY', startTime: '10:15', endTime: '11:45', preferenceBonus: 0.95 },
    { id: 'ts18', dayOfWeek: 'FRIDAY', startTime: '13:00', endTime: '14:30', preferenceBonus: 0.75 },
];

// Mock rooms
const rooms: Room[] = [
    { id: 'room1', name: 'Lecture Hall A', capacity: 200 },
    { id: 'room2', name: 'Lecture Hall B', capacity: 150 },
    { id: 'room3', name: 'Seminar Room 101', capacity: 40 },
    { id: 'room4', name: 'Seminar Room 102', capacity: 40 },
    { id: 'room5', name: 'Lab 201', capacity: 30 },
    { id: 'room6', name: 'Lab 202', capacity: 30 },
    { id: 'room7', name: 'Computer Lab', capacity: 25 },
];

// ========== STATE MANAGEMENT ==========
// This simulates a database with mutable state

let lessons: Lesson[] = [
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

// Current schedule state - lessons with their assignments
let currentSchedule: Timetable = {
    timeslots,
    rooms,
    lessons: [],
    score: { hardScore: 0, softScore: 0 },
};

// Initialize with random assignments
function initializeSchedule() {
    const shuffledTimeslots = [...timeslots].sort(() => Math.random() - 0.5);
    const shuffledRooms = [...rooms].sort(() => Math.random() - 0.5);

    currentSchedule.lessons = lessons.map((lesson, index) => ({
        ...lesson,
        timeslot: shuffledTimeslots[index % shuffledTimeslots.length],
        room: shuffledRooms[index % shuffledRooms.length],
    }));
    currentSchedule.score = calculateScore(currentSchedule.lessons);
}

// Calculate mock score
function calculateScore(scheduledLessons: Lesson[]): { hardScore: number; softScore: number } {
    let hardScore = 0;
    let softScore = 0;

    // Check for conflicts
    for (let i = 0; i < scheduledLessons.length; i++) {
        for (let j = i + 1; j < scheduledLessons.length; j++) {
            const l1 = scheduledLessons[i];
            const l2 = scheduledLessons[j];
            if (l1.timeslot?.id === l2.timeslot?.id) {
                if (l1.room?.id === l2.room?.id) hardScore -= 1; // Room conflict
                if (l1.teacher === l2.teacher) hardScore -= 1; // Teacher conflict
                if (l1.studentGroup === l2.studentGroup) hardScore -= 1; // Student conflict
            }
        }

        // Soft: morning preference for difficult courses
        const lesson = scheduledLessons[i];
        if (lesson.difficultyWeight >= 0.8 && lesson.timeslot) {
            const hour = parseInt(lesson.timeslot.startTime.split(':')[0]);
            if (hour >= 14) softScore -= 2; // Afternoon penalty for hard course
        }

        // Soft: satisfaction bonus
        softScore += Math.round(lesson.satisfactionScore * 3);
    }

    return { hardScore, softScore };
}

// Initialize on load
initializeSchedule();

// Job state
let currentJob: OptimizationJob | null = null;

// ========== API ==========

export const mockApi = {
    // Get current schedule
    getSchedule: async (): Promise<Timetable> => {
        await delay(100);
        return {
            ...currentSchedule,
            lessons: currentSchedule.lessons.map(l => ({ ...l })),
        };
    },

    // Trigger optimization - this actually reshuffles the schedule!
    startOptimization: async (): Promise<OptimizationJob> => {
        await delay(200);

        const jobId = `job-${Date.now()}`;
        currentJob = {
            id: jobId,
            status: 'PENDING',
            progress: 0,
            startedAt: new Date().toISOString(),
        };

        // Simulate optimization with actual schedule changes
        simulateOptimization(jobId);

        return { ...currentJob };
    },

    // Get optimization status
    getJobStatus: async (jobId: string): Promise<OptimizationJob> => {
        await delay(50);
        if (!currentJob || currentJob.id !== jobId) {
            throw new Error('Job not found');
        }
        return { ...currentJob };
    },

    // Pin/unpin a lesson
    toggleLessonPin: async (lessonId: string): Promise<Lesson> => {
        await delay(100);

        // Update in lessons array
        const lessonIndex = lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex === -1) throw new Error('Lesson not found');

        lessons[lessonIndex] = { ...lessons[lessonIndex], pinned: !lessons[lessonIndex].pinned };

        // Update in current schedule
        const scheduleIndex = currentSchedule.lessons.findIndex(l => l.id === lessonId);
        if (scheduleIndex !== -1) {
            currentSchedule.lessons[scheduleIndex] = {
                ...currentSchedule.lessons[scheduleIndex],
                pinned: lessons[lessonIndex].pinned,
            };
        }

        return { ...lessons[lessonIndex] };
    },

    // Get all lessons
    getLessons: async (): Promise<Lesson[]> => {
        await delay(100);
        return lessons.map(l => ({ ...l }));
    },

    // Add a new lesson
    addLesson: async (lesson: Omit<Lesson, 'id'>): Promise<Lesson> => {
        await delay(200);

        const newLesson: Lesson = {
            ...lesson,
            id: `l${Date.now()}`,
        };

        lessons.push(newLesson);

        // Assign to random timeslot/room
        const scheduledLesson: Lesson = {
            ...newLesson,
            timeslot: timeslots[Math.floor(Math.random() * timeslots.length)],
            room: rooms[Math.floor(Math.random() * rooms.length)],
        };
        currentSchedule.lessons.push(scheduledLesson);
        currentSchedule.score = calculateScore(currentSchedule.lessons);

        return { ...newLesson };
    },

    // Remove a lesson
    removeLesson: async (lessonId: string): Promise<void> => {
        await delay(100);

        lessons = lessons.filter(l => l.id !== lessonId);
        currentSchedule.lessons = currentSchedule.lessons.filter(l => l.id !== lessonId);
        currentSchedule.score = calculateScore(currentSchedule.lessons);
    },

    // Get rooms
    getRooms: async (): Promise<Room[]> => {
        await delay(100);
        return [...rooms];
    },

    // Get timeslots
    getTimeslots: async (): Promise<Timeslot[]> => {
        await delay(100);
        return [...timeslots];
    },
};

// Helper functions
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function simulateOptimization(jobId: string) {
    if (!currentJob || currentJob.id !== jobId) return;

    const steps = [
        { status: 'RUNNING' as const, progress: 10, delay: 300 },
        { status: 'RUNNING' as const, progress: 30, delay: 400 },
        { status: 'RUNNING' as const, progress: 50, delay: 500 },
        { status: 'RUNNING' as const, progress: 70, delay: 400 },
        { status: 'RUNNING' as const, progress: 90, delay: 300 },
        { status: 'COMPLETED' as const, progress: 100, delay: 200 },
    ];

    let totalDelay = 0;
    steps.forEach((step) => {
        totalDelay += step.delay;
        setTimeout(() => {
            if (currentJob && currentJob.id === jobId) {
                currentJob.status = step.status;
                currentJob.progress = step.progress;

                if (step.status === 'COMPLETED') {
                    // Actually optimize the schedule!
                    optimizeSchedule();
                    currentJob.completedAt = new Date().toISOString();
                    currentJob.result = {
                        ...currentSchedule,
                        lessons: currentSchedule.lessons.map(l => ({ ...l })),
                    };
                }
            }
        }, totalDelay);
    });
}

function optimizeSchedule() {
    // Smart reshuffling that respects pins and tries to avoid conflicts
    const pinnedLessons = currentSchedule.lessons.filter(l => l.pinned);
    const unpinnedLessons = currentSchedule.lessons.filter(l => !l.pinned);

    // Get used timeslot-room combos from pinned lessons
    const usedSlots = new Set(
        pinnedLessons.map(l => `${l.timeslot?.id}-${l.room?.id}`)
    );

    // Available slots for unpinned lessons
    const availableSlots: { timeslot: Timeslot; room: Room }[] = [];
    for (const ts of timeslots) {
        for (const room of rooms) {
            if (!usedSlots.has(`${ts.id}-${room.id}`)) {
                availableSlots.push({ timeslot: ts, room });
            }
        }
    }

    // Shuffle available slots
    availableSlots.sort(() => Math.random() - 0.5);

    // Sort unpinned lessons: difficult courses first (to get morning slots)
    unpinnedLessons.sort((a, b) => b.difficultyWeight - a.difficultyWeight);

    // Sort morning slots first for difficult courses
    availableSlots.sort((a, b) => {
        const hourA = parseInt(a.timeslot.startTime.split(':')[0]);
        const hourB = parseInt(b.timeslot.startTime.split(':')[0]);
        return hourA - hourB;
    });

    // Reassign unpinned lessons
    const reassigned = unpinnedLessons.map((lesson, index) => ({
        ...lesson,
        timeslot: availableSlots[index % availableSlots.length].timeslot,
        room: availableSlots[index % availableSlots.length].room,
    }));

    currentSchedule.lessons = [...pinnedLessons, ...reassigned];
    currentSchedule.score = calculateScore(currentSchedule.lessons);
}

// Export for type checking
export const mockTimeslots = timeslots;
export const mockRooms = rooms;
export const mockLessons = lessons;
