"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class DayOfWeek(str, Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"


# ========== Request Schemas ==========

class TimeslotCreate(BaseModel):
    day_of_week: DayOfWeek
    start_time: str  # "HH:MM" format
    end_time: str
    preference_bonus: Optional[float] = None


class RoomCreate(BaseModel):
    name: str
    capacity: int = 30


class LessonCreate(BaseModel):
    id: str
    subject: str
    teacher: str
    student_group: str
    difficulty_weight: Optional[float] = None
    satisfaction_score: Optional[float] = None
    pinned: bool = False
    pinned_timeslot_index: Optional[int] = None
    pinned_room_index: Optional[int] = None


class OptimizationRequest(BaseModel):
    """Request to start schedule optimization."""
    timeslots: List[TimeslotCreate]
    rooms: List[RoomCreate]
    lessons: List[LessonCreate]
    solver_time_limit_seconds: int = 30


# ========== Response Schemas ==========

class TimeslotResponse(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    preference_bonus: Optional[float] = None


class RoomResponse(BaseModel):
    name: str
    capacity: Optional[int] = None


class LessonResponse(BaseModel):
    id: str
    subject: str
    teacher: str
    student_group: str
    difficulty_weight: Optional[float] = None
    satisfaction_score: Optional[float] = None
    pinned: bool = False
    timeslot: Optional[TimeslotResponse] = None
    room: Optional[RoomResponse] = None


class ScoreResponse(BaseModel):
    hard_score: int
    soft_score: int


class TimetableResponse(BaseModel):
    timeslots: List[TimeslotResponse]
    rooms: List[RoomResponse]
    lessons: List[LessonResponse]
    score: Optional[ScoreResponse] = None


class JobStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class OptimizationJobResponse(BaseModel):
    id: str
    status: JobStatus
    progress: int = 0
    started_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[TimetableResponse] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict
