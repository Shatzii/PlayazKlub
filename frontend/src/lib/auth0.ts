import { withPageAuthRequired } from '@auth0/nextjs-auth0';

export { withPageAuthRequired };

// Auth0 configuration for PlayazKlub
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || 'dev-hi54vhznvyubj5yv.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || 'AtajoIu3cC5oJDFDiOG36SeHjgUu9OvB',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || 'AtajoIu3cC5oJDFDiOG36SeHjgUu9OvB',
  secret: process.env.AUTH0_SECRET || 'f5748c170ddd657163a7bc7ba7fe97241d4ad59e8a56c017ebbf0456097434a4',
};

// Custom session helper
export const getSession = async () => {
  // This will be implemented with proper Auth0 session handling
  return null;
};