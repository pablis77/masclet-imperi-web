import os
import sys
import unittest

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app import create_app

class TestEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_create_animal(self):
        response = self.client.post('/create_animal', json={'name': 'Test Animal'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('success', response.json)

if __name__ == '__main__':
    unittest.main()