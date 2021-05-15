/**
 * Module responsible for getting price data from Uniswap.
 */

import { ChainId, Fetcher, Token, Route, WETH } from '@uniswap/sdk';
import { TokenData } from '@models';
import { provider } from '@utilities';

// Token for USDC, pegged to the US dollar
const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6);

export async function getUSDPrice(tokenData: TokenData) {
  let route: Route;

  // If token is WETH itself, gets route to USDC pair directly
  if (tokenData.symbol !== WETH[ChainId.MAINNET].symbol) {
    const token = new Token(ChainId.MAINNET, tokenData.id, tokenData.decimals, tokenData.symbol, tokenData.name);
    const wethUSDCPair = await Fetcher.fetchPairData(WETH[ChainId.MAINNET], USDC, provider);
    const tokenWethPair = await Fetcher.fetchPairData(token, WETH[ChainId.MAINNET], provider);
    route = new Route([wethUSDCPair, tokenWethPair], USDC);
  } else {
    const tokenWethPair = await Fetcher.fetchPairData(WETH[ChainId.MAINNET], USDC, provider);
    route = new Route([tokenWethPair], USDC);
  }
	
  return Number(route.midPrice.invert().toSignificant(2));
}