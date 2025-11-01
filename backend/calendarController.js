import { PrismaClient } from '@prisma/client';
import CalendarSyncService from '../scripts/syncCalendars.js';
import ICAL from 'ical.js';

const prisma = new PrismaClient();
const syncService = new CalendarSyncService();

const calendarController = {
  /**
   * GET /api/v1/calendars/feeds
   * Récupérer tous les flux de calendrier
   */
  getAllFeeds: async (req, res) => {
    try {
      const { unitId, source, isActive } = req.query;
      
      const where = {
        ...(unitId && { unitId }),
        ...(source && { source }),
        ...(isActive !== undefined && { isActive: isActive === 'true' })
      };
      
      // Si l'utilisateur est un propriétaire, filtrer par ses unités
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
      
      const feeds = await prisma.calendarFeed.findMany({
        where,
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: { events: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: feeds
      });
    } catch (error) {
      console.error('Get feeds error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calendar feeds'
      });
    }
  },

  /**
   * GET /api/v1/calendars/feeds/:id
   * Récupérer un flux par ID
   */
  getFeedById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const feed = await prisma.calendarFeed.findUnique({
        where: { id },
        include: {
          unit: {
            include: {
              property: true
            }
          },
          events: {
            orderBy: { startDate: 'asc' },
            take: 100
          }
        }
      });
      
      if (!feed) {
        return res.status(404).json({
          success: false,
          error: 'Calendar feed not found'
        });
      }
      
      // Vérifier les permissions
      if (req.user.role === 'OWNER') {
        const isOwner = feed.unit.property.ownerId === req.user.id;
        if (!isOwner) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view this feed'
          });
        }
      }
      
      res.json({
        success: true,
        data: feed
      });
    } catch (error) {
      console.error('Get feed error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calendar feed'
      });
    }
  },

  /**
   * POST /api/v1/calendars/feeds
   * Créer un nouveau flux de calendrier
   */
  createFeed: async (req, res) => {
    try {
      const { name, url, source, unitId } = req.body;
      
      if (!name || !url || !source || !unitId) {
        return res.status(400).json({
          success: false,
          error: 'Name, URL, source, and unitId are required'
        });
      }
      
      // Vérifier que l'unité existe et appartient à l'utilisateur
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
      
      if (req.user.role === 'OWNER' && unit.property.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to add feed to this unit'
        });
      }
      
      // Créer le flux
      const feed = await prisma.calendarFeed.create({
        data: {
          name,
          url,
          source,
          unitId,
          isActive: true
        },
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
      
      // Lancer une synchronisation immédiate
      try {
        await syncService.syncFeed(feed.id);
      } catch (syncError) {
        console.error('Initial sync failed:', syncError);
      }
      
      res.status(201).json({
        success: true,
        data: feed,
        message: 'Calendar feed created and initial sync started'
      });
    } catch (error) {
      console.error('Create feed error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create calendar feed'
      });
    }
  },

  /**
   * PUT /api/v1/calendars/feeds/:id
   * Mettre à jour un flux de calendrier
   */
  updateFeed: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url, source, isActive } = req.body;
      
      const feed = await prisma.calendarFeed.findUnique({
        where: { id },
        include: {
          unit: {
            include: { property: true }
          }
        }
      });
      
      if (!feed) {
        return res.status(404).json({
          success: false,
          error: 'Calendar feed not found'
        });
      }
      
      // Vérifier les permissions
      if (req.user.role === 'OWNER' && feed.unit.property.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this feed'
        });
      }
      
      const updatedFeed = await prisma.calendarFeed.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(url && { url }),
          ...(source && { source }),
          ...(isActive !== undefined && { isActive })
        }
      });
      
      res.json({
        success: true,
        data: updatedFeed
      });
    } catch (error) {
      console.error('Update feed error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update calendar feed'
      });
    }
  },

  /**
   * DELETE /api/v1/calendars/feeds/:id
   * Supprimer un flux de calendrier
   */
  deleteFeed: async (req, res) => {
    try {
      const { id } = req.params;
      
      const feed = await prisma.calendarFeed.findUnique({
        where: { id },
        include: {
          unit: {
            include: { property: true }
          }
        }
      });
      
      if (!feed) {
        return res.status(404).json({
          success: false,
          error: 'Calendar feed not found'
        });
      }
      
      // Vérifier les permissions
      if (req.user.role === 'OWNER' && feed.unit.property.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this feed'
        });
      }
      
      await prisma.calendarFeed.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Calendar feed deleted successfully'
      });
    } catch (error) {
      console.error('Delete feed error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete calendar feed'
      });
    }
  },

  /**
   * POST /api/v1/calendars/feeds/:id/sync
   * Synchroniser manuellement un flux
   */
  syncFeed: async (req, res) => {
    try {
      const { id } = req.params;
      
      const feed = await prisma.calendarFeed.findUnique({
        where: { id },
        include: {
          unit: {
            include: { property: true }
          }
        }
      });
      
      if (!feed) {
        return res.status(404).json({
          success: false,
          error: 'Calendar feed not found'
        });
      }
      
      // Vérifier les permissions
      if (req.user.role === 'OWNER' && feed.unit.property.ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to sync this feed'
        });
      }
      
      // Lancer la synchronisation
      const result = await syncService.syncFeed(id);
      
      res.json({
        success: true,
        data: result,
        message: 'Calendar feed synchronized successfully'
      });
    } catch (error) {
      console.error('Sync feed error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to synchronize calendar feed',
        details: error.message
      });
    }
  },

  /**
   * POST /api/v1/calendars/sync-all
   * Synchroniser tous les flux actifs
   */
  syncAllFeeds: async (req, res) => {
    try {
      const result = await syncService.syncAllFeeds();
      
      res.json({
        success: result.success,
        data: result,
        message: 'Synchronization completed'
      });
    } catch (error) {
      console.error('Sync all feeds error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to synchronize calendar feeds'
      });
    }
  },

  /**
   * GET /api/v1/calendars/export/:unitId
   * Exporter le calendrier d'une unité au format iCal
   */
  exportCalendar: async (req, res) => {
    try {
      const { unitId } = req.params;
      
      // Récupérer toutes les réservations confirmées de l'unité
      const bookings = await prisma.booking.findMany({
        where: {
          unitId,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        include: {
          unit: {
            include: {
              property: true
            }
          },
          guest: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      // Créer un calendrier iCal
      const cal = new ICAL.Component(['vcalendar', [], []]);
      cal.updatePropertyWithValue('prodid', '-//Apartment Booking//Calendar//EN');
      cal.updatePropertyWithValue('version', '2.0');
      cal.updatePropertyWithValue('calscale', 'GREGORIAN');
      cal.updatePropertyWithValue('method', 'PUBLISH');
      
      // Ajouter chaque réservation comme événement
      for (const booking of bookings) {
        const vevent = new ICAL.Component('vevent');
        const event = new ICAL.Event(vevent);
        
        event.uid = booking.id;
        event.summary = `Réservation - ${booking.unit.property.name}`;
        event.description = `Réservation pour ${booking.guest.firstName} ${booking.guest.lastName}`;
        event.startDate = ICAL.Time.fromJSDate(booking.checkIn, false);
        event.endDate = ICAL.Time.fromJSDate(booking.checkOut, false);
        event.status = booking.status === 'CONFIRMED' ? 'CONFIRMED' : 'TENTATIVE';
        
        cal.addSubcomponent(vevent);
      }
      
      // Convertir en chaîne iCal
      const icalString = cal.toString();
      
      // Envoyer la réponse
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="calendar-${unitId}.ics"`);
      res.send(icalString);
      
    } catch (error) {
      console.error('Export calendar error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export calendar'
      });
    }
  }
};

export default calendarController;
