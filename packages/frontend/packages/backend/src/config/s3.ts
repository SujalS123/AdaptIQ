import { env } from './env';

export const uploadToS3 = async (fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> => {
  console.log(`[Mock S3 Upload] File: ${fileName}, Type: ${mimeType}, Size: ${fileBuffer.length} bytes`);
  // Return a mock URL path which maps to local backend assets or mock servers
  return `/uploads/${Date.now()}-${fileName}`;
};
