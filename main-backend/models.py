"""
SQLAlchemy ORM Models

Database models for job tracking and schedule storage.
"""

from sqlalchemy import Column, String, Integer, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from datetime import datetime
import uuid
import enum

from database import Base


class JobStatusEnum(str, enum.Enum):
    """Job status enumeration."""
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class OptimizationJob(Base):
    """
    Optimization job tracking table.
    
    Stores the status and results of optimization jobs.
    """
    __tablename__ = "optimization_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(
        SQLEnum(JobStatusEnum, name="job_status_enum"),
        nullable=False,
        default=JobStatusEnum.PENDING
    )
    progress = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    result = Column(JSONB, nullable=True)  # Stores the full timetable result
    error = Column(Text, nullable=True)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary for API response."""
        return {
            "id": str(self.id),
            "status": self.status.value if self.status else None,
            "progress": self.progress,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "result": self.result,
            "error": self.error,
        }
