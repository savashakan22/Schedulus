import { useId } from "react";

export default function UploadField({ label, file, onFileSelect }) {
  const inputId = useId();

  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-300">{label}</p>

      {/* Görünen kısım (tamamı tıklanabilir) */}
      <label
        htmlFor={inputId}
        className="flex items-center justify-between w-full cursor-pointer
                   bg-slate-900 border border-slate-700 rounded-lg
                   px-3 py-2 text-sm text-slate-200
                   hover:border-indigo-500/70 hover:bg-slate-900/70 transition"
      >
        <span className={`truncate ${file ? "text-slate-100" : "text-slate-500"}`}>
          {file ? file.name : "Bir CSV dosyası seçin..."}
        </span>

        {file && (
          <span className="ml-3 text-emerald-400 text-lg font-semibold">
            ✓
          </span>
        )}
      </label>

      {/* Gizli gerçek input */}
      <input
        id={inputId}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
      />
    </div>
  );
}
