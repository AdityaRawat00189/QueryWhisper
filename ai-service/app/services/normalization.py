import os
import re

from ollama import AsyncClient

class Normalization:

    def __init__(self):
        self.model = os.getenv(
            "OLLAMA_SQL_MODEL",
            "llama3.1:8b"
        )

        ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.client = AsyncClient(host=ollama_host)

    async def normalize_text(self, question: str):

        prompt = f"""
You are a STRICT semantic-preserving normalizer for an NL-to-SQL system.

Your task is ONLY to rewrite the user's query into clearer, canonical
natural language.

CRITICAL RULE:

The output MUST contain exactly the same information, conditions,
filters, columns, ordering, grouping, aggregation, and limits as the input.

NEVER add information.

NEVER infer information.

NEVER assume information.

NEVER add filters that are not explicitly present.

NEVER add columns that are not explicitly requested.

NEVER add sorting.

NEVER add limits.

NEVER add joins.

NEVER add conditions.

NEVER add demographic, age, department, location, status, or other
attributes unless explicitly mentioned by the user.

You may ONLY:
- remove conversational words
- fix grammar
- normalize singular/plural
- make equivalent wording consistent
- make an explicitly stated condition clearer
- preserve the original requested information

If the input is already clear, return it with minimal changes.

IMPORTANT:
For every condition in the output, you must be able to point to the
corresponding words in the user's input.

If no such words exist, DO NOT include that condition.

Examples:

Input:
find students from Delhi

Output:
Find students from Delhi.

Input:
find students whose city is Delhi

Output:
Find students whose city is Delhi.

Input:
find students from Delhi older than 20

Output:
Find students from Delhi whose age is greater than 20.

Input:
show name and city of students from Delhi

Output:
Find the name and city of students from Delhi.

Input:
find students

Output:
Find students.

Input:
show all students

Output:
Find all students.

BAD OUTPUT EXAMPLE:

Input:
find students from Delhi

Wrong:
Find students from Delhi whose age is greater than 18.

Why:
The age condition was not present in the input.

USER QUERY:
{question}

Return ONLY the normalized query.
"""

        response = await self.client.chat(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise natural language query normalizer."
                        "Return only the normalized natural language query."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        normalized = response.message.content.strip()
        # print(normalized)

        return normalized