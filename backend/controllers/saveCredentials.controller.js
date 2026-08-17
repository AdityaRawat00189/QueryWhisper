import crypto from 'crypto';

import DbCredential from '../schemas/dbCredential.schema.js';
import User from '../schemas/user.schema.js';
import createConnection from '../config/sqlConnection.js';
import DbName from '../schemas/dbName.schema.js';

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

function encryptPassword(plainTextPassword, secretKeyHex) {
  // Convert your hex master key from .env back into a 32-byte Buffer
  const secretKey = Buffer.from(secretKeyHex, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  
  let encrypted = cipher.update(plainTextPassword, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag,
    encryptedPassword: encrypted
  };
}

export const saveCredentials = async (req, res) => {
  try {
    // 1. Auth Check
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized request." });
    }
    const userId = req.user._id;
    const { environment, dbUser, dbHost, dbName, dbPort, password } = req.body;

    // 2. Validation MUST happen before we try to use the variables
    if (!password || !environment || !dbUser || !dbHost || !dbName || !dbPort) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 3. Test the SQL Connection (wrapped in try/catch to catch bad passwords)
    const dbConfig = {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: password,
      database: dbName
    };

    try {
      const connection = await createConnection(dbConfig);
      if (!connection) {
        return res.status(400).json({ error: "Failed to establish database connection." });
      }
      await connection.end(); // Close the test connection
    } catch (connectionError) {
      // If the user provides a wrong password or host, it fails here cleanly
      return res.status(400).json({ 
        error: "Could not connect to the database with the provided credentials.",
        details: connectionError.message 
      });
    }

    // 4. Encrypt the plaintext password
    const masterKey = process.env.MASTER_KEY_HEX;
    if (!masterKey) {
      throw new Error("MASTER_KEY_HEX is missing from environment variables.");
    }
    const cryptographicData = encryptPassword(password, masterKey);

    // 5. Construct the credential document
    const newCredential = new DbCredential({ 
      environment, 
      user: userId, 
      dbUser, 
      dbHost,
      dbPort,
      encryptedPassword: cryptographicData.encryptedPassword,
      iv: cryptographicData.iv,
      authTag: cryptographicData.authTag
    });

    // 6. Save to MongoDB
    await newCredential.save();

    // 7. Save DbName (Ensure DbName is imported at the top!)
    const newDb = await DbName.create({
      dbCredential: newCredential._id, // Save the reference ID, not the whole object
      user: userId,
      dbName
    });

    return res.status(201).json({
      message: "Database credentials encrypted and stored successfully.",
      credentialId: newCredential._id
    });

  } catch (error) {
    console.error("Error saving credentials:", error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: `Credentials for the environment '${req.body.environment}' already exist.` 
      });
    }
    
    return res.status(500).json({ error: "Internal server error." });
  }
}