import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  Express Server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Products API: http://localhost:${PORT}/api/products`);
  console.log(`=================================================`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    
    try {
      await prisma.$disconnect();
      console.log('Prisma Client disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
