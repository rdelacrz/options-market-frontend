import axios from 'axios';

export const graphQLHttp = axios.create({
  baseURL: 'https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
