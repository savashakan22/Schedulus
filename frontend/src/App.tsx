import { useState } from 'react';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { OptimizationPanel } from './components/OptimizationPanel';
import { LessonList } from './components/LessonList';
import { StatsCards } from './components/StatsCards';
import { useSchedule, useLessons, useOptimizationWorkflow, useToggleLessonPin, useAddLesson, useRemoveLesson, Lesson } from './hooks/useSchedule';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Calendar, Sparkles, GraduationCap, X, Pin, User, Users, MapPin, AlertTriangle, Smile } from 'lucide-react';
import { getDifficultyLabel } from './lib/utils';

function App() {
    const { data: timetable, isLoading: isLoadingSchedule } = useSchedule();
    const { data: lessons, isLoading: isLoadingLessons } = useLessons();
    const { startOptimization, job, isStarting, reset } = useOptimizationWorkflow();
    const togglePin = useToggleLessonPin();
    const addLesson = useAddLesson();
    const removeLesson = useRemoveLesson();

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

    const handleEventClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    };

    const handleTogglePin = (lessonId: string) => {
        togglePin.mutate(lessonId);
        // Update selected lesson if it's the one being toggled
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
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-violet-400" />
                                AI-Powered
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* Stats Section */}
                <StatsCards timetable={timetable ?? undefined} isLoading={isLoadingSchedule} />

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    {/* Calendar Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <h2 className="text-lg font-semibold">Weekly Schedule</h2>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-500 to-teal-500" />
                                    <span className="text-muted-foreground">Easy</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-gradient-to-r from-amber-500 to-orange-500" />
                                    <span className="text-muted-foreground">Medium</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-gradient-to-r from-rose-500 to-pink-500" />
                                    <span className="text-muted-foreground">Hard</span>
                                </div>
                            </div>
                        </div>
                        <ScheduleCalendar
                            timetable={timetable ?? undefined}
                            isLoading={isLoadingSchedule}
                            onEventClick={handleEventClick}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <OptimizationPanel
                            job={job}
                            isStarting={isStarting}
                            onStartOptimization={startOptimization}
                            onReset={reset}
                        />
                        <LessonList
                            lessons={lessons}
                            isLoading={isLoadingLessons}
                            onTogglePin={handleTogglePin}
                            onAddLesson={handleAddLesson}
                            onRemoveLesson={handleRemoveLesson}
                        />
                    </div>
                </div>
            </main>

            {/* Lesson Detail Modal */}
            {selectedLesson && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setSelectedLesson(null)}
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
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Teacher:</span>
                                    <span className="font-medium">{selectedLesson.teacher}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Group:</span>
                                    <span className="font-medium">{selectedLesson.studentGroup}</span>
                                </div>
                                {selectedLesson.room && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Room:</span>
                                        <span className="font-medium">{selectedLesson.room.name}</span>
                                    </div>
                                )}
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
