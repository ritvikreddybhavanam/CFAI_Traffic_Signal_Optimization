from collections import deque
from core.actions import get_possible_actions

def bfs_simulate(initial_state, steps=3):
    queue = deque([(initial_state, [])])
    results = []

    while queue:
        state, path = queue.popleft()

        if len(path) == steps:
            results.append(path)
            continue

        for action in get_possible_actions():
            new_path = path + [action]
            queue.append((state, new_path))

    return results