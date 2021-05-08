import { DocumentNode } from 'graphql';
import { print } from 'graphql/language/printer';
import { MarketData } from '@models';
import { graphQLHttp } from '@utilities';

const getMarketsQuery = require('./queries/getMarket.graphql') as DocumentNode;

export const getMarkets = () => {
  const query = print(getMarketsQuery);
  return graphQLHttp.post<MarketData>('', JSON.stringify({query}));
}
