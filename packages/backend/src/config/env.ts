import dotenv from 'dotenv';
import path from 'path';

// Load env vars from root if in development
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/adaptiq',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || 'adaptiq-backend',
  AI_ENGINE_PORT: parseInt(process.env.AI_ENGINE_PORT || '8000', 10),
  AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'adaptiq-assets',
};
