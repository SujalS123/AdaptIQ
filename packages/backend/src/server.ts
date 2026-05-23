import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectMongoDB } from './config/mongodb';
import { connectRedis } from './config/redis';
import { connectKafka } from './config/kafka';
import { initWebSocketServer } from './websocket/index';
import { UserRepo } from './repositories/UserRepo';

const bootstrap = async () => {
  console.log('🚀 Bootstrapping AdaptIQ Express Backend Server...');

  // Initialize DB & Message Broker connections
  await connectMongoDB();
  
  // Seed the live database with demo accounts
  const userRepo = new UserRepo();
  await userRepo.seedMockUsers();

  await connectRedis();
  await connectKafka();

  // Create unified HTTP + WebSocket Server
  const server = http.createServer(app);
  initWebSocketServer(server);

  server.listen(env.PORT, () => {
    console.log(`💚 Server running in [${env.NODE_ENV}] mode on http://localhost:${env.PORT}`);
    console.log(`🔌 WebSockets handler enabled at ws://localhost:${env.PORT}/ws/nova`);
  });
};

bootstrap().catch((error) => {
  console.error('💥 Critical error during server bootstrap:', error);
  process.exit(1);
});
