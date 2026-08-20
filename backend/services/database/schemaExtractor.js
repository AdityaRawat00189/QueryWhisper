import MySQLSchemaExtractor from "./mySqlSchemaExtractor.js";

class schemaExtractor {
    static async extract(connection, databaseType) {
        switch (databaseType) {
            case 'postgresql':
                // return await postgresqlSchemaExtractor.extract(connection);
                return null;
            case 'mysql':
                return await MySQLSchemaExtractor.extractSchema(connection);
            default:
                throw new Error(
                    `Unsupported database type: ${databaseType}`
                );
        }
    }
}

export default schemaExtractor;