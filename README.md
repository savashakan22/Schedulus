# Schedulus 

**Smart University Course Scheduling System**

An intelligent scheduling system designed to optimize classroom and course assignments for universities. The system utilizes a weighted scoring algorithm that accounts for hard constraints (such as course conflicts and room capacity) and soft constraints (morning/evening time preferences and student satisfaction factors).

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Frontend   │────▶│   Main Backend   │────▶│  Algorithm    │
│  React/Vite  │     │   FastAPI        │     │  Spring Boot  │
│  :3000       │     │   :8080          │     │  Timefold     │
└──────────────┘     └────────┬─────────┘     │  :8081        │
                              │               └───────────────┘
                              ▼
                     ┌──────────────────┐
                     │    ML Engine     │
                     │    FastAPI       │
                     │    :8082         │
                     └──────────────────┘
```

## 📁 Project Structure

```
Schedulus/
├── frontend/           # React + Vite + TypeScript + Tailwind
├── main-backend/       # Python FastAPI - Orchestrator
├── ml-engine/          # Python FastAPI - ML Predictions
├── algorithm/          # Java Spring Boot + Timefold Solver
└── docker-compose.yml  # Container orchestration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Java 21+
- Docker & Docker Compose (optional)

### Running Locally

**1. Frontend (React)**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

**2. ML Engine (Python)**
```bash
cd ml-engine
pip install -r requirements.txt
uvicorn main:app --port 8082
# Runs on http://localhost:8082
```

**3. Main Backend (Python)**
```bash
cd main-backend
pip install -r requirements.txt
uvicorn main:app --port 8080
# Runs on http://localhost:8080
```

**4. Algorithm API (Java)**
```bash
cd algorithm
./mvnw spring-boot:run
# Runs on http://localhost:8081
```

### Using Docker Compose
```bash
docker-compose up --build
```

## 🔌 API Endpoints

### Main Backend (:8080)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/schedules/optimize` | Start optimization job |
| GET | `/api/schedules/jobs/{id}` | Get job status |
| GET | `/api/schedules/latest` | Get latest schedule |

### ML Engine (:8082)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Get difficulty & satisfaction predictions |
| GET | `/model-info` | Get ML model information |

### Algorithm API (:8081)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/timetable` | Solve timetable optimization |

## ⚙️ Constraints

### Hard Constraints (Must be satisfied)
- **Room Conflict**: No two lessons in same room at same time
- **Teacher Conflict**: No teacher teaching two lessons simultaneously
- **Student Group Conflict**: No student group in two lessons simultaneously
- **Pinned Lessons**: Respect user-pinned timeslot/room assignments

### Soft Constraints (Optimization goals)
- **Morning Preference**: Schedule difficult courses in morning slots
- **Satisfaction Maximization**: Prioritize high-satisfaction courses
- **Teacher Breaks**: Avoid consecutive lessons for teachers
- **Timeslot Preference**: Prefer popular time slots

## 🧠 ML Features

The ML Engine provides predictions based on mock historical data:
- **Difficulty Weight** (0.0-1.0): How challenging a course is
- **Satisfaction Score** (0.0-1.0): Student satisfaction level

## 📄 License

MIT License
