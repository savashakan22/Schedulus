import unittest
from app.predictor import Predictor

class TestPredictor(unittest.TestCase):
    def setUp(self):
        self.predictor = Predictor()

    def test_predict_course_weights(self):
        course_ids = ["C1", "C2", "CourseA"]
        weights = self.predictor.predict_course_weights(course_ids)
        self.assertEqual(len(weights), 3)
        self.assertIn("C1", weights)
        self.assertTrue(isinstance(weights["C1"], int))

    def test_predict_timeslot_scores(self):
        timeslots = ["Monday-10:00", "Friday-17:00"]
        scores = self.predictor.predict_timeslot_scores(timeslots)
        self.assertEqual(len(scores), 2)
        self.assertEqual(scores["Monday-10:00"], 100)
        self.assertEqual(scores["Friday-17:00"], -50)

if __name__ == '__main__':
    unittest.main()
