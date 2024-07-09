import crypto from "crypto";
import APIKey from "./db/schema/apiKeySchema";

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const generateAPIKey = (
  secretKey: string
): { apiKey: string; creationDate: Date; randomStr: string } => {
  const creationDate = new Date();
  const randomStr = generateRandomString(16);
  const dataToEncrypt =
    creationDate.toISOString() + secretKey.slice(0, 3) + randomStr;

  const cipher = crypto.createCipher("aes-256-cbc", secretKey);
  let encrypted = cipher.update(dataToEncrypt, "utf8", "hex");
  encrypted += cipher.final("hex");

  return { apiKey: encrypted, creationDate, randomStr };
};

export const saveAPIKey = async (secretKey: string): Promise<void> => {
  const { apiKey, creationDate, randomStr } = generateAPIKey(secretKey);

  const newAPIKey = new APIKey({
    apiKey,
    creationDate,
    secretKey,
    randomStr,
  });

  await newAPIKey.save();
};

export const isValidAPIKey = async (
  apiKey: string,
  secretKey: string
): Promise<boolean> => {
  try {
    const apiKeyRecord = await APIKey.findOne({ apiKey });
    if (!apiKeyRecord) {
      return false;
    }

    const decipher = crypto.createDecipher("aes-256-cbc", secretKey);
    let decrypted = decipher.update(apiKey, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const expectedData =
      apiKeyRecord.creationDate.toISOString() +
      secretKey.slice(0, 3) +
      apiKeyRecord.randomStr;

    return decrypted === expectedData;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
};
