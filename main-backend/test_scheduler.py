import unittest
import asyncio
from app.services.scheduler_service import SchedulerService

class TestSchedulerService(unittest.TestCase):
    def test_generate_schedule_mock(self):
        service = SchedulerService()
        # Since the service is async, we need to run it in an event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(service.generate_schedule())
        loop.close()

        self.assertIsNotNone(result)
        self.assertIn("lessonList", result)
        self.assertTrue(len(result["lessonList"]) > 0)

        first_lesson = result["lessonList"][0]
        self.assertIn("difficultyWeight", first_lesson)
        self.assertIn("timeslot", first_lesson)
        self.assertIn("room", first_lesson)

if __name__ == '__main__':
    unittest.main()
