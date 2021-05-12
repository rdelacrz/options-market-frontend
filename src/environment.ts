/**
 * Contains variables that vary across different environments.
 */

const environment = {
  useMockData: process.env.MOCK === 'true',
  providerApiKey: 'RZYFMBGY7U1C1Q296XJ3EKGS7GMQZ556V5',
};

export default environment;
