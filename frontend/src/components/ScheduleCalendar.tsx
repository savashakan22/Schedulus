import { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventContentArg } from '@fullcalendar/core';
import { Timetable, Lesson } from '../api/types';
import { getDayNumber, getDifficultyClass } from '../lib/utils';
import { Pin } from 'lucide-react';

interface ScheduleCalendarProps {
    timetable: Timetable | undefined;
    isLoading: boolean;
    onEventClick?: (lesson: Lesson) => void;
}

export function ScheduleCalendar({ timetable, isLoading, onEventClick }: ScheduleCalendarProps) {
    // Convert lessons to FullCalendar events
    const events = useMemo(() => {
        if (!timetable?.lessons) return [];

        // Get the current week's Monday
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);

        return timetable.lessons
            .filter(lesson => lesson.timeslot && lesson.room)
            .map(lesson => {
                const dayOffset = getDayNumber(lesson.timeslot!.dayOfWeek) - 1;
                const eventDate = new Date(monday);
                eventDate.setDate(monday.getDate() + dayOffset);

                const [startHour, startMin] = lesson.timeslot!.startTime.split(':').map(Number);
                const [endHour, endMin] = lesson.timeslot!.endTime.split(':').map(Number);

                const start = new Date(eventDate);
                start.setHours(startHour, startMin, 0);

                const end = new Date(eventDate);
                end.setHours(endHour, endMin, 0);

                return {
                    id: lesson.id,
                    title: lesson.subject,
                    start,
                    end,
                    extendedProps: {
                        lesson,
                        teacher: lesson.teacher,
                        room: lesson.room!.name,
                        studentGroup: lesson.studentGroup,
                        durationHours: lesson.durationHours,
                        difficultyWeight: lesson.difficultyWeight,
                        satisfactionScore: lesson.satisfactionScore,
                        pinned: lesson.pinned,
                    },
                    classNames: [
                        getDifficultyClass(lesson.difficultyWeight),
                        lesson.pinned ? 'pinned' : '',
                    ],
                };
            });
    }, [timetable]);

    // Custom event content renderer
    const renderEventContent = (eventInfo: EventContentArg) => {
        const { teacher, room, pinned } = eventInfo.event.extendedProps;

        return (
            <div className="p-1 text-xs overflow-hidden h-full">
                <div className="flex items-center gap-1 font-semibold truncate">
                    {pinned && <Pin className="h-3 w-3 text-yellow-300 flex-shrink-0" />}
                    <span className="truncate">{eventInfo.event.title}</span>
                </div>
                <div className="text-white/80 truncate">{teacher}</div>
                {eventInfo.event.extendedProps.durationHours && (
                    <div className="text-white/70 truncate">{eventInfo.event.extendedProps.durationHours}h</div>
                )}
                <div className="text-white/70 truncate">{room}</div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="h-[600px] rounded-lg border border-border bg-card flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Loading schedule...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="schedule-calendar">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={events}
                eventContent={renderEventContent}
                eventClick={(info) => {
                    const lesson = info.event.extendedProps.lesson as Lesson;
                    onEventClick?.(lesson);
                }}
                slotMinTime="08:00:00"
                slotMaxTime="18:00:00"
                allDaySlot={false}
                weekends={false}
                height={600}
                slotDuration="00:30:00"
                eventMinHeight={60}
                nowIndicator={true}
                dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
            />
        </div>
    );
}
