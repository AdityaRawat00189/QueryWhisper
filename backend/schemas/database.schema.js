import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

const ColumnSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    dataType: {
      type: String,
      required: true
    },

    columnType: {
      type: String,
      required: true
    },

    nullable: {
      type: Boolean,
      default: true
    },

    default: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    _id: false
  }
);

const ForeignKeySchema = new Schema(
  {
    column: {
      type: String,
      required: true
    },

    referencedTable: {
      type: String,
      required: true
    },

    referencedColumn: {
      type: String,
      required: true
    },

    constraintName: {
      type: String,
      required: true
    }
  },
  {
    _id: false
  }
);

const TableSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },

    columns: {
      type: [ColumnSchema],
      default: []
    },

    primaryKey: {
      type: [String],
      default: []
    },

    foreignKeys: {
      type: [ForeignKeySchema],
      default: []
    }
  },
  {
    _id: false
  }
);

const DatabaseSchema = new Schema(
  {
    connectionId: {
      type: Types.ObjectId,
      required: true
    },

    userId: {
      type: Types.ObjectId,
      required: true
    },

    databaseType: {
      type: String,
      enum: ["mysql", "postgres"],
      required: true
    },

    databaseName: {
      type: String,
      required: true
    },

    tables: {
      type: [TableSchema],
      default: []
    },

    extractedAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
);

// One schema document per DB connection
DatabaseSchema.index(
  { connectionId: 1 },
  { unique: true }
);

export default mongoose.model("DatabaseSchema", DatabaseSchema);