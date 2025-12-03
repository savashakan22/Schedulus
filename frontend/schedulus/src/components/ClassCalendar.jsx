import { useMemo } from "react";

export default function ClassCalendar({ timetable }) {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const dayLabels = {
    MONDAY: "Pazartesi",
    TUESDAY: "Salı",
    WEDNESDAY: "Çarşamba",
    THURSDAY: "Perşembe",
    FRIDAY: "Cuma",
  };

  const START_HOUR = 8;
  const END_HOUR = 18;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const HOUR_HEIGHT = 48;

  const parseTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  const slotsByDay = useMemo(() => {
    const map = {};
    days.forEach((d) => (map[d] = []));

    (timetable.schedule || []).forEach((slot) => {
      const d = slot.day.toUpperCase();
      map[d].push(slot);
    });

    Object.keys(map).forEach((d) => {
      map[d].sort((a, b) => a.start.localeCompare(b.start));
    });

    return map;
  }, [timetable]);

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="grid md:grid-cols-5 gap-4 mt-4 text-xs md:text-sm">
      {days.map((dayKey) => (
        <div
          key={dayKey}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3 pb-8"
        >
          <p className="text-slate-100 font-semibold mb-[15px]">
            {dayLabels[dayKey]}
          </p>

          <div
            className="relative"
            style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
          >
            {/* Saat çizgileri */}
            {hours.map((h, idx) => {
              const isInsideLesson = (slotsByDay[dayKey] || []).some((slot) => {
                const start = parseTime(slot.start);
                const end = parseTime(slot.end);
                return h > start && h < end; // start ve end hariç
              });
            
              return (
                <div
                  key={h}
                  className="absolute left-0 right-0 flex items-start z-0"
                  style={{ top: idx * HOUR_HEIGHT }}
                >
                  {/* Saat etiketi her zaman görünsün */}
                  <div className="w-10 text-[10px] text-slate-500">
                    {String(h).padStart(2, "0")}:00
                  </div>
              
                  {/* Sadece çizgi, dersin ortasına denk gelmiyorsa çizilsin */}
                  <div className="flex-1">
                    {!isInsideLesson && (
                      <div className="flex-1 border-t border-slate-600/70 translate-y-[10px]" />
                    )}
                  </div>
                </div>
              );
            })}


            {/* Ders blokları */}
            {slotsByDay[dayKey].map((slot, i) => {
              const start = parseTime(slot.start);
              const end = parseTime(slot.end);

              const top = (start - START_HOUR) * HOUR_HEIGHT;
              const height = Math.max(
                (end - start) * HOUR_HEIGHT - 4,
                18
              );

              return (
                <div
                  key={i}
                  className={`absolute left-10 right-1 border rounded-lg px-2 py-1 shadow z-20 translate-y-[11px] ${
                    slot.isLab
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-indigo-500/40 bg-indigo-500/10"
                  }`}
                  style={{
                    top,
                    height,
                  }}
                >
                  <p className="font-semibold text-[11px] md:text-xs truncate">
                    {slot.courseCode} – {slot.courseName}
                  </p>
                  <p className="text-[10px] text-slate-300">
                    {slot.start}–{slot.end}
                  </p>
                  <p className="text-[10px]">{slot.room}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {slot.instructor}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
