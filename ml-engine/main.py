"""
ML Engine - Predictive Service for Course Scheduling

This service provides ML-based predictions for course difficulty weights
and satisfaction scores based on historical data analysis.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    PredictionRequest,
    PredictionResponse,
    CoursePrediction,
    HealthResponse,
)
from predictor import predict_course_metrics, get_model_info

app = FastAPI(
    title="Schedulus ML Engine",
    description="Machine Learning predictions for university course scheduling optimization",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check."""
    model_info = get_model_info()
    return HealthResponse(
        status="healthy",
        version=model_info["version"],
        model_loaded=True,
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    model_info = get_model_info()
    return HealthResponse(
        status="healthy",
        version=model_info["version"],
        model_loaded=True,
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Predict difficulty weights and satisfaction scores for given courses.
    
    Args:
        request: PredictionRequest containing list of course_ids
        
    Returns:
        PredictionResponse with predictions for each course
    """
    if not request.course_ids:
        raise HTTPException(status_code=400, detail="course_ids cannot be empty")
    
    if len(request.course_ids) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 courses per request")
    
    predictions_data = predict_course_metrics(request.course_ids)
    
    predictions = [
        CoursePrediction(**pred) for pred in predictions_data
    ]
    
    return PredictionResponse(
        predictions=predictions,
        model_version=get_model_info()["version"],
    )


@app.get("/model-info")
async def model_info():
    """Get information about the current prediction model."""
    return get_model_info()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)
