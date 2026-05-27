from core.actions import get_possible_actions

def dfs(state, path, depth, limit, results):
    if depth == limit:
        results.append(path)
        return

    for action in get_possible_actions():
        dfs(state, path + [action], depth + 1, limit, results)