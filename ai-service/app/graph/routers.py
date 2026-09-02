from typing import TypedDict

from .state import SQLState

def route_after_verification(state: SQLState):

    if state["sql_correct"]:
        return "success"

    if state["retry_count"] >= state["max_retries"]:
        return "max_retries"

    return "fix"