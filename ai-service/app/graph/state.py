from typing import TypedDict, Optional

class SQLState(TypedDict):

    # Input
    question: str
    connection_id: str

    # Schema
    retrieved_schema: Optional[list]
    schema_context: Optional[dict]

    # SQL
    sql: Optional[str]

    # Verification
    sql_correct: bool
    verification_error: Optional[str]
    verification_feedback: Optional[str]

    # Retry
    retry_count: int
    max_retries: int