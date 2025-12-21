from pydantic import BaseModel
from typing import List, Optional


class PredictionRequest(BaseModel):
    """Request body for course prediction endpoint."""
    course_ids: List[str]


class CoursePrediction(BaseModel):
    """Prediction result for a single course."""
    course_id: str
    difficulty_weight: float  # 0.0 - 1.0, higher = more difficult
    satisfaction_score: float  # 0.0 - 1.0, higher = more satisfying
    confidence: float  # Prediction confidence
    factors: Optional[dict] = None  # Explanation of prediction factors


class PredictionResponse(BaseModel):
    """Response body for course prediction endpoint."""
    predictions: List[CoursePrediction]
    model_version: str = "1.0.0"


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    model_loaded: bool
