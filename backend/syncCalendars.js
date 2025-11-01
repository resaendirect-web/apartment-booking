import ICAL from 'ical.js';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Service de synchronisation des calendriers iCal
 */
class CalendarSyncService {
  /**
   * Télécharge et parse un fichier iCal depuis une URL
   * @param {string} url - URL du fichier iCal
   * @returns {Promise<Object>} - Données parsées
   */
  async fetchAndParseIcal(url) {
    try {
      console.log(`📥 Fetching iCal from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const icalData = await response.text();
      
      // Parser le contenu iCal
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);
      
      return comp;
    } catch (error) {
      console.error(`❌ Error fetching iCal: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extrait les événements d'un calendrier iCal
   * @param {Object} icalComponent - Composant iCal parsé
   * @returns {Array} - Liste des événements
   */
  extractEvents(icalComponent) {
    const events = [];
    const vevents = icalComponent.getAllSubcomponents('vevent');
    
    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);
      
      const eventData = {
        summary: event.summary || 'No title',
        description: event.description || '',
        startDate: event.startDate ? event.startDate.toJSDate() : null,
        endDate: event.endDate ? event.endDate.toJSDate() : null,
        externalId: event.uid || null,
        location: event.location || '',
        status: event.status || 'CONFIRMED'
      };
      
      // Valider les dates
      if (eventData.startDate && eventData.endDate) {
        events.push(eventData);
      }
    }
    
    return events;
  }

  /**
   * Synchronise un flux de calendrier spécifique
   * @param {string} feedId - ID du flux à synchroniser
   */
  async syncFeed(feedId) {
    console.log(`🔄 Starting sync for feed: ${feedId}`);
    
    try {
      // Récupérer le flux
      const feed = await prisma.calendarFeed.findUnique({
        where: { id: feedId },
        include: {
          unit: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      if (!feed) {
        throw new Error(`Feed not found: ${feedId}`);
      }
      
      if (!feed.isActive) {
        console.log(`⏭️  Feed is inactive, skipping: ${feed.name}`);
        return;
      }
      
      console.log(`📋 Syncing feed: ${feed.name} (${feed.source})`);
      console.log(`🏠 Unit: ${feed.unit.name}`);
      
      // Télécharger et parser le iCal
      const icalComponent = await this.fetchAndParseIcal(feed.url);
      const events = this.extractEvents(icalComponent);
      
      console.log(`📅 Found ${events.length} events`);
      
      // Supprimer les anciens événements de ce flux
      await prisma.calendarEvent.deleteMany({
        where: { feedId: feed.id }
      });
      
      console.log(`🗑️  Cleared old events`);
      
      // Créer les nouveaux événements
      const createdEvents = [];
      
      for (const eventData of events) {
        try {
          const createdEvent = await prisma.calendarEvent.create({
            data: {
              summary: eventData.summary,
              description: eventData.description,
              startDate: eventData.startDate,
              endDate: eventData.endDate,
              externalId: eventData.externalId,
              feedId: feed.id
            }
          });
          
          createdEvents.push(createdEvent);
        } catch (error) {
          console.error(`Error creating event: ${error.message}`);
        }
      }
      
      console.log(`✅ Created ${createdEvents.length} events`);
      
      // Mettre à jour le statut du flux
      await prisma.calendarFeed.update({
        where: { id: feed.id },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'SUCCESS',
          syncError: null
        }
      });
      
      console.log(`✅ Feed synced successfully: ${feed.name}`);
      
      return {
        success: true,
        feedName: feed.name,
        eventsCount: createdEvents.length
      };
      
    } catch (error) {
      console.error(`❌ Sync failed for feed ${feedId}:`, error);
      
      // Mettre à jour le statut d'erreur
      await prisma.calendarFeed.update({
        where: { id: feedId },
        data: {
          lastSyncAt: new Date(),
          syncStatus: 'ERROR',
          syncError: error.message
        }
      });
      
      throw error;
    }
  }

  /**
   * Synchronise tous les flux actifs
   */
  async syncAllFeeds() {
    console.log('🚀 Starting synchronization of all active feeds...\n');
    
    try {
      // Récupérer tous les flux actifs
      const feeds = await prisma.calendarFeed.findMany({
        where: { isActive: true },
        include: {
          unit: {
            select: {
              name: true
            }
          }
        }
      });
      
      console.log(`📊 Found ${feeds.length} active feed(s)\n`);
      
      if (feeds.length === 0) {
        console.log('ℹ️  No active feeds to sync');
        return { success: true, totalFeeds: 0, results: [] };
      }
      
      const results = [];
      
      // Synchroniser chaque flux
      for (const feed of feeds) {
        try {
          const result = await this.syncFeed(feed.id);
          results.push(result);
          console.log(''); // Ligne vide pour la lisibilité
        } catch (error) {
          results.push({
            success: false,
            feedName: feed.name,
            error: error.message
          });
          console.log(''); // Ligne vide pour la lisibilité
        }
      }
      
      // Résumé
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      console.log('═══════════════════════════════════');
      console.log('📊 SYNCHRONIZATION SUMMARY');
      console.log('═══════════════════════════════════');
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);
      console.log(`📅 Total events created: ${results.reduce((sum, r) => sum + (r.eventsCount || 0), 0)}`);
      console.log('═══════════════════════════════════\n');
      
      return {
        success: errorCount === 0,
        totalFeeds: feeds.length,
        successCount,
        errorCount,
        results
      };
      
    } catch (error) {
      console.error('❌ Fatal error during synchronization:', error);
      throw error;
    }
  }

  /**
   * Crée une réservation à partir d'un événement de calendrier
   * Détecte les conflits potentiels
   */
  async createBookingFromEvent(eventId) {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          feed: {
            include: {
              unit: true
            }
          }
        }
      });
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Vérifier s'il existe déjà une réservation liée
      if (event.bookingId) {
        console.log('⚠️  Event already linked to a booking');
        return null;
      }
      
      // TODO: Créer une réservation dans la base de données
      // Cela nécessiterait un compte invité par défaut ou une logique spécifique
      
      console.log('ℹ️  Booking creation from event is not yet implemented');
      return null;
      
    } catch (error) {
      console.error('Error creating booking from event:', error);
      throw error;
    }
  }
}

// =================================
// EXÉCUTION DU SCRIPT
// =================================

const syncService = new CalendarSyncService();

// Fonction principale
async function main() {
  try {
    await syncService.syncAllFeeds();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Lancer le script si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CalendarSyncService;
