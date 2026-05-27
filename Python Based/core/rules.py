def choose_best_lane(state):
    return max(state.queues, key=state.queues.get)