export default {
  routes: [
    {
      method: 'GET',
      path: '/videos',
      handler: 'video.find',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/videos/:id',
      handler: 'video.findOne',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/videos/upload',
      handler: 'video.upload',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/videos/me',
      handler: 'video.findMine',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};