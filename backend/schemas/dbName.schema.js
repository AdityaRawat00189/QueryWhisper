import mongoose from "mongoose";

const dbNameSchema = new mongoose.Schema({
  dbCredential: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DbCredential',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  dbName: { 
    type: String, 
    required: true 
  },
});

const DbName = mongoose.model("DbName", dbNameSchema);

export default DbName;