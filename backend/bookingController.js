import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bookingController = {
  /**
   * GET /api/v1/bookings
   * Récupérer toutes les réservations (admin/owner)
   */
  getAll: async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const where = {
        ...(status && { status })
      };
      
      // Si l'utilisateur est un propriétaire, filtrer par ses propriétés
      if (req.user.role === 'OWNER') {
        const ownedUnits = await prisma.unit.findMany({
          where: {
            property: {
              ownerId: req.user.id
            }
          },
          select: { id: true }
        });
        
        where.unitId = {
          in: ownedUnits.map(u => u.id)
        };
      }
      
      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            unit: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.count({ where })
      ]);
      
      res.json({
        success: true,
        data: bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings'
      });
    }
  },

  /**
   * GET /api/v1/bookings/my-bookings
   * Récupérer les réservations de l'utilisateur connecté
   */
  getMyBookings: async (req, res) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          guestId: req.user.id
        },
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get my bookings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch your bookings'
      });
    }
  },

  /**
   * GET /api/v1/bookings/:id
   * Récupérer une réservation par ID
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          unit: {
            include: {
              property: true
            }
          }
        }
      });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }
      
      // Vérifier les permissions
      if (booking.guestId !== req.user.id && req.user.role !== 'ADMIN') {
        // Vérifier si l'utilisateur est le propriétaire de la propriété
        const isOwner = booking.unit.property.ownerId === req.user.id;
        
        if (!isOwner) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view this booking'
          });
        }
      }
      
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking'
      });
    }
  },

  /**
   * POST /api/v1/bookings
   * Créer une nouvelle réservation
   */
  create: async (req, res) => {
    try {
      const {
        unitId,
        checkIn,
        checkOut,
        numGuests,
        guestNotes
      } = req.body;
      
      // Vérifier que l'unité existe
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
        include: { property: true }
      });
      
      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }
      
      // Vérifier la capacité
      if (numGuests > unit.maxGuests) {
        return res.status(400).json({
          success: false,
          error: `Maximum ${unit.maxGuests} guests allowed`
        });
      }
      
      // Vérifier les dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (checkInDate >= checkOutDate) {
        return res.status(400).json({
          success: false,
          error: 'Check-out date must be after check-in date'
        });
      }
      
      if (checkInDate < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Check-in date cannot be in the past'
        });
      }
      
      // Vérifier la disponibilité
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          unitId,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } }
              ]
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } }
              ]
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } }
              ]
            }
          ]
        }
      });
      
      if (conflictingBooking) {
        return res.status(409).json({
          success: false,
          error: 'Unit is not available for the selected dates'
        });
      }
      
      // Calculer le nombre de nuits
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      // Calculer le prix total
      const totalPrice = (unit.basePrice * nights) + (unit.cleaningFee || 0);
      
      // Créer la réservation
      const booking = await prisma.booking.create({
        data: {
          unitId,
          guestId: req.user.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          numGuests,
          totalPrice,
          cleaningFee: unit.cleaningFee || 0,
          guestNotes,
          status: 'PENDING',
          source: 'DIRECT'
        },
        include: {
          unit: {
            include: {
              property: true
            }
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      
      // TODO: Envoyer un email de confirmation
      
      res.status(201).json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create booking'
      });
    }
  },

  /**
   * PUT /api/v1/bookings/:id/status
   * Mettre à jour le statut d'une réservation
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, ownerNotes } = req.body;
      
      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status,
          ...(ownerNotes && { ownerNotes })
        },
        include: {
          unit: {
            include: {
              property: true
            }
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      
      // TODO: Envoyer un email de notification
      
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update booking status'
      });
    }
  },

  /**
   * PUT /api/v1/bookings/:id/cancel
   * Annuler une réservation
   */
  cancel: async (req, res) => {
    try {
      const { id } = req.params;
      
      const booking = await prisma.booking.findUnique({
        where: { id }
      });
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }
      
      if (booking.guestId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to cancel this booking'
        });
      }
      
      if (booking.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          error: 'Booking is already cancelled'
        });
      }
      
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });
      
      res.json({
        success: true,
        data: updatedBooking,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel booking'
      });
    }
  },

  /**
   * DELETE /api/v1/bookings/:id
   * Supprimer une réservation (admin seulement)
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      await prisma.booking.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete booking'
      });
    }
  }
};

export default bookingController;
