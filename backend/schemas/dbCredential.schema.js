import mongoose from "mongoose";

const DbCredentialSchema = new mongoose.Schema({
  environment: { type: String, required: true, unique: true }, // e.g., 'production', 'staging'
  user: { type: mongoose.Schema.Types.ObjectId , required: true},
  dbUser: { type: String, required: true },
  dbHost: { type: String, required: true },
  dbPort: { type: Number, required: true},
  encryptedPassword: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true }
});

const DbCredential = mongoose.model('DbCredential', DbCredentialSchema);

export default DbCredential;