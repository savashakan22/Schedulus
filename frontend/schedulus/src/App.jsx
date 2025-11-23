import React, { useState, useMemo } from "react";
import UploadField from "./components/UploadField";
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
      setError("Lütfen tüm CSV dosyalarını yükleyiniz.");
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

  const MOCK_TIMETABLE_RESPONSE = {
    classes: [
      {
        id: "CENG1",
        name: "Bilgisayar Mühendisliği 1. Sınıf",
        schedule: [
          {
            courseCode: "CSE101",
            courseName: "Programlamaya Giriş",
            day: "MONDAY",
            start: "9:00",
            end: "11:00",
            room: "D101",
            instructor: "Dr. Ahmet Yılmaz",
            isLab: false,
          },
          {
            courseCode: "CSE102",
            courseName: "Programlamaya Devam Ediş",
            day: "MONDAY",
            start: "11:00",
            end: "13:00",
            room: "D121",
            instructor: "Dr. Ahmet Durmaz",
            isLab: false,
          },
          {
            courseCode: "CSE103",
            courseName: "Programlamayı Bitiriş",
            day: "MONDAY",
            start: "14:00",
            end: "17:00",
            room: "D103",
            instructor: "Dr. Ahmet Aymaz",
            isLab: false,
          },
          {
            courseCode: "CSE101L",
            courseName: "Programlamaya Giriş Lab-1",
            day: "WEDNESDAY",
            start: "10:00",
            end: "12:00",
            room: "L201",
            instructor: "Arş. Gör. Mehmet Koç",
            isLab: true,
          },
          {
            courseCode: "CSE101L",
            courseName: "Programlamaya Giriş Lab-2",
            day: "WEDNESDAY",
            start: "13:00",
            end: "15:00",
            room: "L201",
            instructor: "Arş. Gör. Mehmet Koç",
            isLab: true,
          },
          {
            courseCode: "CSE102",
            courseName: "Lineer Cebir",
            day: "FRIDAY",
            start: "09:00",
            end: "11:00",
            room: "D102",
            instructor: "Dr. Ayşe Demir",
            isLab: false,
          },
        ],
      },
      {
        id: "CENG2",
        name: "Bilgisayar Mühendisliği 2. Sınıf",
        schedule: [
          {
            courseCode: "CSE201",
            courseName: "Veri Yapıları",
            day: "TUESDAY",
            start: "09:00",
            end: "12:00",
            room: "D101",
            instructor: "Dr. Ahmet Yılmaz",
            isLab: false,
          },
          {
            courseCode: "CSE201L",
            courseName: "Veri Yapıları Lab",
            day: "THURSDAY",
            start: "13:00",
            end: "15:00",
            room: "L202",
            instructor: "Arş. Gör. Mehmet Koç",
            isLab: true,
          },
          {
            courseCode: "CSE202",
            courseName: "Ayrık Matematik",
            day: "MONDAY",
            start: "13:00",
            end: "15:00",
            room: "D102",
            instructor: "Dr. Ayşe Demir",
            isLab: false,
          },
        ],
      },
    ],
  };

  const handleGenerateMock = () => {
    if (!files.courses || !files.rooms || !files.teachers) {
      setError("Lütfen tüm CSV dosyalarını yükleyiniz.");
      return;
    }
    setError(null);
    const data = MOCK_TIMETABLE_RESPONSE;
    setTimetables(data.classes || []);
    if (data.classes && data.classes.length > 0) {
      setSelectedClassId(data.classes[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="w-full bg-slate-900/70 backdrop-blur border-b border-slate-800 py-4 mb-10 sticky top-0 z-50">
  <div className="px-36 flex justify-start">
    <a href="/" className="text-2xl font-bold tracking-wide text-indigo-300 hover:text-indigo-400 transition">
      Schedulus
    </a>
  </div>
</header>



      {/* CONTENT */}
      <div className="px-6 max-w-6xl mx-auto">

        {/* CSV Upload */}
        <div className="mb-6 max-w-full space-y-4">
          <UploadField
            label="Dersler (CSV)"
            onFileSelect={(file) => handleFileChange("courses", file)}
            file={files.courses}
          />
          <UploadField
            label="Sınıflar (CSV)"
            onFileSelect={(file) => handleFileChange("rooms", file)}
            file={files.rooms}
          />
          <UploadField
            label="Akademisyenler (CSV)"
            onFileSelect={(file) => handleFileChange("teachers", file)}
            file={files.teachers}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-center md:justify-center">
            <button
              onClick={handleGenerateMock}
              disabled={loading}
              className="w-full md:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-semibold text-sm disabled:opacity-60"
            >
              {loading ? "Oluşturuluyor..." : "Programı Oluştur"}
            </button>
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
          <div className="mb-20">
            <ClassCalendar timetable={selectedClass} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
