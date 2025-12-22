import { useEffect, useMemo, useState } from 'react';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { OptimizationPanel } from './components/OptimizationPanel';
import { LessonList } from './components/LessonList';
import { StatsCards } from './components/StatsCards';
import { useSchedule, useLessons, useOptimizationWorkflow, useToggleLessonPin, useAddLesson, useRemoveLesson, Lesson } from './hooks/useSchedule';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Calendar, GraduationCap, X, Pin, User, Users, MapPin, AlertTriangle, Smile, LogIn } from 'lucide-react';
import { getClassColorClass, getDifficultyLabel } from './lib/utils';
import { Login } from './components/Login';

function App() {
    const { data: timetable, isLoading: isLoadingSchedule } = useSchedule();
    const { data: lessons, isLoading: isLoadingLessons } = useLessons();
    const { startOptimization, job, isStarting, reset } = useOptimizationWorkflow();
    const togglePin = useToggleLessonPin();
    const addLesson = useAddLesson();
    const removeLesson = useRemoveLesson();

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
    const [localTimetable, setLocalTimetable] = useState<typeof timetable>(null);
    const [hasLocalEdits, setHasLocalEdits] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(localStorage.getItem('demo-auth')));

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleEventClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    };

    const handleTogglePin = (lessonId: string) => {
        togglePin.mutate(lessonId);
        if (selectedLesson?.id === lessonId) {
            setSelectedLesson(prev => prev ? { ...prev, pinned: !prev.pinned } : null);
        }
    };

    const handleAddLesson = (lesson: Omit<Lesson, 'id'>) => {
        addLesson.mutate(lesson);
    };

    const handleRemoveLesson = (lessonId: string) => {
        removeLesson.mutate(lessonId);
        if (selectedLesson?.id === lessonId) {
            setSelectedLesson(null);
        }
    };

    const lessonGroups = useMemo(
        () => Array.from(new Set((lessons ?? []).map(l => l.studentGroup))),
        [lessons]
    );

    // Keep a local editable copy of the timetable for drag-and-drop changes
    useEffect(() => {
        if (!hasLocalEdits) {
            setLocalTimetable(timetable ?? null);
        }
    }, [timetable, hasLocalEdits]);

    const handleEventDrop = (lesson: Lesson, timeslotUpdate: { dayOfWeek: string; startTime: string; endTime: string }) => {
        setLocalTimetable(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                lessons: prev.lessons.map(l =>
                    l.id === lesson.id
                        ? {
                            ...l,
                            timeslot: {
                                ...(l.timeslot ?? {}),
                                dayOfWeek: timeslotUpdate.dayOfWeek,
                                startTime: timeslotUpdate.startTime,
                                endTime: timeslotUpdate.endTime,
                            },
                        }
                        : l
                ),
            };
        });
        setHasLocalEdits(true);
    };

    if (!isAuthenticated) {
        return (
            <Login
                isOpen
                onClose={() => { }}
                onSuccess={handleLoginSuccess}
                closable={false}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold gradient-text">Schedulus</h1>
                                <p className="text-xs text-muted-foreground">Smart University Course Scheduling</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* Stats Section */}
                <StatsCards timetable={timetable ?? undefined} isLoading={isLoadingSchedule} />

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
                    {/* Calendar Section */}
                    <div className="space-y-4 min-w-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <h2 className="text-lg font-semibold">Weekly Schedule</h2>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground">Filter by group:</span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        className={`px-2 py-1 rounded-md border text-xs ${selectedGroup === 'ALL' ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setSelectedGroup('ALL')}
                                    >
                                        All
                                    </button>
                                    {lessonGroups.map(group => (
                                        <button
                                            key={group}
                                            className={`px-2 py-1 rounded-md border text-xs ${selectedGroup === group ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
                                            onClick={() => setSelectedGroup(group)}
                                        >
                                            {group}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                                {['ALL', ...lessonGroups].map(group => (
                                    <div key={group} className="flex items-center gap-1">
                                        <div className={`w-3 h-3 rounded ${getClassColorClass(group === 'ALL' ? 'ALL' : group)}`} />
                                        <span className="text-muted-foreground">{group === '' ? '' : ""}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ScheduleCalendar
                            timetable={(localTimetable ?? timetable) ? {
                                ...(localTimetable ?? timetable)!,
                                lessons: selectedGroup === 'ALL'
                                    ? (localTimetable ?? timetable)!.lessons
                                    : (localTimetable ?? timetable)!.lessons.filter(lesson => lesson.studentGroup === selectedGroup),
                            } : undefined}
                            isLoading={isLoadingSchedule}
                            onEventClick={handleEventClick}
                            onEventDrop={handleEventDrop}
                            allowDrag={selectedGroup !== 'ALL'}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 min-w-0 overflow-hidden">
                        <OptimizationPanel
                            job={job}
                            isStarting={isStarting}
                            onStartOptimization={() => startOptimization()}
                            onReset={reset}
                        />

                        {/* LessonList taşıyorsa dışarı taşmasını engelle */}
                        <div className="min-w-0 overflow-hidden">
                            <LessonList
                                lessons={lessons}
                                isLoading={isLoadingLessons}
                                onTogglePin={handleTogglePin}
                                onAddLesson={handleAddLesson}
                                onRemoveLesson={handleRemoveLesson}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Lesson Detail Modal */}
            {selectedLesson && (
                <div
                    className="w-full max-w-md m-4 overflow-hidden max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95"
                    onClick={e => e.stopPropagation()}
                >
                    <Card
                        className="w-full max-w-md m-4 animate-in fade-in zoom-in-95"
                        onClick={e => e.stopPropagation()}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{selectedLesson.subject}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedLesson(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-3">
                                    <div className="text-sm">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <User className="h-4 w-4 shrink-0" />
                                            <span className="shrink-0">Teacher:</span>
                                        </div>
                                        <div className="pl-7 font-medium whitespace-normal break-all">
                                            {selectedLesson.teacher}
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Users className="h-4 w-4 shrink-0" />
                                            <span className="shrink-0">Group:</span>
                                        </div>
                                        <div className="pl-7 font-medium whitespace-normal break-all">
                                            {selectedLesson.studentGroup}
                                        </div>
                                    </div>
                                </div>
                                {selectedLesson.room && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Room:</span>
                                        <span className="font-medium">{selectedLesson.room.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="font-medium">{selectedLesson.durationHours ?? 2} hours</span>
                                </div>
                                {selectedLesson.timeslot && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Time:</span>
                                        <span className="font-medium">
                                            {selectedLesson.timeslot.dayOfWeek} {selectedLesson.timeslot.startTime} - {selectedLesson.timeslot.endTime}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Badge
                                    variant={(selectedLesson.difficultyWeight ?? 0) >= 0.8 ? 'destructive' : (selectedLesson.difficultyWeight ?? 0) >= 0.6 ? 'warning' : 'success'}
                                >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {getDifficultyLabel(selectedLesson.difficultyWeight)} ({Math.round((selectedLesson.difficultyWeight ?? 0) * 100)}%)
                                </Badge>
                                <Badge variant="secondary">
                                    <Smile className="h-3 w-3 mr-1" />
                                    Satisfaction: {Math.round((selectedLesson.satisfactionScore ?? 0) * 100)}%
                                </Badge>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant={selectedLesson.pinned ? 'default' : 'outline'}
                                    className="flex-1"
                                    onClick={() => {
                                        handleTogglePin(selectedLesson.id);
                                        setSelectedLesson(prev => prev ? { ...prev, pinned: !prev.pinned } : null);
                                    }}
                                >
                                    <Pin className="h-4 w-4 mr-2" />
                                    {selectedLesson.pinned ? 'Pinned' : 'Pin Lesson'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default App;
