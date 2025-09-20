/**
 * video controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::video.video', ({ strapi }) => ({
  // Upload video with metadata
  async upload(ctx) {
    try {
      const { title, description, isPublic, tags } = ctx.request.body;
      const { videoFile, thumbnail } = ctx.request.files;

      if (!videoFile) {
        return ctx.badRequest('Video file is required');
      }

      // Upload files to Strapi media library
      const uploadedVideo = await strapi.plugins.upload.services.upload.upload({
        data: {},
        files: {
          file: videoFile,
          path: videoFile.path,
          name: videoFile.name,
          type: videoFile.type,
          size: videoFile.size,
        },
      });

      let uploadedThumbnail = null;
      if (thumbnail) {
        uploadedThumbnail = await strapi.plugins.upload.services.upload.upload({
          data: {},
          files: {
            file: thumbnail,
            path: thumbnail.path,
            name: thumbnail.name,
            type: thumbnail.type,
            size: thumbnail.size,
          },
        });
      }

      // Create video record
      const video = await strapi.entityService.create('api::video.video', {
        data: {
          title,
          description,
          videoFile: uploadedVideo[0].id,
          thumbnail: uploadedThumbnail ? uploadedThumbnail[0].id : null,
          isPublic: isPublic !== undefined ? isPublic : true,
          tags: tags ? JSON.parse(tags) : null,
          uploadDate: new Date(),
        },
        populate: ['videoFile', 'thumbnail'],
      });

      return this.transformResponse(video);
    } catch (error) {
      strapi.log.error('Error uploading video:', error);
      return ctx.internalServerError('Error uploading video');
    }
  },

  // Get user's videos
  async findMine(ctx) {
    const userEmail = ctx.state.user?.email;

    if (!userEmail) {
      return ctx.unauthorized('Authentication required');
    }

    const entities = await strapi.entityService.findMany('api::video.video', {
      filters: {
        // Add user filter when user field is added
      },
      populate: ['videoFile', 'thumbnail'],
      sort: { uploadDate: 'desc' },
    });

    return this.transformResponse(entities);
  },
}));