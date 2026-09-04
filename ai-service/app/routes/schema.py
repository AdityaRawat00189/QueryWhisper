from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service


router = APIRouter()


class SchemaChunk(BaseModel):

    connectionId: str
    userId: str

    type: str

    databaseType: str
    databaseName: str

    tableName: str
    content: str

    referencedTable: Optional[str] = None
    column: Optional[str] = None
    referencedColumn: Optional[str] = None
    constraintName: Optional[str] = None


class SchemaIndexRequest(BaseModel):

    connectionId: str
    userId: str

    databaseType: str
    databaseName: str

    chunks: List[SchemaChunk]


@router.post("/index")
async def index_schema(
    request: SchemaIndexRequest
):

    # print("\n========== SCHEMA INDEXING ==========")

    # print("Database:", request.databaseName)
    # print("Connection:", request.connectionId)
    # print("Number of chunks:", len(request.chunks))

    if not request.chunks:
        qdrant_service.delete_connection(request.connectionId)
        return {
            "success": True,
            "message": "No schema chunks to index",
            "chunksReceived": 0,
            "embeddingsGenerated": 0,
            "embeddingDimensions": 0,
            "qdrantInserted": 0
        }

    # 1. Extract text

    texts = [
        chunk.content
        for chunk in request.chunks
    ]

    # 2. Generate embeddings

    embeddings = (
        embedding_service.generate_embeddings(
            texts
        )
    )

    # print(
    #     "Generated embeddings:",
    #     len(embeddings)
    # )

    # print(
    #     "Embedding dimensions:",
    #     len(embeddings[0])
    # )

    # 3. Store in Qdrant

    inserted = qdrant_service.insert_chunks(
        request.chunks,
        embeddings
    )

    # print(
    #     "Inserted into Qdrant:",
    #     inserted
    # )

    # print("====================================\n")

    return {
        "success": True,
        "message":
            "Schema embedded and indexed",
        "chunksReceived":
            len(request.chunks),
        "embeddingsGenerated":
            len(embeddings),
        "embeddingDimensions":
            len(embeddings[0]),
        "qdrantInserted":
            inserted
    }