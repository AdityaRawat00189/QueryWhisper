import crypto from 'crypto';
import DbName from "../schemas/dbName.schema.js";
import DbCredential from "../schemas/dbCredential.schema.js";
import createConnection from "../config/sqlConnection.js";

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

export const allDatabase = async (req, res) => {
  try {
    const userId = req.user._id;

    // SECURITY: Use .select() to prevent leaking internal fields (like _id, __v, or references)
    const databases = await DbName.find({ user: userId }).select('dbName createdAt');

    // FIX: 200 OK is the correct status code for a successful retrieval, not 201 Created
    return res.status(200).json({ message: "success", databases });

  } catch (error) {
    console.error("[allDatabase] Error:", error);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};

export const addDatabase = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dbName } = req.body;

    // 1. INPUT VALIDATION: Prevent injection attacks
    if (!dbName || typeof dbName !== 'string') {
      return res.status(400).json({ error: "Database name is required and must be a string." });
    }
    
    // Sanitize database name (allows only alphanumeric characters and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      return res.status(400).json({ error: "Invalid database name format." });
    }

    // 2. EXISTENCE CHECK: Prevent TypeError if user has no credentials
    const dbCredential = await DbCredential.findOne({ user: userId });
    if (!dbCredential) {
      return res.status(404).json({ error: "Database credentials not found for this user." });
    }

    // 3. SECURE DECRYPTION
    let plainTextPassword;
    try {
      plainTextPassword = decryptPassword(
        dbCredential.encryptedPassword,
        dbCredential.iv,
        dbCredential.authTag,
        process.env.MASTER_KEY_HEX
      );
    } catch (decryptionError) {
      console.error("[addDatabase] Decryption failed:", decryptionError);
      return res.status(500).json({ error: "Failed to decrypt database credentials." });
    }

    const dbConfig = {
      host: dbCredential.dbHost,
      port: dbCredential.dbPort,
      user: dbCredential.dbUser,
      password: plainTextPassword,
      database: dbName,
    };

    // 4. SECURE CONNECTION HANDLING
    let connection;
    try {
      connection = await createConnection(dbConfig);
      if (!connection) throw new Error("Connection object returned null.");
    } catch (dbError) {
      console.error("[addDatabase] Database connection failed:", dbError.message);
      return res.status(401).json({ error: "Failed to connect to the database. Verify the database name exists and credentials are correct." });
    } finally {
      // SECURITY: Ensure connection is ALWAYS closed, even if an error is thrown
      if (connection && typeof connection.end === 'function') {
        await connection.end();
      }
    }

    // 5. DUPLICATE CHECK: Avoid saving the same database twice
    const existingDb = await DbName.findOne({ user: userId, dbName });
    if (existingDb) {
      return res.status(409).json({ error: "This database is already registered to your account." });
    }

    // 6. SAVE AND SANITIZE RESPONSE
    const result = await DbName.create({
      dbCredential: dbCredential._id, // Better to store the reference ID, not the whole object
      user: userId,
      dbName
    });

    // Send back only what the frontend needs to see
    return res.status(201).json({
      message: "Success",
      result: {
        id: result._id,
        dbName: result.dbName,
      }
    });

  } catch (error) {
    console.error("[addDatabase] Error:", error);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};