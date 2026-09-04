class SchemaContextBuilder:

    @staticmethod
    def build(results):
        tables = {}
        relationships = []

        # --------------------------------
        # 1. Add directly retrieved chunks
        # --------------------------------

        for result in results:
            payload = result.payload  # ScoredPoint -> payload

            chunk_type = payload.get("type")

            if chunk_type == "table":
                table_name = payload.get("tableName")

                if table_name:
                    tables[table_name] = payload

            elif chunk_type == "relationship":
                relationships.append(payload)

        # --------------------------------
        # 2. Find related tables
        # --------------------------------

        table_names = set(tables.keys())

        for relationship in relationships:
            source_table = relationship.get("tableName")
            target_table = relationship.get("referencedTable")

            if source_table in table_names and target_table:
                table_names.add(target_table)

        # --------------------------------
        # 3. Return context
        # --------------------------------

        return {
            "tables": list(tables.values()),
            "relationships": relationships
        }

    @staticmethod
    def build_text(results):
        # print(f"results: {results}")

        tables = {}
        relationships = []

        # --------------------------------
        # 1. Process Qdrant results
        # --------------------------------

        for result in results:
            # Qdrant returns ScoredPoint objects
            payload = result.payload

            chunk_type = payload.get("type")

            if chunk_type == "table":
                table_name = payload.get("tableName")

                if table_name:
                    tables[table_name] = payload

            elif chunk_type == "relationship":
                relationships.append(payload)

        # --------------------------------
        # 2. Build text context
        # --------------------------------

        context = []

        # Add tables
        for table in tables.values():
            content = table.get("content")

            if content:
                context.append(content)

        # Add relationships
        for relationship in relationships:
            content = relationship.get("content")

            if content:
                context.append(content)

        # --------------------------------
        # 3. Final context
        # --------------------------------

        final_context = "\n\n".join(context)

        # print("\n========== SCHEMA CONTEXT ==========")
        # print(final_context)
        # print("====================================\n")

        return final_context