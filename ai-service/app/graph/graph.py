from langgraph.graph import StateGraph, START, END

from .state import SQLState

from .nodes import (
    normalize_question_node,
    retrieve_schema_node,
    build_schema_context_node,
    generate_sql_node,
    verify_sql_node,
    fix_sql_node,
)
from .routers import (route_after_verification)

builder = StateGraph(SQLState)

builder.add_node("normalize_question", normalize_question_node)
builder.add_node("retrieve_schema", retrieve_schema_node)
builder.add_node("build_schema_context", build_schema_context_node)
builder.add_node("generate_sql", generate_sql_node)
builder.add_node("verify_sql", verify_sql_node)
builder.add_node("fix_sql", fix_sql_node)


builder.add_edge(START, "normalize_question")
builder.add_edge("normalize_question", "retrieve_schema")
builder.add_edge("retrieve_schema", "build_schema_context")
builder.add_edge("build_schema_context", "generate_sql")
builder.add_edge("generate_sql", "verify_sql")

builder.add_conditional_edges( "verify_sql", route_after_verification,
    {
        "success": END,
        "fix": "fix_sql",
        "max_retries": END
    }
)

builder.add_edge("fix_sql", "verify_sql")

graph = builder.compile()