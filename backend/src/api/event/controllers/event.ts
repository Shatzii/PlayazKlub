/**
 * event controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::event.event', ({ strapi }) => ({
  // Find all events with public information
  async find(ctx) {
    const { query } = ctx;
    
    // Populate necessary fields but exclude private stream key
    const entities = await strapi.entityService.findMany('api::event.event', {
      ...query,
      populate: {
        featuredImage: true,
      },
      fields: ['id', 'title', 'description', 'shortDescription', 'eventDate', 'duration', 'isPPV', 'isLive', 'streamStatus', 'price', 'category', 'tags', 'maxViewers', 'recordingAvailable', 'slug']
    });

    return this.transformResponse(entities);
  },

  // Find one event by ID or slug
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.entityService.findOne('api::event.event', id, {
      ...query,
      populate: {
        featuredImage: true,
      },
      fields: ['id', 'title', 'description', 'shortDescription', 'eventDate', 'duration', 'isPPV', 'isLive', 'streamStatus', 'price', 'category', 'tags', 'maxViewers', 'recordingAvailable', 'slug']
    });

    return this.transformResponse(entity);
  },

  // Custom route to check if user has access to PPV event
  async checkAccess(ctx) {
    const { id } = ctx.params;
    const userEmail = ctx.state.user?.email;

    if (!userEmail) {
      return ctx.unauthorized('Authentication required');
    }

    try {
      // Check if user has purchased access to this event
      const hasAccess = await strapi.service('api::event.event').checkUserAccess(id, userEmail);
      
      return { hasAccess, eventId: id };
    } catch (error) {
      strapi.log.error('Error checking event access:', error);
      return ctx.internalServerError('Error checking access');
    }
  },

  // Get live stream URL for authenticated users with access
  async getStreamUrl(ctx) {
    const { id } = ctx.params;
    const userEmail = ctx.state.user?.email;

    if (!userEmail) {
      return ctx.unauthorized('Authentication required');
    }

    try {
      const event = await strapi.entityService.findOne('api::event.event', id);
      
      if (!event) {
        return ctx.notFound('Event not found');
      }

      // Check if user has access
      const hasAccess = await strapi.service('api::event.event').checkUserAccess(id, userEmail);
      
      if (!hasAccess) {
        return ctx.forbidden('Access denied. Purchase required.');
      }

      if (event.streamStatus !== 'live') {
        return ctx.badRequest('Event is not currently live');
      }

      // Return OwnCast stream URL
      const streamUrl = `${process.env.OWNCAST_URL}/hls/stream.m3u8`;
      
      return { streamUrl, eventId: id };
    } catch (error) {
      strapi.log.error('Error getting stream URL:', error);
      return ctx.internalServerError('Error getting stream URL');
    }
  }
}));