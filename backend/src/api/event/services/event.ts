// @ts-nocheck
/**
 * event service
 */

import { factories } from '@strapi/strapi'

const EVENT_CONTENT_TYPE = 'api::event.event';
const PPV_PURCHASE_CONTENT_TYPE = 'api::ppv-purchase.ppv-purchase';

// @ts-ignore
export default factories.createCoreService(EVENT_CONTENT_TYPE, ({ strapi }) => ({
  // Check if user has purchased access to a specific event
  async checkUserAccess(eventId: string, userEmail: string): Promise<boolean> {
    try {
      // Look for completed purchase record
      // @ts-ignore
      const purchase = await strapi.db.query(PPV_PURCHASE_CONTENT_TYPE).findOne({
        where: {
          eventId: eventId,
          userEmail: userEmail,
          status: 'completed'
        }
      });

      return !!purchase;
    } catch (error) {
      strapi.log.error('Error checking user access:', error);
      return false;
    }
  },

  // Create PPV purchase record
  async createPurchase(eventId: string, userEmail: string, stripeSessionId: string) {
    try {
      // @ts-ignore
      const purchase = await strapi.entityService.create(PPV_PURCHASE_CONTENT_TYPE, {
        data: {
          eventId,
          userEmail,
          stripeSessionId,
          status: 'pending',
          purchaseDate: new Date().toISOString()
        }
      });

      return purchase;
    } catch (error) {
      strapi.log.error('Error creating purchase record:', error);
      throw error;
    }
  },

  // Complete purchase and grant OwnCast access
  async completePurchase(stripeSessionId: string) {
    try {
      // Find the pending purchase
      // @ts-ignore
      const purchase = await strapi.db.query(PPV_PURCHASE_CONTENT_TYPE).findOne({
        where: {
          stripeSessionId,
          status: 'pending'
        }
      });

      if (!purchase) {
        throw new Error('Purchase record not found');
      }

      // Update purchase status
      // @ts-ignore
      await strapi.entityService.update(PPV_PURCHASE_CONTENT_TYPE, purchase.id, {
        data: {
          status: 'completed'
        }
      });

      // Grant access in OwnCast
      // @ts-ignore
      await this.grantOwnCastAccess(purchase.eventId, purchase.userEmail);

      return purchase;
    } catch (error) {
      strapi.log.error('Error completing purchase:', error);
      throw error;
    }
  },

  // Grant access to OwnCast stream
  async grantOwnCastAccess(eventId: string, userEmail: string) {
    try {
      // TODO: Implement OwnCast API integration
      // This would typically make an API call to OwnCast to grant access
      strapi.log.info(`Granting OwnCast access for event ${eventId} to user ${userEmail}`);
      
      // For now, just log the action
      return true;
    } catch (error) {
      strapi.log.error('Error granting OwnCast access:', error);
      throw error;
    }
  }
}));