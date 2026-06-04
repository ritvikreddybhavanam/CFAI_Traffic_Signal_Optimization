import sys
sys.stdout.reconfigure(encoding='utf-8')

from core.envoirment import TrafficState
from search.greedy import greedy_step
from csp.scheduler import TrafficCSP
from utils.logger import get_logger


def display_state(state_dict):
    print("┌─────────────────────────────────────────┐")

    for lane, vehicles in state_dict.items():
        print(f"│ {lane:<10} : {vehicles:>3} Vehicles          │")

    print("└─────────────────────────────────────────┘")


def run_simulation(steps=5):

    logger = get_logger()

    logger.info("Traffic Simulation Started")

    state = TrafficState()

    print("\n")
    print("╔══════════════════════════════════════════════════════╗")
    print("║        TRAFFIC SIGNAL OPTIMIZATION SYSTEM           ║")
    print("╚══════════════════════════════════════════════════════╝")

    print("\nINITIAL TRAFFIC STATE")
    display_state(state.get_state())

    logger.info(f"Initial State: {state.get_state()}")

    for step in range(steps):

        print("\n")
        print("══════════════════════════════════════════════════════")
        print(f"                    STEP {step + 1}")
        print("══════════════════════════════════════════════════════")

        lane = greedy_step(state)

        before = state.queues[lane]

        state.apply_green(lane)

        passed = before - state.queues[lane]

        state.update_waiting()

        print(f"\n🚦 Green Signal Assigned : {lane.upper()}")
        print(f"🚗 Vehicles Passed       : {passed}")

        logger.info(f"Green Signal: {lane}")

        print("\nCURRENT TRAFFIC STATUS")
        display_state(state.get_state())

        csp = TrafficCSP(state)
        suggestion = csp.schedule()

        print(f"\n🧠 CSP Recommendation : {suggestion.upper()}")

        logger.info(f"CSP Recommendation: {suggestion}")
        logger.info(f"Current State: {state.get_state()}")

    print("\n")
    print("══════════════════════════════════════════════════════")
    print("                  FINAL TRAFFIC STATE")
    print("══════════════════════════════════════════════════════")

    display_state(state.get_state())

    logger.info(f"Final State: {state.get_state()}")

    print("\n✅ Simulation Completed Successfully")


if __name__ == "__main__":
    run_simulation()