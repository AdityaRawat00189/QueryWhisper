from fastapi import FastAPI
from app.routes.schema import router as schema_router
from pydantic import BaseModel

from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service

app = FastAPI(
    title="QueryWhisper AI Service",
    version="1.0.0"
)

class SchemaSearchRequest(BaseModel):

    connectionId: str
    query: str
    limit: int = 5

app.include_router(
    schema_router,
    prefix="/api/v1/schema"
)

@app.post("/search")
async def search_schema(request: SchemaSearchRequest):

    print("\n========== SCHEMA SEARCH ==========")

    print("Connection:", request.connectionId)
    print("Query:", request.query)
    print("Limit:", request.limit)

    # 1. Generate embedding for user query
    query_embedding = embedding_service.generate_embedding(
        request.query
    )

    print(
        "Query embedding dimensions:",
        len(query_embedding)
    )

    # 2. Search Qdrant
    results = qdrant_service.search(
        query_embedding=query_embedding,
        connection_id=request.connectionId,
        limit=request.limit
    )

    # 3. Format results
    retrieved_chunks = []
    for result in results:

        retrieved_chunks.append({
            "score": result.score,
            "payload": result.payload
        })

    print(
        "Retrieved chunks:",
        len(retrieved_chunks)
    )

    for result in retrieved_chunks:

        print(
            result["score"],
            result["payload"].get("type"),
            result["payload"].get("tableName")
        )

    print("==================================\n")

    return {
        "success": True,
        "query": request.query,
        "results": retrieved_chunks
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ai-service"
    }