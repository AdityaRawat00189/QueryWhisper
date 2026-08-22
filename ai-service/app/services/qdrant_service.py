from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct
)
from qdrant_client.models import (
    Filter, FieldCondition, MatchValue
)


import uuid

class QdrantService:

    def __init__(self):
        self.client = QdrantClient(
            url = "http://localhost:6333"
        )

        self.collection_name = "schema_embeddings"
        self._create_collection()

    def _create_collection(self):
        collections = self.client.get_collections()

        exists = any(
            collection.name == self.collection_name
            for collection in collections.collections
        )

        if not exists:
            self.client.create_collection(
                collection_name = self.collection_name,
                vectors_config = VectorParams(
                    size=384,
                    distance=Distance.COSINE
                )
            )

            print(f"Created Collection: "
                  f"{self.collection_name}")

    def insert_chunks(self, chunks, embeddings):
        if not chunks:
            return 0

        self.delete_connection(chunks[0].connectionId)

        points = []
        for chunk, embedding in zip(chunks, embeddings):
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,

                payload={
                    "connectionId": chunk.connectionId,
                    "userId": chunk.userId,

                    "databaseType": chunk.databaseType,
                    "databaseName": chunk.databaseName,

                    "type": chunk.type,

                    "tableName": chunk.tableName,

                    "referencedTable":
                        chunk.referencedTable,

                    "column":
                        chunk.column,

                    "referencedColumn":
                        chunk.referencedColumn,

                    "constraintName":
                        chunk.constraintName,

                    "content":
                        chunk.content
                }
            )

            points.append(point)

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

        return len(points)

    def delete_connection(self, connection_id):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="connectionId",
                        match=MatchValue(value=connection_id)
                    )
                ]
            ),
            wait=True
        )

    insert_chunk = insert_chunks

    def search(self, query_embedding, connection_id, limit=5):
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="connectionId",
                    match=MatchValue(
                        value=connection_id
                    )
                )
            ]
        )

        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_embedding,
            query_filter=query_filter,
            limit=limit,
            with_payload=True
        )

        return results.points


qdrant_service = QdrantService()