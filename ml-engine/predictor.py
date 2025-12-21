"""
Mock ML Predictor for course difficulty and satisfaction scoring.
In production, this would use trained models on historical data.
"""

from typing import Dict, List, Tuple
import random
import hashlib


# Mock historical data for courses
# In production, this would come from a trained model
MOCK_COURSE_DATA: Dict[str, Tuple[float, float]] = {
    # (difficulty_weight, satisfaction_score)
    "CS101": (0.45, 0.88),  # Intro Programming - easy, high satisfaction
    "CS201": (0.65, 0.82),  # Data Structures - moderate
    "CS301": (0.78, 0.75),  # Algorithms - hard
    "CS401": (0.85, 0.70),  # Operating Systems - hard
    "CS402": (0.72, 0.85),  # Database Systems - moderate-hard, satisfying
    "CS403": (0.68, 0.80),  # Computer Networks
    "CS450": (0.90, 0.92),  # Machine Learning - very hard but very satisfying
    "CS451": (0.88, 0.90),  # AI - very hard but satisfying
    "CS460": (0.55, 0.90),  # Web Development - easier, very satisfying
    "MATH101": (0.50, 0.65),  # Calculus I
    "MATH201": (0.70, 0.60),  # Calculus II - harder
    "MATH301": (0.82, 0.55),  # Linear Algebra
    "MATH401": (0.75, 0.70),  # Statistics
    "PHY101": (0.60, 0.68),  # Physics I
    "PHY201": (0.72, 0.65),  # Physics II
    "ENG101": (0.35, 0.75),  # Technical Writing - easier
    "SE301": (0.58, 0.85),  # Software Engineering
}


def _generate_consistent_prediction(course_id: str) -> Tuple[float, float]:
    """
    Generate a consistent prediction for unknown courses based on their ID.
    Uses hashing to ensure the same course always gets the same prediction.
    """
    # Use hash to generate consistent random values
    hash_bytes = hashlib.md5(course_id.encode()).digest()
    
    # Extract two floats from the hash
    difficulty = (hash_bytes[0] + hash_bytes[1]) / 510  # 0.0 - 1.0
    satisfaction = (hash_bytes[2] + hash_bytes[3]) / 510  # 0.0 - 1.0
    
    # Adjust to more realistic ranges (0.3 - 0.95)
    difficulty = 0.3 + difficulty * 0.65
    satisfaction = 0.4 + satisfaction * 0.55
    
    return (round(difficulty, 3), round(satisfaction, 3))


def predict_course_metrics(course_ids: List[str]) -> List[Dict]:
    """
    Predict difficulty weight and satisfaction score for given courses.
    
    Args:
        course_ids: List of course identifiers
        
    Returns:
        List of prediction dictionaries with difficulty_weight, satisfaction_score,
        confidence, and optional factors
    """
    predictions = []
    
    for course_id in course_ids:
        # Normalize course ID (uppercase, remove spaces)
        normalized_id = course_id.strip().upper()
        
        # Check if we have mock data for this course
        if normalized_id in MOCK_COURSE_DATA:
            difficulty, satisfaction = MOCK_COURSE_DATA[normalized_id]
            confidence = 0.95  # High confidence for known courses
            factors = {
                "data_source": "historical",
                "sample_size": random.randint(100, 500),
                "pass_rate": round(1 - (difficulty * 0.3), 2),
            }
        else:
            # Generate consistent prediction for unknown courses
            difficulty, satisfaction = _generate_consistent_prediction(normalized_id)
            confidence = 0.60  # Lower confidence for inferred courses
            factors = {
                "data_source": "inferred",
                "note": "Based on course code pattern analysis",
            }
        
        predictions.append({
            "course_id": course_id,  # Return original ID
            "difficulty_weight": difficulty,
            "satisfaction_score": satisfaction,
            "confidence": confidence,
            "factors": factors,
        })
    
    return predictions


def get_model_info() -> Dict:
    """Get information about the current prediction model."""
    return {
        "model_type": "MockPredictor",
        "version": "1.0.0",
        "training_date": "2024-01-01",
        "known_courses": len(MOCK_COURSE_DATA),
        "features": ["historical_pass_rate", "student_feedback", "course_level"],
    }
