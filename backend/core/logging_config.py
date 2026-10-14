"""Enterprise structured terminal logging configuration for StackLift."""

import logging
import sys
from typing import Optional


class TerminalFormatter(logging.Formatter):
    """Clean ANSI-colorized, high-visibility formatter for enterprise terminal logs."""

    # ANSI Colors
    GREY = "\033[90m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    RESET = "\033[0m"

    LEVEL_COLORS = {
        logging.DEBUG: GREY,
        logging.INFO: GREEN,
        logging.WARNING: YELLOW,
        logging.ERROR: RED,
        logging.CRITICAL: f"{BOLD}{RED}",
    }

    def format(self, record: logging.LogRecord) -> str:
        color = self.LEVEL_COLORS.get(record.levelno, self.RESET)
        time_str = self.formatTime(record, "%H:%M:%S")

        level_badge = f"{color}[{record.levelname[:4]}]{self.RESET}"
        name_badge = f"{self.CYAN}{record.name[:24]:<24}{self.RESET}"
        message = record.getMessage()

        res = f"{self.GREY}{time_str}{self.RESET} {level_badge} {name_badge} {message}"
        if record.exc_info:
            res += f"\n{self.formatException(record.exc_info)}"
        return res


def setup_enterprise_logging(level: int = logging.INFO) -> None:
    """Configures root and third-party loggers with the enterprise terminal formatter."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(TerminalFormatter())

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Replace existing handlers
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # Quieten excessively noisy external libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
