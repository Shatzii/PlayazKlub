import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::podcast.podcast', ({ strapi }) => ({
  async test(ctx) {
    ctx.send({
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      data: [
        {
          id: 1,
          title: 'Test Podcast',
          description: 'This is a test podcast to verify API connectivity',
          audioUrl: 'https://example.com/test.mp3',
          publishDate: '2025-01-01',
          duration: 300,
        },
      ],
    });
  },
}));