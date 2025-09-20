export default {
  routes: [
    {
      method: 'GET',
      path: '/podcasts',
      handler: 'podcast.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/podcasts/:id',
      handler: 'podcast.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/podcasts',
      handler: 'podcast.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/podcasts/:id',
      handler: 'podcast.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/podcasts/:id',
      handler: 'podcast.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};