from qdrant_client import Filter, FieldCondition, MatchValue

class RetrievalService:

    def __init__(self, qdrant_client, collection_name):
        self.client = qdrant_client
        self.collection_name = collection_name

    def search(self, query_embedding, connection_id, limit=5):
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="connectionId",
                    match=MatchValue(value = connection_id)
                )
            ]
        )

        results = self.client.query_points(
            collection_name = self.collection_name,
            query=query_embedding,
            query_filter=query_filter,
            limit=limit,
            with_payload=True
        )

        return results.points
