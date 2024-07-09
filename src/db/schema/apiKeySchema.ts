import mongoose, { Document, Schema } from "mongoose";

interface IAPIKey extends Document {
  apiKey: string;
  creationDate: Date;
  secretKey: string;
  randomStr: string;
}

const APIKeySchema: Schema<IAPIKey> = new Schema({
  apiKey: { type: String, required: true, unique: true },
  creationDate: { type: Date, default: Date.now },
  secretKey: { type: String, required: true },
  randomStr: { type: String, required: true },
});

const APIKey = mongoose.model<IAPIKey>("APIKey", APIKeySchema);

export default APIKey;
