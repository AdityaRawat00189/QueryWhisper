from pydantic import BaseModel

class SQLGenerationRequest(BaseModel):
    connectionId: str
    userId: str

    databaseType: str
    databaseName: str

    query: str


class SQLGenerationResponse(BaseModel):
    success: bool
    query: str
    sql: str
    schemaContext: str