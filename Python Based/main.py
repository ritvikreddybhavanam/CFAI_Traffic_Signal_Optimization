import sys
sys.stdout.reconfigure(encoding='utf-8')

from core.envoirment import TrafficState
from search.greedy import greedy_step
from csp.scheduler import TrafficCSP
from utils.logger import get_logger


def run_simulation(steps=5):
    logger = get_logger()

    logger.info("Traffic Simulation Started")

    state = TrafficState()

    logger.info(f"Initial State: {state.get_state()}")
    print("\nINITIAL STATE:", state.get_state())

    for i in range(steps):
        print(f"\n--- STEP {i + 1} ---")
        logger.info(f"Step {i + 1} started")

        lane = greedy_step(state)
        logger.info(f"Greedy selected lane: {lane}")

        print("Green Signal →", lane)

        state.apply_green(lane)
        state.update_waiting()

        current_state = state.get_state()

        print("State:", current_state)
        logger.info(f"Updated State: {current_state}")

        csp = TrafficCSP(state)
        suggestion = csp.schedule()

        print("CSP Suggestion:", suggestion)
        logger.info(f"CSP Suggestion: {suggestion}")

    final_state = state.get_state()

    print("\nFINAL STATE:", final_state)
    logger.info(f"Simulation ended. Final state: {final_state}")


if __name__ == "__main__":
    run_simulation()