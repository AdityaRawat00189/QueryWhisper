from fastapi import APIRouter, HTTPException

from app.models.sql_models import ( SQLGenerationRequest, SQLGenerationResponse)

from app.services.sql_generator import SQLGenerator
from app.services.schema_context_builder import SchemaContextBuilder

from app.graph.graph import graph

from app.services.retrieval_schema import retrieval_service

router = APIRouter(
    prefix="/sql",
    tags=["SQL Generation"]
)

sql_generator = SQLGenerator()

@router.post("/generate", response_model=SQLGenerationResponse)
async def generate_sql(request: SQLGenerationRequest):
    try:
        print("\n========== SQL GENERATION ==========")

        print("Connection:", request.connectionId)
        print("User:", request.userId)
        print("Database:", request.databaseName)
        print("Query:", request.query)

        result = await graph.ainvoke({
            "question": request.query,

            "connection_id": request.connectionId,

            "retrieved_schema": None,
            "schema_context": None,
            "sql": None,
            
            "sql_correct": False,
            "verification_error": None,
            "verification_feedback": None,

            "retry_count": 0,
            "max_retries": 3
        })

        sql = result["sql"]


        print(
            "\n========== GENERATED SQL =========="
        )

        print(sql)

        print(
            "===================================\n"
        )

        # -----------------------------------------
        # 4. Handle insufficient schema
        # -----------------------------------------

        if sql == "SCHEMA_INSUFFICIENT":

            raise HTTPException(
                status_code=422,
                detail=(
                    "The retrieved schema does not contain "
                    "enough information to generate the requested SQL."
                )
            )

        # -----------------------------------------
        # 5. Return result
        # -----------------------------------------

        return {
            "success": True,
            "query": request.query,
            "sql": sql,
            "schemaContext": result["schema_context"]
        }

    except HTTPException:
        raise

    except Exception as error:

        print(
            "SQL Generation Error:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate SQL."
        )