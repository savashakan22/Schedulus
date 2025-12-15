from typing import List, Dict

class Predictor:
    def predict_course_weights(self, course_ids: List[str]) -> Dict[str, int]:
        # Mock logic:
        # For now, generate random or deterministic weights based on ID length or hash
        # In real scenario, this would load a model and predict.
        weights = {}
        for cid in course_ids:
            # Example: "CourseA" -> 10, "CourseB" -> 95
            # Just simple mock: hash(cid) % 100
            weights[cid] = abs(hash(cid)) % 100
        return weights

    def predict_timeslot_scores(self, timeslots: List[str]) -> Dict[str, int]:
        # Input: List of strings like "Monday-10:00"
        # Output: JSON map { "Monday-10:00": +100 }
        scores = {}
        for ts in timeslots:
            # Mock logic:
            # Fridays are bad (-50), Mondays are good (+100), others 0
            if "Friday" in ts:
                scores[ts] = -50
            elif "Monday" in ts:
                scores[ts] = 100
            else:
                scores[ts] = 10
        return scores
