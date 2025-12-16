import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Lesson } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface ScheduleCalendarProps {
  events: Lesson[];
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<'all' | 'professor' | 'room'>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  // Extract unique values for filters
  const professors = useMemo(() => Array.from(new Set(events.map(e => e.professor))).sort(), [events]);
  const rooms = useMemo(() => Array.from(new Set(events.map(e => e.room))).sort(), [events]);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all' || !filterValue) return events;
    return events.filter(event => {
      if (filterType === 'professor') return event.professor === filterValue;
      if (filterType === 'room') return event.room === filterValue;
      return true;
    });
  }, [events, filterType, filterValue]);

  // Transform API data to FullCalendar event format
  const calendarEvents = filteredEvents.map(lesson => {
    let backgroundColor = '#3b82f6'; // Default Blue (Lecture)
    let borderColor = '#2563eb';

    if (lesson.type === 'Lab') {
      backgroundColor = '#ef4444'; // Red (Lab)
      borderColor = '#dc2626';
    }

    // High ML Score override (Green)
    if (lesson.mlScore && lesson.mlScore > 80) { // Assuming scale 0-100 or user logic
       backgroundColor = '#22c55e';
       borderColor = '#16a34a';
    }

    return {
      id: lesson.id,
      title: `${lesson.title} (${lesson.room})`,
      start: lesson.startTime,
      end: lesson.endTime,
      backgroundColor,
      borderColor,
      extendedProps: {
        professor: lesson.professor,
        room: lesson.room,
        type: lesson.type,
        mlScore: lesson.mlScore
      }
    };
  });

  const renderEventContent = (eventInfo: any) => {
    const { mlScore, professor } = eventInfo.event.extendedProps;
    return (
      <div className="overflow-hidden p-0.5 text-xs h-full flex flex-col justify-start" title={`Score: ${mlScore} - ${professor}`}>
        <div className="font-semibold truncate">{eventInfo.event.title}</div>
        <div className="text-[10px] opacity-90">{professor}</div>
        {mlScore !== undefined && (
          <div className="mt-auto self-end bg-white/20 px-1 rounded text-[9px]">
            {mlScore}%
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-[800px] w-full flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
           <CardTitle>Generated Schedule</CardTitle>
           <div className="flex gap-2">
             <select
               className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
               value={filterType}
               onChange={(e) => {
                 setFilterType(e.target.value as any);
                 setFilterValue('');
               }}
             >
               <option value="all">All Events</option>
               <option value="professor">By Professor</option>
               <option value="room">By Room</option>
             </select>

             {filterType !== 'all' && (
               <select
                 className="h-9 w-[200px] rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                 value={filterValue}
                 onChange={(e) => setFilterValue(e.target.value)}
               >
                 <option value="">Select {filterType === 'professor' ? 'Professor' : 'Room'}...</option>
                 {filterType === 'professor' && professors.map(p => (
                   <option key={p} value={p}>{p}</option>
                 ))}
                 {filterType === 'room' && rooms.map(r => (
                   <option key={r} value={r}>{r}</option>
                 ))}
               </select>
             )}
           </div>
       </CardHeader>
       <CardContent className="flex-1 p-0">
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventContent={renderEventContent}
            height="100%"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
          />
       </CardContent>
    </Card>
  );
};
