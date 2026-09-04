import sqlglot

from .state import SQLState
from ..services.retrieval_schema import retrieval_service
from ..services.schema_context_builder import SchemaContextBuilder
from ..services.sql_generator import SQLGenerator
from ..services.normalization import Normalization

async def normalize_question_node(state: SQLState):
    question = state['question']

    normalize_question = await Normalization().normalize_text(question)
    print("Hello, from Normalize Question Node")
    print(normalize_question)

    return {
        "normalized_question": normalize_question
    }

def retrieve_schema_node(state: SQLState):
    question = state['normalized_question']
    connection_id = state['connection_id']
    print("Hello, from Retrieve Schema Node")
    print(question)

    retrieved_schema = retrieval_service.search(connection_id, question, limit=5)

    # print("Hello from retrieve_schema_node")
    # print(f"Retrived Schema: {retrieved_schema}")

    return {
        "retrieved_schema": retrieved_schema
    }


def build_schema_context_node(state: SQLState):
    results = state['retrieved_schema']
    print("Hello from build_schema_context_node")
    schema_context = SchemaContextBuilder.build_text(results)

    # print("Build Schema Context Node:")
    # print(f"Schema Context: {schema_context}")
    return {
        "schema_context": schema_context
    }

async def generate_sql_node(state: SQLState):
    schema_context = state['schema_context']
    question = state['normalized_question']

    print("Hello from generate_sql_node")

    sql = await SQLGenerator().generate_sql(
        user_query=question,
        schema_context=schema_context,
        database_type='MYSQL'
    )
    # print("Generate SQL Node:")
    # print(f"Generated SQL: {sql}")
    return {
        "sql": sql
    }

def verify_sql_node(state: SQLState):
    sql = state['sql']

    print("Hello from verify_sql_node")

    if not sql:
        return {
            "sql_correct": False,
            "verification_error": "SQL was not generated",
            "verification_feedback": "No SQL was produced to verify."
        }

    try:
        parsed = sqlglot.parse_one(sql, dialect="mysql")

        if parsed.key.upper() != 'SELECT':
            return {
                "sql_correct": False,
                "verification_error": "Only SELECT queries are allowed",
                "verification_feedback": "Generate a read-only SELECT query."
            }

        return {
            "sql_correct": True,
            "verification_error": None,
            "verification_feedback": "SQL is valid."
        }
    except Exception as e:
        return {
            "sql_correct": False,
            "verification_error": str(e),
            "verification_feedback": "Fix the SQL syntax and return a valid read-only query."
        }


async def fix_sql_node(state: SQLState):
    print("Hello from fix_sql_node")

    fixed_sql = await SQLGenerator().fix_sql(
        user_query=state["question"],
        schema_context=state["schema_context"],
        previous_sql=state["sql"],
        verification_error=state["verification_error"],
        verification_feedback=state["verification_feedback"],
        database_type="MYSQL"
    )
    # print(fixed_sql)

    return {
        "sql": fixed_sql,
        "retry_count": state["retry_count"] + 1,
        "sql_correct": False,
        "verification_error": None,
        "verification_feedback": None
    }