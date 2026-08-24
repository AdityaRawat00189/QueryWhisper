from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service


class RetrievalService:

    def search(self, connection_id, query, limit=5):
        query_embedding = embedding_service.generate_embedding(query)

        return qdrant_service.search(
            query_embedding=query_embedding,
            connection_id=connection_id,
            limit=limit
        )


retrieval_service = RetrievalService()
