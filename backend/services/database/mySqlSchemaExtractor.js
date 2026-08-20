import mysql from 'mysql2';

class MySQLSchemaExtractor {

    static async extractSchema(connection) {

        const [tables] = await connection.query(`
            SELECT
                TABLE_NAME,
                TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_TYPE = 'BASE TABLE'
        `);

        const [columns] = await connection.query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                DATA_TYPE,
                COLUMN_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT,
                ORDINAL_POSITION
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        const [primaryKeys] = await connection.query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                ORDINAL_POSITION
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND CONSTRAINT_NAME = 'PRIMARY'
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        const [foreignKeys] = await connection.query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME,
                CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        return this.buildSchema(
            tables,
            columns,
            primaryKeys,
            foreignKeys
        );
    }


    static buildSchema(
        tables,
        columns,
        primaryKeys,
        foreignKeys
    ) {

        const schema = {
            databaseType: "mysql",
            tables: []
        };

        for (const table of tables) {

            const tableName = table.TABLE_NAME;

            const tableColumns = columns
                .filter(col => col.TABLE_NAME === tableName)
                .map(col => ({
                    name: col.COLUMN_NAME,
                    dataType: col.DATA_TYPE,
                    columnType: col.COLUMN_TYPE,
                    nullable: col.IS_NULLABLE === "YES",
                    default: col.COLUMN_DEFAULT
                }));

            const tablePrimaryKeys = primaryKeys
                .filter(pk => pk.TABLE_NAME === tableName)
                .map(pk => pk.COLUMN_NAME);

            const tableForeignKeys = foreignKeys
                .filter(fk => fk.TABLE_NAME === tableName)
                .map(fk => ({
                    column: fk.COLUMN_NAME,
                    referencedTable: fk.REFERENCED_TABLE_NAME,
                    referencedColumn: fk.REFERENCED_COLUMN_NAME,
                    constraintName: fk.CONSTRAINT_NAME
                }));

            schema.tables.push({
                name: tableName,
                columns: tableColumns,
                primaryKey: tablePrimaryKeys,
                foreignKeys: tableForeignKeys
            });
        }

        return schema;
    }
}

export default MySQLSchemaExtractor;