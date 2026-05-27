from config import LANES, MAX_GREEN_TIME

class TrafficCSP:
    def __init__(self, state):
        self.state = state
        self.assignment = {}

    def is_valid(self, lane):
        return self.state.queues[lane] > 0

    def select_mrv(self):
        return max(self.state.queues, key=self.state.queues.get)

    def schedule(self):
        lane = self.select_mrv()

        if self.is_valid(lane):
            self.assignment["green"] = lane
            return lane

        return None