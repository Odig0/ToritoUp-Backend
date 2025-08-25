import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ToritoUp Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
      },
      blockchain: {
        network: 'sepolia',
        rpcUrl: process.env.SEPOLIA_RPC_URL ? 'configured' : 'not configured',
        privateKey: process.env.PRIVATE_KEY ? 'configured' : 'not configured',
      },
      database: {
        mongoUrl: process.env.MONGO_URL ? 'configured' : 'not configured',
      }
    };
  }

  @Get('simple')
  simpleCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}