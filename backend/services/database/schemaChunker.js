class SchemaChunker {

    static createChunks(schema, connectionId, userId) {

        const chunks = [];

        for (const table of schema.tables) {
            const content = this.createTableContent(
                schema,
                table
            );

            chunks.push({
                connectionId,
                userId,

                type: "table",

                databaseType: schema.databaseType,
                databaseName: schema.databaseName,

                tableName: table.name,

                content
            });

            for (const foreignKey of table.foreignKeys) {

                const relationshipContent = `
DATABASE: ${schema.databaseName}

RELATIONSHIP:

Source:
${table.name}.${foreignKey.column}

Target:
${foreignKey.referencedTable}.${foreignKey.referencedColumn}

Join condition:
${table.name}.${foreignKey.column} = ${foreignKey.referencedTable}.${foreignKey.referencedColumn}
`.trim();


                chunks.push({

                    connectionId,
                    userId,

                    type: "relationship",

                    databaseType:
                        schema.databaseType,

                    databaseName:
                        schema.databaseName,

                    tableName:
                        table.name,

                    referencedTable:
                        foreignKey.referencedTable,

                    column:
                        foreignKey.column,

                    referencedColumn:
                        foreignKey.referencedColumn,

                    constraintName:
                        foreignKey.constraintName,

                    content:
                        relationshipContent
                });
            }
        }

        return chunks;
    }


    // =========================
    // TABLE CONTENT
    // =========================

    static createTableContent(schema, table) {

        let content =
            `DATABASE: ${schema.databaseName}\n\n`;

        content +=
            `TABLE: ${table.name}\n\n`;

        content +=
            `Columns:\n`;


        for (const column of table.columns) {

            content +=
                `- ${column.name}: ${column.columnType}`;


            if (!column.nullable) {

                content +=
                    `, NOT NULL`;
            }


            if (
                table.primaryKey.includes(
                    column.name
                )
            ) {

                content +=
                    `, PRIMARY KEY`;
            }


            content += `\n`;
        }


        // =========================
        // RELATIONSHIPS
        // =========================

        if (
            table.foreignKeys.length > 0
        ) {

            content +=
                `\nRelationships:\n`;


            for (
                const fk
                of table.foreignKeys
            ) {

                content +=
                    `- ${table.name}.${fk.column} ` +
                    `references ` +
                    `${fk.referencedTable}.${fk.referencedColumn}\n`;
            }
        }


        return content.trim();
    }
}


export default SchemaChunker;