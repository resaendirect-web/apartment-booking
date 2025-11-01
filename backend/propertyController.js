import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const propertyController = {
  /**
   * GET /api/v1/properties
   * Récupérer toutes les propriétés
   */
  getAll: async (req, res) => {
    try {
      const { city, country, page = 1, limit = 10 } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where = {
        isActive: true,
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(country && { country: { contains: country, mode: 'insensitive' } })
      };
      
      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            units: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                type: true,
                basePrice: true,
                maxGuests: true
              }
            }
          }
        }),
        prisma.property.count({ where })
      ]);
      
      res.json({
        success: true,
        data: properties,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch properties'
      });
    }
  },

  /**
   * GET /api/v1/properties/:id
   * Récupérer une propriété par ID
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          units: {
            where: { isActive: true },
            include: {
              rates: {
                orderBy: { startDate: 'asc' }
              }
            }
          }
        }
      });
      
      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch property'
      });
    }
  },

  /**
   * POST /api/v1/properties
   * Créer une nouvelle propriété
   */
  create: async (req, res) => {
    try {
      const {
        name,
        description,
        address,
        city,
        country,
        zipCode,
        latitude,
        longitude,
        amenities,
        images
      } = req.body;
      
      const property = await prisma.property.create({
        data: {
          name,
          description,
          address,
          city,
          country,
          zipCode,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          amenities,
          images,
          ownerId: req.user.id
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      res.status(201).json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create property'
      });
    }
  },

  /**
   * PUT /api/v1/properties/:id
   * Mettre à jour une propriété
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier que l'utilisateur est propriétaire ou admin
      const property = await prisma.property.findUnique({
        where: { id }
      });
      
      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this property'
        });
      }
      
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: req.body
      });
      
      res.json({
        success: true,
        data: updatedProperty
      });
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update property'
      });
    }
  },

  /**
   * DELETE /api/v1/properties/:id
   * Supprimer une propriété
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const property = await prisma.property.findUnique({
        where: { id }
      });
      
      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this property'
        });
      }
      
      await prisma.property.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete property'
      });
    }
  },

  /**
   * GET /api/v1/properties/:id/availability
   * Vérifier la disponibilité d'une propriété
   */
  getAvailability: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      // TODO: Implémenter la logique de vérification de disponibilité
      
      res.json({
        success: true,
        message: 'Availability check (not fully implemented)'
      });
    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check availability'
      });
    }
  },

  /**
   * GET /api/v1/properties/:propertyId/units
   * Récupérer les unités d'une propriété
   */
  getUnits: async (req, res) => {
    try {
      const { propertyId } = req.params;
      
      const units = await prisma.unit.findMany({
        where: {
          propertyId,
          isActive: true
        },
        include: {
          rates: true
        }
      });
      
      res.json({
        success: true,
        data: units
      });
    } catch (error) {
      console.error('Get units error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch units'
      });
    }
  },

  /**
   * POST /api/v1/properties/:propertyId/units
   * Créer une nouvelle unité
   */
  createUnit: async (req, res) => {
    try {
      const { propertyId } = req.params;
      
      const unit = await prisma.unit.create({
        data: {
          ...req.body,
          propertyId
        }
      });
      
      res.status(201).json({
        success: true,
        data: unit
      });
    } catch (error) {
      console.error('Create unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create unit'
      });
    }
  },

  /**
   * PUT /api/v1/properties/:propertyId/units/:unitId
   * Mettre à jour une unité
   */
  updateUnit: async (req, res) => {
    try {
      const { unitId } = req.params;
      
      const unit = await prisma.unit.update({
        where: { id: unitId },
        data: req.body
      });
      
      res.json({
        success: true,
        data: unit
      });
    } catch (error) {
      console.error('Update unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update unit'
      });
    }
  },

  /**
   * DELETE /api/v1/properties/:propertyId/units/:unitId
   * Supprimer une unité
   */
  deleteUnit: async (req, res) => {
    try {
      const { unitId } = req.params;
      
      await prisma.unit.delete({
        where: { id: unitId }
      });
      
      res.json({
        success: true,
        message: 'Unit deleted successfully'
      });
    } catch (error) {
      console.error('Delete unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete unit'
      });
    }
  }
};

export default propertyController;
