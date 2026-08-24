import os
import re

from huggingface_hub import AsyncInferenceClient


class SQLGenerator:

    def __init__(self):
        self.model = os.getenv(
            "HF_SQL_MODEL",
            "meta-llama/Llama-3.1-8B-Instruct"
        )

        self.client = AsyncInferenceClient(
            provider="auto",
            api_key=os.getenv("HF_TOKEN")
        )

    async def generate_sql(self, user_query: str, schema_context: str, database_type: str):
        prompt = f"""
You are an expert {database_type} SQL query generator.

Your task is to convert a user's natural language request
into a valid SQL query using ONLY the provided database schema.

DATABASE TYPE:
{database_type}

DATABASE SCHEMA:
{schema_context}

USER REQUEST:
{user_query}

STRICT RULES:

1. Generate ONLY a SQL query.
2. Do NOT explain the query.
3. Do NOT use Markdown.
4. Do NOT wrap the query inside ```sql.
5. Use ONLY tables that exist in the provided schema.
6. Use ONLY columns that exist in the provided schema.
7. Never invent table names.
8. Never invent column names.
9. Respect the relationships provided in the schema.
10. Use the provided JOIN conditions when relationships are required.
11. Generate valid {database_type} SQL.
12. Prefer explicit JOIN conditions.
13. Do not generate INSERT queries.
14. Do not generate UPDATE queries.
15. Do not generate DELETE queries.
16. Do not generate DROP queries.
17. Do not generate ALTER queries.
18. Do not generate TRUNCATE queries.
19. Only generate read-only SQL queries such as SELECT.
20. If the requested information cannot be obtained from the provided
    schema, return exactly:

SCHEMA_INSUFFICIENT

Return ONLY the SQL query or SCHEMA_INSUFFICIENT.
"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise SQL generation engine. "
                        "Return only SQL."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.0,
            max_tokens=512
        )

        generated_sql = response.choices[0].message.content

        if not generated_sql:
            raise ValueError("LLM returned an empty response")

        generated_sql = generated_sql.strip()

        generated_sql = self.clean_sql(generated_sql)

        return generated_sql

    @staticmethod
    def clean_sql(sql: str) -> str:

        sql = sql.strip()

        # Remove Markdown code fences if model still returns them
        sql = re.sub(r"^```sql\s*", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"^```\s*", "", sql)
        sql = re.sub(r"\s*```$", "", sql)

        return sql.strip()