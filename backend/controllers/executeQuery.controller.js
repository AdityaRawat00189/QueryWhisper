import crypto from 'crypto';
import axios from 'axios'

import createConnection from "../config/sqlConnection.js";
import DbCredential from "../schemas/dbCredential.schema.js";
import schemaExtractor from '../services/database/schemaExtractor.js';
import SchemaChunker from '../services/database/schemaChunker.js';
import DatabaseSchema from '../schemas/database.schema.js';

function decryptPassword(encryptedHex, ivHex, authTagHex, secretKeyHex) {
  const secretKey = Buffer.from(secretKeyHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm', 
    secretKey, 
    Buffer.from(ivHex, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export const executeQuery = async (req, res) => {
  try {
    const { dbName, query } = req.body;

    // 1. Validate incoming data
    if (!dbName || !query) {
      return res.status(400).json({ error: "Missing required fields: dbName and query." });
    }

    // 2. Find the correct credential for THIS user and THIS database
    const dbCredential = await DbCredential.findOne({ 
      user: req.user._id
    });

    if (!dbCredential) {
      return res.status(404).json({ error: "Database credentials not found." });
    }

    // 3. Decrypt the password
    const plainTextPassword = decryptPassword(
      dbCredential.encryptedPassword, 
      dbCredential.iv, 
      dbCredential.authTag, 
      process.env.MASTER_KEY_HEX
    );

    // 4. Construct configuration
    const dbConfig = {
      host: dbCredential.dbHost,
      port: dbCredential.dbPort,
      user: dbCredential.dbUser,
      password: plainTextPassword,
      database: dbName
    };

    // 5. Connect and Execute (FIXED: used dbConfig instead of req.dbConfig)
    const connection = await createConnection(dbConfig);
    
    if (!connection) {
      return res.status(500).json({ error: "Failed to establish database connection." });
    }

    const extractedSchema = await schemaExtractor.extract(connection, "mysql");
    console.log(JSON.stringify(extractedSchema, null, 2));

    const savedSchema = await DatabaseSchema.findOneAndUpdate(
      { connectionId: dbCredential._id },
      {
        connection: dbCredential._id,
        userId: req.user._id,
        databaseType: "mysql",
        databaseName: dbName,
        tables: extractedSchema.tables,
        extractedAt: new Date(),
        updatedAt: new Date()
      },{
        upsert: true,
        new: true,
        runValidators: true
      }
    );
    console.log("Schema Saved to MongoDB: ", savedSchema._id);

    const structured = await SchemaChunker.createChunks(savedSchema ,savedSchema._id ,req.user._id);
    console.log(JSON.stringify(structured, null, 2));

    const aiResponse = await axios.post(
      "http://localhost:8000/api/v1/schema/index",{
        connectionId: dbCredential._id.toString(),
        userId: req.user._id.toString(),
        databaseType: savedSchema.databaseType,
        databaseName: dbName,
        chunks: structured
      }
    )

    console.log("AI Service:", aiResponse.data);

    const retrievalResponse = await axios.post(
      "http://localhost:8000/search",
      {
        connectionId: dbCredential._id.toString(),
        query,
        limit: 5
      }
    );

    console.log(
      "Retrieved schema chunks:",
      retrievalResponse.data.results?.length || 0
    );

    const [rows, fields] = await connection.execute(query);
    
    // Always close the connection when done
    await connection.end();

    // 6. Return results
    return res.status(200).json({
      success: true,
      data: rows,
      schemaContext: retrievalResponse.data.results || []
    });

  } catch (error) {
    console.error("Query Execution Error:", error);
    
    // Check if it's a SQL syntax error vs a general server error
    if (error.code && error.sqlMessage) {
      return res.status(400).json({ 
        error: "SQL Execution Failed", 
        details: error.sqlMessage 
      });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
};