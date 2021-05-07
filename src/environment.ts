/**
 * Contains variables that vary across different environments.
 */

const environment = {
  useMockData: process.env.MOCK === 'true',
};

export default environment;