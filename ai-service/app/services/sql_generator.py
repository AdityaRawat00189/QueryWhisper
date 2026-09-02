# import os
# import re

# from huggingface_hub import AsyncInferenceClient


# class SQLGenerator:

#     def __init__(self):
#         self.model = os.getenv(
#             "HF_SQL_MODEL",
#             "meta-llama/Llama-3.1-8B-Instruct"
#         )

#         self.client = AsyncInferenceClient(
#             provider="auto",
#             api_key=os.getenv("HF_TOKEN")
#         )

#     async def generate_sql(self, user_query: str, schema_context: str, database_type: str):
#         prompt = f"""
# You are an expert {database_type} SQL query generator.

# Your task is to convert a user's natural language request
# into a valid SQL query using ONLY the provided database schema.

# DATABASE TYPE:
# {database_type}

# DATABASE SCHEMA:
# {schema_context}

# USER REQUEST:
# {user_query}

# STRICT RULES:

# 1. Generate ONLY a SQL query.
# 2. Do NOT explain the query.
# 3. Do NOT use Markdown.
# 4. Do NOT wrap the query inside ```sql.
# 5. Use ONLY tables that exist in the provided schema.
# 6. Use ONLY columns that exist in the provided schema.
# 7. Never invent table names.
# 8. Never invent column names.
# 9. Respect the relationships provided in the schema.
# 10. Use the provided JOIN conditions when relationships are required.
# 11. Generate valid {database_type} SQL.
# 12. Prefer explicit JOIN conditions.
# 13. Do not generate INSERT queries.
# 14. Do not generate UPDATE queries.
# 15. Do not generate DELETE queries.
# 16. Do not generate DROP queries.
# 17. Do not generate ALTER queries.
# 18. Do not generate TRUNCATE queries.
# 19. Only generate read-only SQL queries such as SELECT.
# 20. If the requested information cannot be obtained from the provided
#     schema, return exactly:

# SCHEMA_INSUFFICIENT

# Return ONLY the SQL query or SCHEMA_INSUFFICIENT.
# """

#         response = await self.client.chat.completions.create(
#             model=self.model,
#             messages=[
#                 {
#                     "role": "system",
#                     "content": (
#                         "You are a precise SQL generation engine. "
#                         "Return only SQL."
#                     )
#                 },
#                 {
#                     "role": "user",
#                     "content": prompt
#                 }
#             ],
#             temperature=0.0,
#             max_tokens=512
#         )

#         generated_sql = response.choices[0].message.content

#         if not generated_sql:
#             raise ValueError("LLM returned an empty response")

#         generated_sql = generated_sql.strip()

#         generated_sql = self.clean_sql(generated_sql)

#         return generated_sql

#     @staticmethod
#     def clean_sql(sql: str) -> str:

#         sql = sql.strip()

#         # Remove Markdown code fences if model still returns them
#         sql = re.sub(r"^```sql\s*", "", sql, flags=re.IGNORECASE)
#         sql = re.sub(r"^```\s*", "", sql)
#         sql = re.sub(r"\s*```$", "", sql)

#         return sql.strip()


import os
import re

from ollama import AsyncClient

class SQLGenerator:

    def __init__(self):
        self.model = os.getenv(
            "OLLAMA_SQL_MODEL",
            "qwen2.5-coder:3b" 
        )

        ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.client = AsyncClient(host=ollama_host)

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
        
        response = await self.client.chat(
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
            options={
                "temperature": 0.0,
                "num_predict": 512  
            }
        )

        # Extract the content using dictionary keys instead of dot notation
        generated_sql = response['message']['content']

        if not generated_sql:
            raise ValueError("LLM returned an empty response")

        generated_sql = generated_sql.strip()
        generated_sql = self.clean_sql(generated_sql)

        return generated_sql

    async def fix_sql(self, user_query: str, schema_context: str, previous_sql: str, verification_error: str, verification_feedback: str, database_type: str):
        prompt = f""" 
You are an expert {database_type} SQL developer. 

Your task is to FIX the previously generated SQL query. 

You MUST preserve the original intent of the user's question. 

======================== 
USER QUESTION 
======================== 
{user_query} 

======================== 
DATABASE SCHEMA 
======================== 
{schema_context} 

======================== 
PREVIOUS SQL 
======================== 
{previous_sql} 

======================== 
VERIFICATION ERROR 
======================== 
{verification_error} 

======================== 
VERIFIER FEEDBACK 
======================== 
{verification_feedback} 

========================
INSTRUCTIONS 
========================

1. Identify what is wrong with the previous SQL. 
2. Use ONLY tables and columns that exist in the provided schema. 
3. Respect the relationships between tables. 
4. Correct invalid JOIN conditions. 
5. Correct invalid column names. 
6. Correct invalid table names. 
7. Correct incorrect WHERE conditions. 
8. Correct incorrect GROUP BY / ORDER BY / aggregation logic if necessary. 
9. Preserve the user's original intent. 
10. Generate valid {database_type} SQL. 
11. Generate a READ-ONLY query. 
12. Do NOT use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, or other write operations. 
13. Return ONLY the corrected SQL. 
14. Do NOT return markdown. 
15. Do NOT include explanations. 
16. Do NOT include ```sql fences. 

Return only the corrected SQL query. 

Corrected SQL:

"""

        response = await self.client.chat(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise SQL correction engine."
                        " Return only the corrected SQL."
                    )
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            options={
                "temperature": 0.0,
                "num_predict": 512
            }
        )
        fixed_sql = response["message"]["content"]
        
        if not fixed_sql:
            raise ValueError("LLM returned an empty response")

        return self.clean_sql(fixed_sql)


    @staticmethod
    def clean_sql(sql: str) -> str:
        sql = sql.strip()

        # Remove Markdown code fences if model still returns them
        sql = re.sub(r"^```sql\s*", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"^```\s*", "", sql)
        sql = re.sub(r"\s*```$", "", sql)

        return sql.strip()