import logging
import os
from datetime import datetime


def get_logger(name="traffic_system", log_file="logs/system.log", level=logging.INFO):
    """
    Creates and returns a configured logger instance.
    Logs are written both to console and a file.
    """

    # Create logs directory if it doesn't exist
    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid duplicate handlers (important when importing multiple times)
    if logger.handlers:
        return logger

    # -----------------------
    # Formatter
    # -----------------------
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # -----------------------
    # File Handler
    # -----------------------
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)

    # -----------------------
    # Console Handler
    # -----------------------
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)

    # -----------------------
    # Add handlers
    # -----------------------
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    logger.propagate = False

    logger.info("Logger initialized successfully")

    return logger


# Optional: quick test when running directly
if __name__ == "__main__":
    log = get_logger()
    log.info("Traffic system logger is working")
    log.warning("Sample warning message")
    log.error("Sample error message")