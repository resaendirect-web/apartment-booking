import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Controller pour vérifier l'état de santé de l'API
 */
const healthController = {
  /**
   * GET /api/v1/health
   * Vérifie l'état du serveur et de la base de données
   */
  check: async (req, res) => {
    try {
      // Test de connexion à la base de données
      await prisma.$queryRaw`SELECT 1`;

      const healthData = {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Apartment Booking API',
        version: process.env.API_VERSION || 'v1',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: {
          status: 'connected',
          type: 'PostgreSQL'
        },
        memory: {
          usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          unit: 'MB'
        }
      };

      res.status(200).json(healthData);
    } catch (error) {
      console.error('Health check failed:', error);
      
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'Apartment Booking API',
        error: 'Database connection failed',
        database: {
          status: 'disconnected'
        }
      });
    }
  }
};

export default healthController;
