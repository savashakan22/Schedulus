export default function UploadField({ label, onFileSelect, file }) {
  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>

      <label className="block w-full border border-slate-700 p-3 rounded-lg cursor-pointer hover:bg-slate-800">
        <span className="text-sm text-slate-300">
          {file ? file.name : "CSV dosyası seç"}
        </span>
        <input type="file" accept=".csv" className="hidden" onChange={handleChange} />
      </label>
    </div>
  );
}
