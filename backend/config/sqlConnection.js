import mysql from "mysql2/promise";

const createConnection = async (dbConfig) => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            connectTimeout: 5000
        })

        return connection;
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
}

export default createConnection;