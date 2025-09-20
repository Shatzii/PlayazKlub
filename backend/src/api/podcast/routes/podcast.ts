export default {
  routes: [
    {
      method: 'GET',
      path: 'podcasts',
      handler: 'podcast.find',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: 'test-podcasts',
      handler: 'podcast.test',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: 'podcasts/:id',
      handler: 'podcast.findOne',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/podcasts',
      handler: 'podcast.create',
      config: {
        policies: ['global::is-authenticated'],
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
        policies: ['global::is-authenticated'],
        middlewares: [],
      },
    },
  ],
};