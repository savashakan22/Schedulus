"""
Orchestrator service - coordinates between ML Engine and Algorithm API.
"""

import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import get_settings

settings = get_settings()


class OrchestratorService:
    """Orchestrates the scheduling optimization workflow."""
    
    def __init__(self):
        self.ml_engine_url = settings.ml_engine_url
        self.algorithm_api_url = settings.algorithm_api_url
    
    async def get_ml_predictions(self, course_ids: List[str]) -> Dict[str, Dict]:
        """
        Fetch difficulty weights and satisfaction scores from ML Engine.
        
        Returns:
            Dictionary mapping course_id to prediction data
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.ml_engine_url}/predict",
                    json={"course_ids": course_ids}
                )
                response.raise_for_status()
                data = response.json()
                
                # Convert to dictionary for easy lookup
                return {
                    pred["course_id"]: {
                        "difficulty_weight": pred["difficulty_weight"],
                        "satisfaction_score": pred["satisfaction_score"],
                    }
                    for pred in data.get("predictions", [])
                }
            except httpx.HTTPError as e:
                print(f"ML Engine request failed: {e}")
                return {}
    
    async def solve_timetable(self, timetable_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send timetable to Algorithm API for solving.
        
        Args:
            timetable_data: Timetable with timeslots, rooms, and lessons
            
        Returns:
            Solved timetable with assignments and score
        """
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.algorithm_api_url}/timetable",
                    json=timetable_data
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                print(f"Algorithm API request failed: {e}")
                raise
    
    async def enrich_lessons_with_ml(
        self, 
        lessons: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Enrich lessons with ML predictions if not already provided.
        
        Args:
            lessons: List of lesson dictionaries
            
        Returns:
            Lessons enriched with difficulty_weight and satisfaction_score
        """
        # Find lessons that need ML predictions
        lessons_needing_predictions = [
            lesson for lesson in lessons
            if lesson.get("difficulty_weight") is None or 
               lesson.get("satisfaction_score") is None
        ]
        
        if not lessons_needing_predictions:
            return lessons
        
        # Get course IDs (use subject as course ID if no explicit ID)
        course_ids = [
            lesson.get("id", lesson.get("subject", "unknown"))
            for lesson in lessons_needing_predictions
        ]
        
        # Fetch predictions
        predictions = await self.get_ml_predictions(course_ids)
        
        # Enrich lessons
        enriched = []
        for lesson in lessons:
            lesson_id = lesson.get("id", lesson.get("subject", "unknown"))
            if lesson_id in predictions:
                if lesson.get("difficulty_weight") is None:
                    lesson["difficulty_weight"] = predictions[lesson_id]["difficulty_weight"]
                if lesson.get("satisfaction_score") is None:
                    lesson["satisfaction_score"] = predictions[lesson_id]["satisfaction_score"]
            enriched.append(lesson)
        
        return enriched
    
    async def run_optimization(
        self,
        timeslots: List[Dict[str, Any]],
        rooms: List[Dict[str, Any]],
        lessons: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Run the full optimization workflow.
        
        1. Enrich lessons with ML predictions
        2. Send to Algorithm API for solving
        3. Return solved timetable
        
        Args:
            timeslots: Available time slots
            rooms: Available rooms
            lessons: Lessons to schedule
            
        Returns:
            Solved timetable with score
        """
        # Step 1: Enrich with ML predictions
        enriched_lessons = await self.enrich_lessons_with_ml(lessons)

        # Step 1b: Split lessons into 2-3 hour sessions to fit constraints
        sessionized_lessons: List[Dict[str, Any]] = []
        for lesson in enriched_lessons:
            duration = max(2, int(lesson.get("duration_hours", lesson.get("durationHours", 2)) or 2))
            remaining = duration
            part_index = 1
            while remaining > 0:
                if remaining >= 5:
                    session_hours = 3
                elif remaining == 4:
                    session_hours = 2
                elif remaining == 3:
                    session_hours = 3
                else:
                    session_hours = 2
                session_lesson = {
                    **lesson,
                    "id": f"{lesson.get('id')}-p{part_index}",
                    "duration_hours": session_hours,
                    "durationHours": session_hours,
                }
                sessionized_lessons.append(session_lesson)
                remaining -= session_hours
                part_index += 1

        # Step 2: Prepare timetable for Algorithm API
        # Convert to format expected by Java API
        timetable_data = {
            "timeslots": [
                {
                    "dayOfWeek": ts.get("day_of_week", ts.get("dayOfWeek")),
                    "startTime": ts.get("start_time", ts.get("startTime")),
                    "endTime": ts.get("end_time", ts.get("endTime")),
                    "preferenceBonus": ts.get("preference_bonus", ts.get("preferenceBonus", 1.0)),
                }
                for ts in timeslots
            ],
            "rooms": [
                {
                    "name": room.get("name"),
                    "capacity": room.get("capacity", 30),
                }
                for room in rooms
            ],
            "lessons": [
                {
                    "id": lesson.get("id"),
                    "subject": lesson.get("subject"),
                    "teacher": lesson.get("teacher"),
                    "studentGroup": lesson.get("student_group", lesson.get("studentGroup")),
                    "durationHours": lesson.get("duration_hours", lesson.get("durationHours", 2)),
                    "difficultyWeight": lesson.get("difficulty_weight", lesson.get("difficultyWeight", 0.5)),
                    "satisfactionScore": lesson.get("satisfaction_score", lesson.get("satisfactionScore", 0.5)),
                    "pinned": lesson.get("pinned", False),
                }
                for lesson in sessionized_lessons
            ],
        }
        
        # Step 3: Solve
        result = await self.solve_timetable(timetable_data)
        
        return result


# Singleton instance
orchestrator = OrchestratorService()
