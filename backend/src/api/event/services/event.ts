/**
 * event service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::event.event', ({ strapi }) => ({
  // Check if user has purchased access to a specific event
  async checkUserAccess(eventId: string, userEmail: string): Promise<boolean> {
    try {
      // Look for completed purchase record
      const purchase = await strapi.db.query('api::ppv-purchase.ppv-purchase').findOne({
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
      const purchase = await strapi.entityService.create('api::ppv-purchase.ppv-purchase', {
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
      const purchase = await strapi.db.query('api::ppv-purchase.ppv-purchase').findOne({
        where: {
          stripeSessionId,
          status: 'pending'
        }
      });

      if (!purchase) {
        throw new Error('Purchase record not found');
      }

      // Update purchase status
      await strapi.entityService.update('api::ppv-purchase.ppv-purchase', purchase.id, {
        data: {
          status: 'completed'
        }
      });

      // Grant access in OwnCast
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
      const owncastUrl = process.env.OWNCAST_URL;
      const adminUser = process.env.OWNCAST_ADMIN_USER;
      const adminPass = process.env.OWNCAST_ADMIN_PASS;

      if (!owncastUrl || !adminUser || !adminPass) {
        throw new Error('OwnCast configuration missing');
      }

      // Create auth credentials
      const credentials = Buffer.from(`${adminUser}:${adminPass}`).toString('base64');

      // Grant user access via OwnCast admin API
      const response = await fetch(`${owncastUrl}/api/admin/access`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userDisplayName: userEmail.split('@')[0],
          userEmail: userEmail,
          accessLevel: 'viewer',
          eventId: eventId
        })
      });

      if (!response.ok) {
        throw new Error(`OwnCast API error: ${response.statusText}`);
      }

      strapi.log.info(`Granted OwnCast access for ${userEmail} to event ${eventId}`);
      return true;
    } catch (error) {
      strapi.log.error('Error granting OwnCast access:', error);
      throw error;
    }
  }
}));