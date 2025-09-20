// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {
    // Register custom routes
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Add custom route for testing
    strapi.server.routes([
      {
        method: 'GET',
        path: '/api/test-podcasts',
        handler: async (ctx) => {
          try {
            const results = await strapi.db.query('api::podcast.podcast').findMany({
              populate: true,
            });

            ctx.body = {
              data: results,
              meta: {
                pagination: {
                  page: 1,
                  pageSize: results.length,
                  pageCount: 1,
                  total: results.length,
                },
              },
            };
          } catch (error) {
            ctx.body = {
              error: 'Failed to fetch podcasts',
              details: error.message,
            };
          }
        },
        config: {
          auth: false,
          policies: [],
          middlewares: [],
        },
      },
    ]);
  },
};
