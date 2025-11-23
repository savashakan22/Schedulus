import React, { useState, useMemo } from "react";
import UploadField from "./components/UploadField";
import SummaryCard from "./components/SummaryCard";
import ClassTabBar from "./components/ClassTabBar";
import ClassCalendar from "./components/ClassCalendar";

const BACKEND_URL = "http://localhost:8080/api/generate-timetable";

function App() {
  const [files, setFiles] = useState({
    courses: null,
    rooms: null,
    teachers: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timetables, setTimetables] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const handleFileChange = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleGenerate = async () => {
    setError("");
    if (!files.courses || !files.rooms || !files.teachers) {
      setError("Lütfen tüm CSV dosyalarını yükle.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("coursesCsv", files.courses);
      formData.append("roomsCsv", files.rooms);
      formData.append("teachersCsv", files.teachers);

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTimetables(data.classes || []);
      if (data.classes?.length > 0) {
        setSelectedClassId(data.classes[0].id);
      }
    } catch (e) {
      setError("Sunucu hatası: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = useMemo(
    () => timetables.find((cls) => cls.id === selectedClassId),
    [timetables, selectedClassId]
  );

  return (
    <div className="min-h-screen px-6 py-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Otomatik Ders Programı</h1>

      {/* CSV Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <UploadField
            label="Dersler CSV"
            onFileSelect={(file) => handleFileChange("courses", file)}
            file={files.courses}
          />
          <UploadField
            label="Sınıflar CSV"
            onFileSelect={(file) => handleFileChange("rooms", file)}
            file={files.rooms}
          />
          <UploadField
            label="Hocalar CSV"
            onFileSelect={(file) => handleFileChange("teachers", file)}
            file={files.teachers}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-semibold text-sm"
          >
            {loading ? "Oluşturuluyor..." : "Programı Oluştur"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Dersler" ok={!!files.courses} />
          <SummaryCard label="Sınıflar" ok={!!files.rooms} />
          <SummaryCard label="Hocalar" ok={!!files.teachers} />
        </div>
      </div>

      {/* Tab bar */}
      <ClassTabBar
        timetables={timetables}
        selectedClassId={selectedClassId}
        onSelect={setSelectedClassId}
      />

      {/* Calendar */}
      {selectedClass && (
        <ClassCalendar timetable={selectedClass} />
      )}
    </div>
  );
}

export default App;
