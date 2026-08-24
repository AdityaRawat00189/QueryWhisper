from fastapi import APIRouter, HTTPException

from app.models.sql_models import ( SQLGenerationRequest, SQLGenerationResponse)

from app.services.sql_generator import SQLGenerator
from app.services.schema_context_builder import SchemaContextBuilder

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

        # -----------------------------------------
        # 1. Search relevant schema from Qdrant
        # -----------------------------------------

        results = retrieval_service.search(
            connection_id=request.connectionId,
            query=request.query,
            limit=5
        )

        print(
            "Retrieved schema chunks:",
            len(results)
        )

        # -----------------------------------------
        # 2. Build schema context
        # -----------------------------------------

        schema_context = SchemaContextBuilder.build_text(
            results
        )

        if not schema_context:

            raise HTTPException(
                status_code=404,
                detail="No relevant database schema found."
            )

        print(
            "\n========== SCHEMA CONTEXT =========="
        )

        print(schema_context)

        print(
            "===================================="
        )

        # -----------------------------------------
        # 3. Generate SQL using LLM
        # -----------------------------------------

        sql = await sql_generator.generate_sql(
            user_query=request.query,
            schema_context=schema_context,
            database_type=request.databaseType
        )

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
            "schemaContext": schema_context
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