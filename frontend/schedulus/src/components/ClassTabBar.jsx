export default function ClassTabBar({
  timetables,
  selectedClassId,
  onSelect,
}) {
  if (timetables.length === 0)
    return (
      <p className="text-slate-500 text-sm mb-3">
        Program oluşturduğunda sınıf tab’ları burada görünecek.
      </p>
    );

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
      {timetables.map((cls) => {
        const active = cls.id === selectedClassId;
        return (
          <button
            key={cls.id}
            onClick={() => onSelect(cls.id)}
            className={`px-3 py-1.5 rounded-full text-sm border overflow-y-auto ${
              active
                ? "bg-indigo-600 border-indigo-400 text-white"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {cls.name || cls.id}
          </button>
        );
      })}
    </div>
  );
}
