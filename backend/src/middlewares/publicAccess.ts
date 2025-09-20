export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Allow public access to podcast API
    if (ctx.url.startsWith('/api/podcasts')) {
      ctx.state.auth = true; // Bypass authentication
      return next();
    }
    return next();
  };
};