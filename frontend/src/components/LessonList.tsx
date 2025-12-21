import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Lesson } from '../api/types';
import { getDifficultyLabel } from '../lib/utils';
import { Pin, PinOff, BookOpen, User, Users, AlertTriangle, Smile, Plus, Trash2, X, Upload } from 'lucide-react';
import { useImportLessons } from '../hooks/useSchedule';

interface LessonListProps {
    lessons: Lesson[] | undefined;
    isLoading: boolean;
    onTogglePin: (lessonId: string) => void;
    onAddLesson?: (lesson: Omit<Lesson, 'id'>) => void;
    onRemoveLesson?: (lessonId: string) => void;
}

export function LessonList({ lessons, isLoading, onTogglePin, onAddLesson, onRemoveLesson }: LessonListProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [newLesson, setNewLesson] = useState({
        subject: '',
        teacher: '',
        studentGroup: '',
        durationHours: 2,
        difficultyWeight: 0.5,
        satisfactionScore: 0.7,
    });
    const importLessons = useImportLessons();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onAddLesson && newLesson.subject && newLesson.teacher && newLesson.studentGroup) {
            onAddLesson({
                ...newLesson,
                pinned: false,
            });
            setNewLesson({
                subject: '',
                teacher: '',
                studentGroup: '',
                durationHours: 2,
                difficultyWeight: 0.5,
                satisfactionScore: 0.7,
            });
            setShowAddForm(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[600px] overflow-hidden flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Courses</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{lessons?.length ?? 0}</Badge>
                        {onAddLesson && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="h-7 px-2"
                            >
                                {showAddForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            </Button>
                        )}
                        <Button
                            variant={showImport ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => setShowImport(!showImport)}
                            className="h-7 px-2"
                        >
                            <Upload className="h-3 w-3 mr-1" /> XLSX
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {/* XLSX Import Accordion */}
                {showImport && (
                    <div className="mb-4 rounded-lg border border-dashed border-border p-3 space-y-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground">Upload an XLSX file with columns: id (optional), subject, teacher, student_group, duration_hours, difficulty_weight, satisfaction_score.</p>
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    importLessons.mutate(file);
                                    e.target.value = '';
                                }
                            }}
                            className="w-full text-sm"
                        />
                        {importLessons.isPending && <p className="text-xs text-muted-foreground">Importing...</p>}
                        {importLessons.error && <p className="text-xs text-destructive">Failed to import. Please check the file.</p>}
                    </div>
                )}
                {/* Add Course Form */}
                {showAddForm && (
                    <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-lg border border-primary/50 bg-primary/5 space-y-3">
                        <div>
                            <input
                                type="text"
                                placeholder="Course Name"
                                value={newLesson.subject}
                                onChange={e => setNewLesson({ ...newLesson, subject: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Teacher"
                                value={newLesson.teacher}
                                onChange={e => setNewLesson({ ...newLesson, teacher: e.target.value })}
                                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div className='flex gap-2'>
                            <input
                                type="text"
                                placeholder="Group"
                                value={newLesson.studentGroup}
                                onChange={e => setNewLesson({ ...newLesson, studentGroup: e.target.value })}
                                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <div className="flex gap-2 items-center text-xs text-muted-foreground">
                            <label className="flex-1">
                                Duration (hours):
                                <input
                                    type="number"
                                    min={2}
                                    max={10}
                                    value={newLesson.durationHours}
                                    onChange={e => setNewLesson({ ...newLesson, durationHours: Math.max(2, Math.min(10, Number(e.target.value))) })}
                                    className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </label>
                            <span className="w-20 text-right">2-3 per slot</span>
                        </div>
                        <div className="flex gap-2 items-center text-xs text-muted-foreground">
                            <label className="flex-1">
                                Difficulty:
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={newLesson.difficultyWeight}
                                    onChange={e => setNewLesson({ ...newLesson, difficultyWeight: parseFloat(e.target.value) })}
                                    className="w-full"
                                />
                            </label>
                            <span className="w-12 text-center">{Math.round(newLesson.difficultyWeight * 100)}%</span>
                        </div>
                        <Button type="submit" size="sm" className="w-full">
                            <Plus className="h-3 w-3 mr-1" /> Add Course
                        </Button>
                    </form>
                )}

                <div className="space-y-2">
                    {lessons?.map(lesson => (
                        <div
                            key={lesson.id}
                            className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium truncate">{lesson.subject}</span>
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {lesson.teacher}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {lesson.studentGroup}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge
                                            variant={(lesson.difficultyWeight ?? 0) >= 0.8 ? 'destructive' : (lesson.difficultyWeight ?? 0) >= 0.6 ? 'warning' : 'success'}
                                            className="text-xs"
                                        >
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {getDifficultyLabel(lesson.difficultyWeight)}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {lesson.durationHours ?? 2}h
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            <Smile className="h-3 w-3 mr-1" />
                                            {Math.round((lesson.satisfactionScore ?? 0) * 100)}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => onTogglePin(lesson.id)}
                                        className={`p-2 rounded-md transition-colors ${lesson.pinned
                                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                            : 'hover:bg-muted text-muted-foreground'
                                            }`}
                                        title={lesson.pinned ? 'Unpin lesson' : 'Pin lesson'}
                                    >
                                        {lesson.pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                                    </button>
                                    {onRemoveLesson && (
                                        <button
                                            onClick={() => onRemoveLesson(lesson.id)}
                                            className="p-2 rounded-md text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove course"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
