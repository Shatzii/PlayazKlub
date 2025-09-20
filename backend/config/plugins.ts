export default () => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      allowRegister: true,
      ratesLimit: {
        interval: 60000,
        max: 100,
      },
    },
  },
});