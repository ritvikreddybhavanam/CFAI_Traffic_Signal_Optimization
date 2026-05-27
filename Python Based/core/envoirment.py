import random
from config import LANES, VEHICLE_PASS_RATE

class TrafficState:
    def __init__(self):
        self.queues = {lane: random.randint(5, 25) for lane in LANES}
        self.wait_time = {lane: 0 for lane in LANES}

    def update_waiting(self):
        for lane in LANES:
            self.wait_time[lane] += self.queues[lane]

    def apply_green(self, lane):
        passed = min(self.queues[lane], VEHICLE_PASS_RATE)
        self.queues[lane] -= passed
        self.wait_time[lane] = 0

    def is_congested(self):
        return any(q > 15 for q in self.queues.values())

    def get_state(self):
        return self.queues.copy()