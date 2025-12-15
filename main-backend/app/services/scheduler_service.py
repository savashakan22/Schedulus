import httpx
import json

class SchedulerService:
    def __init__(self):
        # Configuration for service URLs
        self.ml_engine_url = "http://localhost:8001" # Mock URL
        self.algorithm_api_url = "http://localhost:8080" # Mock URL

    async def generate_schedule(self):
        # 1. Fetch Courses/Rooms from DB (Mocking this)
        courses = [
            {"id": "C1", "name": "Math", "teacher": "T1", "group": "G1"},
            {"id": "C2", "name": "Physics", "teacher": "T2", "group": "G1"},
            {"id": "C3", "name": "Chemistry", "teacher": "T3", "group": "G2"}
        ]
        rooms = [
            {"name": "Room A", "capacity": 50},
            {"name": "Room B", "capacity": 30}
        ]
        # Timeslots mock
        timeslots = ["Monday-08:00", "Monday-10:00", "Friday-16:00"]

        # 2. Call ml-engine to get Weights and Scores
        # Note: In a real app, we would use httpx.AsyncClient() to call the actual service.
        # For this exercise, I will assume the services are running or mock the response if I can't reach them.

        # Mocking the call to ML Engine
        # response = await client.post(f"{self.ml_engine_url}/predict/course-weights", json=[c["id"] for c in courses])
        # course_weights = response.json()

        # Simulating response from ML Engine
        course_weights = {
            "C1": 80,
            "C2": 60,
            "C3": 90
        }

        # response = await client.post(f"{self.ml_engine_url}/predict/timeslot-scores", json=timeslots)
        # timeslot_scores = response.json()

        timeslot_scores = {
            "Monday-08:00": 10,
            "Monday-10:00": 100,
            "Friday-16:00": -20
        }

        # 3. Inject these scores into the Java DTOs (Planning Problem)
        # We need to construct the JSON payload that the Java Solver expects.
        # This structure depends on what TimetableController expects (usually a Timetable object)

        problem_payload = {
            "timeslotList": [],
            "roomList": [],
            "lessonList": []
        }

        for ts_str in timeslots:
            day, time = ts_str.split("-")
            problem_payload["timeslotList"].append({
                "dayOfWeek": day.upper(),
                "startTime": time + ":00",
                "endTime": f"{int(time[:2])+1}:00:00", # 1 hour duration
                "satisfactionScore": timeslot_scores.get(ts_str, 0)
            })

        for room in rooms:
            problem_payload["roomList"].append({
                "name": room["name"],
                "capacity": room["capacity"]
            })

        for course in courses:
            problem_payload["lessonList"].append({
                "id": course["id"],
                "subject": course["name"],
                "teacher": course["teacher"],
                "studentGroup": course["group"],
                "difficultyWeight": course_weights.get(course["id"], 50)
            })

        # 4. Call algorithm-api-java with the enriched data
        # response = await client.post(f"{self.algorithm_api_url}/solve", json=problem_payload)
        # solved_timetable = response.json()

        print("Payload sent to Java Solver:", json.dumps(problem_payload, indent=2))

        # Mocking Solver Response
        solved_timetable = {
            "status": "SOLVED",
            "score": "0hard/100soft",
            "lessonList": problem_payload["lessonList"] # In real life, these would have timeslot/room assigned
        }

        # Assign mock results
        solved_timetable["lessonList"][0]["timeslot"] = problem_payload["timeslotList"][0]
        solved_timetable["lessonList"][0]["room"] = problem_payload["roomList"][0]

        # 5. Save the optimized result
        # await db.save(solved_timetable)

        return solved_timetable
