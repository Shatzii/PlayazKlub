export default () => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
  // Auth0 integration will be handled through custom implementation
  // For now, we'll use Strapi's built-in auth with Auth0-style configuration
});