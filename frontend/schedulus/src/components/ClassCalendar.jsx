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

  const slotsByDay = useMemo(() => {
    const map = {};
    days.forEach((d) => (map[d] = []));
    (timetable.schedule || []).forEach((slot) => {
      const d = slot.day.toUpperCase();
      if (!map[d]) map[d] = [];
      map[d].push(slot);
    });
    Object.keys(map).forEach((d) => {
      map[d].sort((a, b) => a.start.localeCompare(b.start));
    });
    return map;
  }, [timetable]);

  return (
    <div className="grid md:grid-cols-5 gap-4 mt-4 text-sm">
      {days.map((dayKey) => (
        <div
          key={dayKey}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3"
        >
          <p className="text-slate-300 font-semibold mb-2">
            {dayLabels[dayKey]}
          </p>

          {slotsByDay[dayKey].map((slot, i) => (
            <div
              key={i}
              className={`border rounded-lg p-2 mb-2 ${
                slot.isLab
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-indigo-500/40 bg-indigo-500/10"
              }`}
            >
              <p className="font-semibold">
                {slot.courseCode} – {slot.courseName}
              </p>
              <p className="text-xs text-slate-200">
                {slot.start}–{slot.end}
              </p>
              <p className="text-xs">{slot.room}</p>
              <p className="text-[11px] text-slate-300">{slot.instructor}</p>
            </div>
          ))}

          {slotsByDay[dayKey].length === 0 && (
            <p className="text-xs text-slate-500">Ders yok.</p>
          )}
        </div>
      ))}
    </div>
  );
}
