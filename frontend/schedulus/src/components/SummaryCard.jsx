export default function SummaryCard({ label, ok }) {
  return (
    <div className="border border-slate-700 p-4 rounded-xl">
      <div className="flex justify-between items-center">
        <p className="text-sm">{label}</p>
        <p className={ok ? "text-emerald-400" : "text-slate-500"}>
          {ok ? "Yüklendi" : "Bekliyor..."}
        </p>
      </div>
    </div>
  );
}

