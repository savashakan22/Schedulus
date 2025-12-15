from fastapi import FastAPI, HTTPException
from typing import List, Dict
from app.predictor import Predictor

app = FastAPI()
predictor = Predictor()

@app.post("/predict/course-weights", response_model=Dict[str, int])
async def predict_course_weights(course_ids: List[str]):
    try:
        return predictor.predict_course_weights(course_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/timeslot-scores", response_model=Dict[str, int])
async def predict_timeslot_scores(timeslots: List[str]):
    try:
        # Expecting timeslots in format "Day-HH:MM"
        return predictor.predict_timeslot_scores(timeslots)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}
