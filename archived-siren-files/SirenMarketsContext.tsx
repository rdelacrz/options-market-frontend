import React, { useState, useEffect, useCallback } from "react"
import { GraphQLClient } from "graphql-request"
import { BigNumber } from "bignumber.js"
import dayjs from "dayjs"
import { ethers, providers, utils } from "ethers"
import { useWeb3 } from "@chainsafe/web3-context"
import { GetMarkets, GetMarkets_markets } from "./types/GetMarkets"
import { TokenType } from "../types/graphql-global-types"
import Greeks from "greeks"

import {
  ERC20UpgradeSafeFactory,
  LPTokenFactory,
  MarketFactory,
  MinterAmmFactory,
  SimpleTokenFactory,
  StakingRewardsFactory,
} from "@sirenprotocol/sdk"
import {
  GetAccountBalance,
  GetAccountBalanceVariables,
  GetAccountBalance_accountBalances,
} from "./types/GetAccountBalance"
import {
  GetLiquidityPools,
  GetLiquidityPools_amms,
} from "./types/GetLiquidityPools"
import {
  accountBalanceQuery,
  liquidityPoolsQuery,
  marketsQuery,
} from "./graphQueries"
import { SIRewardDistributorFactory } from "../types/SIRewardDistributorFactory"
import { useLanguageContext } from "./LanguageContext"

export type Market = {
  marketAddress: string
  marketIndex: string
  ammAddress: string
  marketStyle: "American" | "European"
  collateralTokenAddress: string
  collateralTokenSymbol: string
  collateralTokenName: string
  collateralTokenDecimals: number
  paymentTokenAddress: string
  paymentTokenSymbol: string
  paymentTokenName: string
  paymentTokenDecimals: number
  wTokenAddress: string
  wTokenDecimals: number
  bTokenAddress: string
  bTokenDecimals: number
  pair: string
  type: "Call" | "Put"
  expiration: Date
  strike: number
  openInterest: number
  paymentPerCollateral: number
  premium: number
  roi: number
  status: "open" | "expired" | "closed"
  greeks: {
    delta: number
    gamma: number
    vega: number
    theta: number
    rho: number
  }
}

export type Position = Market & {
  bTokenBalance: BigNumber
  bTokenContracts: BigNumber
  wTokenBalance: BigNumber
  wTokenContracts: BigNumber
}

export type LiquidityPool = {
  address: string
  name: string
  userBalance?: BigNumber
  lpTokenAddress: string
  lpTokenDecimals: number
  lpTokenSupply: number
  collateralTokenAddress: string
  collateralTokenSymbol: string
  collateralTokenName: string
  collateralTokenDecimals: number
  paymentTokenAddress: string
  paymentTokenSymbol: string
  paymentTokenName: string
  paymentTokenDecimals: number
  depositLimit: number
  enforceDepositLimit: boolean
  totalPoolValue: number
  exchangeRate: number
  siRewards: number
}

export type SirenRewardsResponse = {
  claimedRewards: string
  claimableRewards: string
  claimMessage?: { r: string; s: string; v: number }
  recipient?: { amount: string; nonce: string; wallet: string }
  totalRewards: string
}

export type SirenRewards = {
  claimedRewards: number
  claimableRewards: number
  claimMessage?: { r: string; s: string; v: number }
  recipient?: { amount: string; nonce: string; wallet: string }
  totalRewards: number
}

export type SirenPool = {
  siDailyRewards: number
}

// TODO: this union is needed to make the pools response backwards compatible.
// Once the first sip-11 snapshot has been taken on April 29, 19:23:00 UTC
// we can remove the Array<string> type and any logic that checks for the
// different types (see below where the SirenPoolsResponse type gets used
// in the code)
export type SirenPoolsResponse = Record<string, SirenPool> | Array<string>

export type SirenMarketsContext = {
  disclaimerAccepted: boolean
  acceptDisclaimer(save: boolean): void
  markets: Market[]
  positions: Position[]
  pools: LiquidityPool[]
  buyOption(
    quantity: BigNumber,
    collateralMax: BigNumber,
    marketAddress: string,
  ): Promise<void>
  sellOption(
    quantity: BigNumber,
    collateralMin: BigNumber,
    marketAddress: string,
  ): Promise<void>
  exerciseOption(quantity: BigNumber, marketAddress: string): Promise<void>
  closePosition(quantity: BigNumber, marketAddress: string): Promise<void>
  withdrawCollateral(marketAddress: string): Promise<void>
  quoteBuyOption(
    quantity: BigNumber,
    marketAddress: string,
  ): Promise<BigNumber | void>
  quoteSellOption(
    quantity: BigNumber,
    marketAddress: string,
  ): Promise<BigNumber | void>
  quoteProvideCapital(
    collateralAmount: BigNumber,
    ammAddress: string,
  ): Promise<number | undefined>
  quoteWithdrawCapital(
    lpTokenAmount: BigNumber,
    ammAddress: string,
  ): Promise<{ bestCase: number; sellTokens: number } | undefined>
  provideCapital(
    collateralAmount: BigNumber,
    expectedLpTokens: number,
    ammAddress: string,
  ): Promise<void>
  withdrawCapital(
    lpTokenAmount: BigNumber,
    expectedCollateral: number,
    sellTokens: boolean,
    ammAddress: string,
  ): Promise<void>
  handleSelectWalletConnect(): void
  sirenRewards: SirenRewards
  refreshPortfolio(): void
  stake(amountToStake: string): void
  unstake(amountToUnstake: string): void
  claimRewards(): Promise<void>
  stakedBalance: BigNumber
  rewardsAvailable: BigNumber
  claimPool2Rewards(): Promise<void>
  siPrice: number
  poolAPY: number
  fetchPoolAssets(
    ammAddress: string,
  ): Promise<
    {
      name: string
      balance: BigNumber
    }[]
  >
}

type SirenMarketsProviderProps = {
  children: React.ReactNode | React.ReactNode[]
}

const SirenMarketsContext = React.createContext<
  SirenMarketsContext | undefined
>(undefined)

const SirenMarketsProvider = ({ children }: SirenMarketsProviderProps) => {
  const {
    address,
    provider,
    onboard,
    wallet,
    isReady,
    network,
    checkIsReady,
    tokens,
  } = useWeb3()
  const [subgraphClient, setSubgraphClient] = useState<
    GraphQLClient | undefined
  >(undefined)
  const { formatShortLocaleDate } = useLanguageContext()

  const slippage = 0.05

  const [markets, setMarkets] = useState<Market[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [pools, setPools] = useState<LiquidityPool[]>([])
  const [readProvider, setReadProvider] = useState<
    providers.Provider | undefined
  >()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [sirenRewards, setSirenRewards] = useState<SirenRewards>({
    totalRewards: 0,
    claimedRewards: 0,
    claimableRewards: 0,
  })

  const [rewardsAvailable, setRewardsAvailable] = useState(new BigNumber(0))
  const [stakedBalance, setStakedBalance] = useState(new BigNumber(0))
  const [siPrice, setSiPrice] = useState(0)
  const [poolAPY, setPoolAPY] = useState(0)

  // Initialize disclaimer
  useEffect(() => {
    const savedDisclaimer = !!localStorage.getItem("SIREN.DisclaimerAccepted")
    setDisclaimerAccepted(savedDisclaimer)
  }, [])

  // Automatic login handler
  useEffect(() => {
    const autoLogin = !!localStorage.getItem("onboard.selectedWallet")
    if (!isReady && wallet && autoLogin) {
      checkIsReady()
    }
    // eslint-disable-next-line
  }, [isReady, wallet])

  // Read provider initialization
  useEffect(() => {
    try {
      const networkId = network
        ? network
        : Number(process.env.REACT_APP_NETWORK_ID)
      const networkName = ethers.providers.getNetwork(networkId)
      const infuraId = process.env.REACT_APP_INFURA_KEY
      if (infuraId) {
        const newProvider = new ethers.providers.InfuraProvider(
          networkName,
          process.env.REACT_APP_INFURA_KEY,
        )

        setReadProvider(newProvider)
      }
    } catch (error) {
      console.log(error)
      setReadProvider(undefined)
    }
  }, [network])

  // Subgraph client initialization
  useEffect(() => {
    // Initialize g-ql and market contract here
    const subgraphUrl =
      process.env.REACT_APP_SUBGRAPH_URL ||
      "https://api.thegraph.com/subgraphs/name/sirenmarkets/protocol-rinkeby"
    const graphClient = new GraphQLClient(subgraphUrl)
    setSubgraphClient(graphClient)
  }, [])

  const processMarket = async (market: GetMarkets_markets): Promise<Market> => {
    const expiration = dayjs(market.expirationDate * 1000, {
      utc: true,
    }).toDate()

    const state: "open" | "expired" | "closed" = dayjs(expiration).isAfter(
      dayjs(),
    )
      ? "open"
      : dayjs(expiration).add(180, "day").isAfter(dayjs())
      ? "expired"
      : "closed"

    const collateralTokenDecimals = market.collateralToken?.decimals || 18
    const paymentTokenDecimals = market.paymentToken?.decimals || 18
    const split = market.marketName.split(".")

    const pair = `${split[1]} / ${split[0]}`

    const marketType = split[3].toUpperCase() === "C" ? "Call" : "Put"

    //TODO revert this code, and consider using a different separator for Market name parsing
    const strike =
      split[4][0] === "0"
        ? Number(`0.${split[4].substring(1)}`)
        : Number(split[4])

    const getAmmData = async () => {
      if (!market || !readProvider || !market.amm?.id)
        return { premium: 0, exchange: 0 }

      const ammContract = MinterAmmFactory.connect(market.amm?.id, readProvider)
      try {
        const price = await ammContract.getPriceForMarket(market.id)
        const exchange = await ammContract.getCurrentCollateralPrice()
        const annualizedVolatilityFactor = new BigNumber(
          (await ammContract.volatilityFactor()).toString(),
        )
          .multipliedBy(new BigNumber(365 * 24 * 60 * 60).sqrt())
          .div(0.4)
          .shiftedBy(-18)

        const exchangeScaled = new BigNumber(exchange.toString()).shiftedBy(
          collateralTokenDecimals - paymentTokenDecimals - 18,
        )
        const result =
          marketType === "Call"
            ? new BigNumber(price.toString())
                .shiftedBy(-18)
                .decimalPlaces(4)
                .toNumber()
            : new BigNumber(price.toString())
                .shiftedBy(-18)
                .multipliedBy(strike)
                .multipliedBy(exchangeScaled)
                .decimalPlaces(4)
                .toNumber()

        return {
          premium: result,
          exchange: exchangeScaled.toNumber(),
          annualizedVolatilityFactor: annualizedVolatilityFactor.toNumber(),
        }
      } catch (error) {
        return { premium: 0, exchange: 0 }
      }
    }

    const { premium, exchange, annualizedVolatilityFactor } = await getAmmData()
    const roi = (premium * 365) / dayjs(expiration).diff(dayjs(), "d")
    const openInterest = new BigNumber(market.bToken?.totalSupply || 0)
      .shiftedBy(-collateralTokenDecimals)
      .dividedBy(marketType === "Call" ? 1 : strike)
      .decimalPlaces(4)
      .toNumber()

    const yearsToExpiration = dayjs(expiration).diff(dayjs(), "year", true)
    const greeksValues = {
      delta: new BigNumber(
        Greeks.getDelta(
          marketType === "Call" ? exchange : 1 / exchange,
          strike,
          yearsToExpiration,
          annualizedVolatilityFactor,
          0,
          marketType.toLowerCase(),
        ),
      )
        .decimalPlaces(5)
        .toNumber(),
      gamma: new BigNumber(
        Greeks.getGamma(
          marketType === "Call" ? exchange : 1 / exchange,
          strike,
          yearsToExpiration,
          annualizedVolatilityFactor,
          0,
        ),
      )
        .decimalPlaces(5)
        .toNumber(),
      vega: new BigNumber(
        Greeks.getVega(
          marketType === "Call" ? exchange : 1 / exchange,
          strike,
          yearsToExpiration,
          annualizedVolatilityFactor,
          0,
        ),
      )
        .decimalPlaces(5)
        .toNumber(),
      theta: new BigNumber(
        Greeks.getTheta(
          marketType === "Call" ? exchange : 1 / exchange,
          strike,
          yearsToExpiration,
          annualizedVolatilityFactor,
          0,
          marketType.toLowerCase(),
        ),
      )
        .decimalPlaces(5)
        .toNumber(),
      rho: new BigNumber(
        Greeks.getRho(
          marketType === "Call" ? exchange : 1 / exchange,
          strike,
          yearsToExpiration,
          annualizedVolatilityFactor,
          0,
          marketType.toLowerCase(),
        ),
      )
        .decimalPlaces(5)
        .toNumber(),
    }

    return {
      marketAddress: market.id,
      type: marketType,
      marketIndex: market.marketIndex,
      ammAddress: market.amm?.id || "0x",
      marketStyle:
        market.marketStyle === "EUROPEAN_STYLE" ? "European" : "American",
      roi,
      bTokenAddress: market.bToken?.id || "0x",
      bTokenDecimals: market.bToken?.decimals || 0,
      wTokenAddress: market.wToken?.id || "0x",
      wTokenDecimals: market.wToken?.decimals || 0,
      expiration,
      collateralTokenAddress: market.collateralToken?.id || "0x",
      collateralTokenSymbol: market.collateralToken?.symbol || "",
      collateralTokenDecimals: market.collateralToken?.decimals || 0,
      collateralTokenName: market.collateralToken?.name || "",
      paymentTokenAddress: market.paymentToken?.id || "0x",
      paymentTokenSymbol: market.paymentToken?.symbol || "",
      paymentTokenDecimals: market.paymentToken?.decimals || 0,
      paymentTokenName: market.paymentToken?.name || "",
      openInterest,
      premium: premium,
      paymentPerCollateral: exchange,
      pair,
      strike,
      status: state,
      greeks: greeksValues,
    }
  }

  const processMarkets = async (
    markets: GetMarkets_markets[],
  ): Promise<Market[]> => {
    const result = Promise.all(markets.map((market) => processMarket(market)))
    return result
  }

  const processBalance = async (
    wTokenBalance: BigNumber,
    bTokenBalance: BigNumber,
    marketId: string,
    markets: Market[],
  ): Promise<Position> => {
    const marketData = markets.find((m) => m.marketAddress === marketId)
    if (!marketData) return Promise.reject("Invalid market")

    return {
      ...marketData,
      bTokenBalance: bTokenBalance,
      bTokenContracts:
        marketData.type === "Call"
          ? bTokenBalance
          : bTokenBalance
              .dividedBy(marketData.strike)
              .decimalPlaces(marketData.bTokenDecimals),
      wTokenBalance: wTokenBalance,
      wTokenContracts:
        marketData.type === "Call"
          ? wTokenBalance
          : wTokenBalance
              .dividedBy(marketData.strike)
              .decimalPlaces(marketData.wTokenDecimals),
    }
  }

  const processBalances = async (
    balances: GetAccountBalance_accountBalances[],
    markets: Market[],
  ): Promise<Position[]> => {
    const uniqueMarkets = Array.from(
      new Set(
        balances
          .filter(
            (b) => b.token && b.token.market && !b.token.name.startsWith("LP"),
          )
          .map((b) => b.token && b.token.market && b.token.market.id),
      ),
    )
    const uniqueMarketPositions = uniqueMarkets.map((um) => {
      const result = balances
        .filter((b) => b.token && b.token.market && b.token.market.id === um)
        .reduce(
          (ump, position) => {
            const collateralDecimals = position.token.decimals

            return position.token.type === TokenType.W_TOKEN
              ? {
                  ...ump,
                  wTokenBalance: new BigNumber(position.amount)
                    .shiftedBy(-collateralDecimals)
                    .decimalPlaces(collateralDecimals),
                }
              : position.token.type === TokenType.B_TOKEN
              ? {
                  ...ump,
                  bTokenBalance: new BigNumber(position.amount)
                    .shiftedBy(-collateralDecimals)
                    .decimalPlaces(collateralDecimals),
                }
              : {
                  ...ump,
                }
          },
          {
            wTokenBalance: new BigNumber(0),
            bTokenBalance: new BigNumber(0),
            market: balances.filter(
              (b) => b.token && b.token.market && b.token.market.id === um,
            )[0].token.market,
          },
        )

      return result
    })

    const result = await Promise.all(
      uniqueMarketPositions
        .filter((ump) => ump.market !== null)
        .map((ump) =>
          processBalance(
            ump.wTokenBalance,
            ump.bTokenBalance,
            ump.market?.id || "0x",
            markets,
          ),
        ),
    )
    return result.filter(
      (p) => p.bTokenContracts.gt(0) || p.wTokenContracts.gt(0),
    )
  }

  const processPool = async (
    pool: GetLiquidityPools_amms,
    rewardPools: SirenPoolsResponse,
    address?: string,
  ): Promise<LiquidityPool> => {
    const getUserLpTokenBalance = async () => {
      if (!address || !readProvider) return new BigNumber(0)

      const lpTokenContract = LPTokenFactory.connect(
        pool.lpToken.id,
        readProvider,
      )
      try {
        const result = await lpTokenContract.balanceOf(address)

        const lpTokenBalance = new BigNumber(result.toString()).shiftedBy(
          -pool.lpToken.decimals,
        )

        return lpTokenBalance
      } catch (error) {
        console.log(error)
        return new BigNumber(0)
      }
    }

    const getLimitsAndPermissions = async () => {
      try {
        if (!readProvider) {
          return {
            depositLimit: 0,
            totalPoolValue: 0,
            enforceDepositLimit: true,
            exchangeRate: 1,
          }
        }
        const minterAmmContract = MinterAmmFactory.connect(
          pool.id,
          readProvider,
        )

        const enforceDepositLimit = await minterAmmContract.enforceDepositLimits()

        const depositLimit = new BigNumber(
          (await minterAmmContract.globalDepositLimit()).toString(),
        )
          .shiftedBy(-pool.collateralToken.decimals)
          .toNumber()

        const totalPoolValue = new BigNumber(
          (await minterAmmContract.getTotalPoolValue(true)).toString(),
        )
          .shiftedBy(-pool.collateralToken.decimals)
          .toNumber()

        const exchangeRate = new BigNumber(
          (await minterAmmContract.getCurrentCollateralPrice()).toString(),
        )
          .shiftedBy(
            pool.collateralToken.decimals - pool.paymentToken.decimals - 18,
          )
          .toNumber()

        return {
          depositLimit,
          enforceDepositLimit,
          totalPoolValue,
          exchangeRate,
        }
      } catch (error) {
        console.log("Error getting Limits and Permissions, using defaults")
        console.log(error)
        return {
          depositLimit: 0,
          totalPoolValue: 0,
          enforceDepositLimit: true,
          exchangeRate: 1,
        }
      }
    }
    const balance = await getUserLpTokenBalance()
    const permissions = await getLimitsAndPermissions()

    let siRewards = 0
    if (Array.isArray(rewardPools)) {
      // TODO: this is the old response shape from the backend (prior to the first sip-11 snapshot)
      // so we need to calculate the siRewards like we did prior to sip-11.
      // This can be deleted after on April 30th 2021 or later
      const weeklyRewards =
        Number(process.env.REACT_APP_SI_WEEKLY_REWARD_RATE) || 0
      siRewards =
        rewardPools.length > 0 && rewardPools.includes(pool.id)
          ? weeklyRewards / 7 / rewardPools.length
          : 0
    } else {
      // this is the new format, where the SirenResponse is an Object with AMM addresses
      // as keys and values as Objects containing pool data
      const ammAddresses = Object.keys(rewardPools)
      siRewards =
        ammAddresses.length > 0 && ammAddresses.includes(pool.id)
          ? rewardPools[pool.id].siDailyRewards
          : 0
    }
    const name =
      pool.collateralToken.symbol === "USDC"
        ? `${pool.paymentToken.symbol} / ${pool.collateralToken.symbol} Puts (${pool.collateralToken.symbol})`
        : `${pool.collateralToken.symbol} / ${pool.paymentToken.symbol} Calls (${pool.collateralToken.symbol})`

    return {
      address: pool.id,
      lpTokenAddress: pool.lpToken.id,
      lpTokenDecimals: pool.lpToken.decimals,
      lpTokenSupply: new BigNumber(pool.lpToken.totalSupply)
        .shiftedBy(-pool.lpToken.decimals)
        .toNumber(),
      collateralTokenAddress: pool.collateralToken.id,
      collateralTokenSymbol: pool.collateralToken.symbol,
      collateralTokenDecimals: pool.collateralToken.decimals,
      collateralTokenName: pool.collateralToken.name,
      paymentTokenAddress: pool.paymentToken.id,
      paymentTokenSymbol: pool.paymentToken.symbol,
      paymentTokenDecimals: pool.paymentToken.decimals,
      paymentTokenName: pool.paymentToken.name,
      userBalance: balance,
      siRewards,
      name,
      ...permissions,
    }
  }

  const processPools = async (
    pools: GetLiquidityPools_amms[],
    address?: string,
  ): Promise<LiquidityPool[]> => {
    const rewardsApiUrl = process.env.REACT_APP_SI_REWARDS_API

    let rewardPools = {} as SirenPoolsResponse

    try {
      rewardPools = await (await fetch(`${rewardsApiUrl}/pools`)).json()
    } catch (error) {
      console.error("failed to fetch reward pool list")
    }

    const result = await Promise.all(
      pools.map((pool) => processPool(pool, rewardPools, address)),
    )

    return result
  }

  // Markets poller
  useEffect(() => {
    const handler = () => {
      if (!subgraphClient) return
      getMarkets(subgraphClient)
    }

    let poller: NodeJS.Timeout
    handler()
    poller = setInterval(handler, 1200000)

    return () => {
      clearInterval(poller)
    }
    // eslint-disable-next-line
  }, [subgraphClient])

  // Positions poller
  useEffect(() => {
    const handler = () => {
      if (!subgraphClient || !address || !isReady || !(markets.length > 0))
        return
      getPositions(subgraphClient, address.toLowerCase(), markets)
    }
    let poller: NodeJS.Timeout
    handler()
    poller = setInterval(handler, 1200000)

    return () => {
      clearInterval(poller)
    }
    // eslint-disable-next-line
  }, [subgraphClient, address, isReady, markets])

  // Liquidity Pools poller
  useEffect(() => {
    const handler = () => {
      if (!subgraphClient) return
      getLiquidityPools(subgraphClient, address)
    }
    let poller: NodeJS.Timeout
    handler()
    poller = setInterval(handler, 1200000)

    return () => {
      clearInterval(poller)
    }
    // eslint-disable-next-line
  }, [subgraphClient, address])

  // Siren Rewards poller
  useEffect(() => {
    const handler = async () => {
      try {
        const rewardsApiUrl = process.env.REACT_APP_SI_REWARDS_API
        if (!address || !rewardsApiUrl) return

        const result = (await (
          await fetch(`${rewardsApiUrl}/?address=${address}`)
        ).json()) as SirenRewardsResponse
        setSirenRewards({
          claimableRewards: Number.parseFloat(result.claimableRewards),
          claimedRewards: Number.parseFloat(result.claimedRewards),
          totalRewards: Number.parseFloat(result.totalRewards),
          claimMessage: result.claimMessage,
          recipient: result.recipient,
        })
      } catch (error) {
        console.error("There was a problem fetching rewards")
      }
    }
    let poller: NodeJS.Timeout
    handler()
    poller = setInterval(handler, 1200000)

    return () => {
      clearInterval(poller)
    }
    // eslint-disable-next-line
  }, [subgraphClient, address])

  const updatePoolAPY = useCallback(async () => {
    const stakingRewardsAddress = process.env.REACT_APP_POOL2_STAKING_CONTRACT
    if (!stakingRewardsAddress || !provider) return
    const stakingRewardsContract = StakingRewardsFactory.connect(
      stakingRewardsAddress,
      provider,
    )
    const uniswapGraphClient = new GraphQLClient(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    )

    const graphQueryResult = await uniswapGraphClient.request(`
      query GetPairData {
        pairs(where: {id: "0x5d8a31269a9f3336e3f23de17b2ec7393bdd6916"}) {
          reserveUSD
          totalSupply
        }
      }
    `)

    const lpTokenValue =
      graphQueryResult.pairs[0].reserveUSD /
      graphQueryResult.pairs[0].totalSupply

    const rewardRate = new BigNumber(
      (await stakingRewardsContract.rewardRate()).toString(),
    ).shiftedBy(-18)

    const stakedTokens = new BigNumber(
      (await stakingRewardsContract.totalSupply()).toString(),
    ).shiftedBy(-18)

    const stakedValue = stakedTokens.multipliedBy(lpTokenValue)
    const apy = rewardRate
      .multipliedBy(siPrice)
      .dividedBy(stakedValue)
      .multipliedBy(60 * 60 * 24 * 365)
      .multipliedBy(100)
      .decimalPlaces(2)
      .toNumber()

    setPoolAPY(apy)
  }, [provider, siPrice])

  const updateStakedBalances = useCallback(async () => {
    const stakingRewardsAddress = process.env.REACT_APP_POOL2_STAKING_CONTRACT
    if (!stakingRewardsAddress || !provider || !address) return

    const stakingRewardsContract = StakingRewardsFactory.connect(
      stakingRewardsAddress,
      provider,
    )

    const stakedBalance = new BigNumber(
      (await stakingRewardsContract.balanceOf(address)).toString(),
    ).shiftedBy(-18)

    const rewardsAvailable = new BigNumber(
      await (await stakingRewardsContract.earned(address)).toString(),
    ).shiftedBy(-18)

    setRewardsAvailable(rewardsAvailable)
    setStakedBalance(stakedBalance)
  }, [address, provider])

  // Staking Rewards Poller
  useEffect(() => {
    const handler = () => {
      updateStakedBalances()
      updatePoolAPY()
    }

    let poller: NodeJS.Timeout
    handler()
    poller = setInterval(handler, 60000)

    return () => {
      clearInterval(poller)
    }
    // eslint-disable-next-line
  }, [address, provider, updateStakedBalances])

  // Siren Price Poller
  useEffect(() => {
    const handler = async () => {
      const result = await (
        await fetch("https://api.coingecko.com/api/v3/coins/siren")
      ).json()
      const siPrice = result.market_data.current_price.usd
      setSiPrice(Number(siPrice))
    }

    let poller: NodeJS.Timeout
    handler()
    poller = setInterval(handler, 60000)

    return () => {
      clearInterval(poller)
    }
  }, [])

  const acceptDisclaimer = (save: boolean) => {
    if (save) {
      localStorage.setItem("SIREN.DisclaimerAccepted", "true")
    }
    setDisclaimerAccepted(true)
  }

  const getMarkets = async (graphClient: GraphQLClient) => {
    const result = await graphClient.request<GetMarkets>(marketsQuery)
    const newMarkets = await processMarkets(result.markets)
    setMarkets(newMarkets)
  }

  const getPositions = async (
    graphClient: GraphQLClient,
    address: string,
    markets: Market[],
  ) => {
    const result = await graphClient.request<
      GetAccountBalance,
      GetAccountBalanceVariables
    >(accountBalanceQuery, { id: address })
    const newPositions: Position[] = await processBalances(
      result.accountBalances,
      markets,
    )

    setPositions(newPositions)
  }

  const getLiquidityPools = async (
    graphClient: GraphQLClient,
    address?: string,
  ) => {
    const result = await graphClient.request<GetLiquidityPools>(
      liquidityPoolsQuery,
    )
    const newPools = await processPools(result.amms, address)
    setPools(newPools)
  }

  const quoteBuyOption = async (
    quantity: BigNumber,
    marketAddress: string,
  ): Promise<BigNumber | void> => {
    if (!provider) return
    const market = markets.filter((m) => m.marketAddress === marketAddress)[0]
    if (!market) return
    const signer = provider.getSigner()
    const ammContract = MinterAmmFactory.connect(market.ammAddress, signer)

    const quoteQuantity =
      market.type === "Call" ? quantity : quantity.multipliedBy(market.strike)

    try {
      const result = await ammContract.bTokenGetCollateralIn(
        market.marketAddress,
        new BigNumber(quoteQuantity)
          .shiftedBy(market.collateralTokenDecimals)
          .decimalPlaces(0)
          .toString(10),
      )

      const collateralRequired = new BigNumber(result.toString()).shiftedBy(
        -market.collateralTokenDecimals,
      )

      return collateralRequired
    } catch (error) {
      console.log(error)
    }
  }

  const quoteSellOption = async (
    quantity: BigNumber,
    marketAddress: string,
  ): Promise<BigNumber | void> => {
    if (!provider) throw new Error()
    const market = markets.filter((m) => m.marketAddress === marketAddress)[0]
    if (!market) return
    const signer = provider.getSigner()
    const ammContract = MinterAmmFactory.connect(market.ammAddress, signer)
    const quoteQuantity =
      market.type === "Call" ? quantity : quantity.multipliedBy(market.strike)

    try {
      const result = await ammContract.bTokenGetCollateralOut(
        market.marketAddress,
        new BigNumber(quoteQuantity)
          .shiftedBy(market.collateralTokenDecimals)
          .decimalPlaces(0)
          .toString(10),
      )

      const collateralReceived = new BigNumber(result.toString())
        .shiftedBy(-market.collateralTokenDecimals)
        .decimalPlaces(4)

      return collateralReceived
    } catch (error) {
      console.log(error)
    }
  }

  const buyOption = async (
    quantity: BigNumber,
    collateralEstimate: BigNumber,
    marketAddress: string,
  ) => {
    if (!provider || !address) return
    const market = markets.filter((m) => m.marketAddress === marketAddress)[0]
    if (!market) return
    const signer = provider.getSigner()

    const collateralAmount = new BigNumber(collateralEstimate)
      .multipliedBy(1 + slippage)
      .shiftedBy(market.collateralTokenDecimals)
      .decimalPlaces(0)

    const collateralTokenContract = SimpleTokenFactory.connect(
      market.collateralTokenAddress,
      signer,
    )

    const currentAllowance = new BigNumber(
      (
        await collateralTokenContract.allowance(address, market.ammAddress)
      ).toString(),
    )

    if (collateralAmount.gt(currentAllowance)) {
      await (
        await collateralTokenContract.approve(
          market.ammAddress,
          collateralAmount.toString(10),
        )
      ).wait()
    }

    const buyQuantity =
      market.type === "Call" ? quantity : quantity.multipliedBy(market.strike)

    const quantityAmount = new BigNumber(buyQuantity).shiftedBy(
      market.collateralTokenDecimals,
    )

    const ammContract = MinterAmmFactory.connect(market.ammAddress, signer)
    await (
      await ammContract.bTokenBuy(
        market.marketIndex,
        quantityAmount.toString(10),
        collateralAmount.toString(10),
      )
    ).wait(1)

    subgraphClient && (await getMarkets(subgraphClient))
    subgraphClient &&
      address &&
      (await getPositions(subgraphClient, address, markets))
  }

  const sellOption = async (
    quantity: BigNumber,
    collateralEstimate: BigNumber,
    marketAddress: string,
  ) => {
    if (!provider || !address) return
    const position = positions.filter(
      (m) => m.marketAddress === marketAddress,
    )[0]
    if (!position) return
    const signer = provider.getSigner()
    debugger
    const collateralAmountMin = new BigNumber(collateralEstimate)
      .multipliedBy(1 - slippage)
      .shiftedBy(position.collateralTokenDecimals)
      .decimalPlaces(0)

    const bTokenContract = SimpleTokenFactory.connect(
      position.bTokenAddress,
      signer,
    )

    const bTokenAmount = new BigNumber(quantity)
      .div(position.bTokenContracts)
      .multipliedBy(position.bTokenBalance)
      .shiftedBy(position.collateralTokenDecimals)
      .decimalPlaces(0)
    const currentAllowance = new BigNumber(
      (await bTokenContract.allowance(address, position.ammAddress)).toString(),
    )

    if (bTokenAmount.gt(currentAllowance)) {
      await (
        await bTokenContract.approve(
          position.ammAddress,
          bTokenAmount.toString(10),
        )
      ).wait()
    }

    const ammContract = MinterAmmFactory.connect(position.ammAddress, signer)
    await (
      await ammContract.bTokenSell(
        position.marketIndex,
        bTokenAmount.toString(10),
        collateralAmountMin.toString(10),
      )
    ).wait(1)
    subgraphClient && (await getMarkets(subgraphClient))
    subgraphClient &&
      address &&
      (await getPositions(subgraphClient, address, markets))
  }

  const exerciseOption = async (
    contractSize: BigNumber,
    marketAddress: string,
  ) => {
    if (!provider || !address) return
    const position = positions.filter(
      (m) => m.marketAddress === marketAddress,
    )[0]
    if (!position) return

    const signer = provider.getSigner()
    const paymentAmount = contractSize
      .div(position.bTokenContracts)
      .multipliedBy(position.bTokenBalance)
      .multipliedBy(position.type === "Call" ? position.strike : 1)
      .shiftedBy(position.paymentTokenDecimals)
      .decimalPlaces(0)

    const paymentTokenContract = SimpleTokenFactory.connect(
      position.paymentTokenAddress,
      signer,
    )

    const currentAllowance = new BigNumber(
      (
        await paymentTokenContract.allowance(address, position.marketAddress)
      ).toString(),
    )

    if (paymentAmount.gt(currentAllowance)) {
      await (
        await paymentTokenContract.approve(
          position.marketAddress,
          paymentAmount.toString(),
        )
      ).wait()
    }

    const exerciseAmount =
      position.type === "Call"
        ? new BigNumber(contractSize).shiftedBy(
            position.collateralTokenDecimals,
          )
        : new BigNumber(contractSize)
            .multipliedBy(position.strike)
            .shiftedBy(position.collateralTokenDecimals)

    const marketContract = MarketFactory.connect(position.marketAddress, signer)

    await (
      await marketContract.exerciseOption(exerciseAmount.toString(10))
    ).wait(1)
    subgraphClient && (await getMarkets(subgraphClient))
    subgraphClient &&
      address &&
      (await getPositions(subgraphClient, address, markets))
  }

  const closePosition = async (
    contractSize: BigNumber,
    marketAddress: string,
  ) => {
    if (!provider) return
    const position = positions.filter(
      (m) => m.marketAddress === marketAddress,
    )[0]
    if (!position) return

    const signer = provider.getSigner()
    const closeAmount = contractSize
      .dividedBy(
        BigNumber.min(position.bTokenContracts, position.wTokenContracts),
      )
      .multipliedBy(
        BigNumber.min(position.bTokenBalance, position.wTokenBalance),
      )
      .shiftedBy(position.collateralTokenDecimals)
      .decimalPlaces(0)

    const marketContract = MarketFactory.connect(position.marketAddress, signer)
    await (await marketContract.closePosition(closeAmount.toString(10))).wait(1)
    subgraphClient && (await getMarkets(subgraphClient))
    subgraphClient &&
      address &&
      (await getPositions(subgraphClient, address, markets))
  }

  const withdrawCollateral = async (marketAddress: string) => {
    if (!provider) return
    const position = positions.filter(
      (m) => m.marketAddress === marketAddress,
    )[0]
    if (!position) return
    const signer = provider.getSigner()
    const marketContract = MarketFactory.connect(marketAddress, signer)

    await (
      await marketContract.claimCollateral(
        new BigNumber(position.wTokenBalance)
          .shiftedBy(position.collateralTokenDecimals)
          .decimalPlaces(0)
          .toString(10),
      )
    ).wait(1)
    subgraphClient && (await getMarkets(subgraphClient))
    subgraphClient &&
      address &&
      (await getPositions(subgraphClient, address, markets))
  }

  const quoteProvideCapital = async (
    collateralAmount: BigNumber,
    ammAddress: string,
  ) => {
    if (!provider) return
    const pool = pools.filter((m) => m.address === ammAddress)[0]
    if (!pool) return
    const ammContract = MinterAmmFactory.connect(pool.address, provider)
    const lpTokenContract = LPTokenFactory.connect(
      pool.lpTokenAddress,
      provider,
    )
    const poolValue = await ammContract.getTotalPoolValue(true)
    const lpTokenSupply = await lpTokenContract.totalSupply()
    if (poolValue.eq(0) || lpTokenSupply.eq(0)) {
      return collateralAmount.toNumber()
    }

    const collateralAmountBN = new BigNumber(collateralAmount).shiftedBy(
      pool.collateralTokenDecimals,
    )

    const lpTokensEstimate = new BigNumber(lpTokenSupply.toString())
      .multipliedBy(collateralAmountBN)
      .dividedBy(poolValue.toString())

    return lpTokensEstimate
      .shiftedBy(-pool.collateralTokenDecimals)
      .decimalPlaces(4)
      .toNumber()
  }

  const provideCapital = async (
    collateralAmount: BigNumber,
    expectedLpTokens: number,
    ammAddress: string,
  ) => {
    if (!provider || !address) return
    const pool = pools.filter((m) => m.address === ammAddress)[0]
    if (!pool) return
    const signer = provider.getSigner()

    const collateralAmountBN = collateralAmount.shiftedBy(
      pool.collateralTokenDecimals,
    )

    const collateralTokenContract = SimpleTokenFactory.connect(
      pool.collateralTokenAddress,
      signer,
    )

    const minLpTokens = new BigNumber(expectedLpTokens)
      .multipliedBy(1 - slippage)
      .shiftedBy(pool.collateralTokenDecimals)
      .decimalPlaces(0)

    const currentAllowance = new BigNumber(
      (
        await collateralTokenContract.allowance(address, pool.address)
      ).toString(),
    )

    if (collateralAmountBN.gt(currentAllowance)) {
      await (
        await collateralTokenContract.approve(
          pool.address,
          collateralAmountBN.toString(10),
        )
      ).wait()
    }

    const ammContract = MinterAmmFactory.connect(pool.address, signer)
    await (
      await ammContract.provideCapital(
        collateralAmountBN.toString(10),
        minLpTokens.toString(10),
      )
    ).wait(1)
    subgraphClient && address && getLiquidityPools(subgraphClient, address)
  }

  const quoteWithdrawCapital = async (
    lpTokenAmount: BigNumber,
    ammAddress: string,
  ) => {
    if (!provider) return

    const pool = pools.filter((m) => m.address === ammAddress)[0]
    if (!pool) return

    // const signer = provider.getSigner()
    // const paymentTokensPerCollateralToken =
    //   pool.collateralTokenSymbol?.toLowerCase() === "wbtc"
    //     ? usdBtcRate
    //     : 1 / usdBtcRate

    // const lpTokenAmountBN = new BigNumber(lpTokenAmount).shiftedBy(
    //   pool.collateralTokenDecimals,
    // )

    // const ammContract = MinterAmmFactory.connect(pool.address, signer)
    // const collateralTokenContract = SimpleTokenFactory.connect(
    //   pool.collateralTokenAddress,
    //   signer,
    // )
    // const paymentTokenContract = SimpleTokenFactory.connect(
    //   pool.paymentTokenAddress,
    //   signer,
    // )

    // #1 Calculate amount to be received if no slippage occurs
    const collateralBestCaseProRata = new BigNumber(pool.totalPoolValue)
      .multipliedBy(lpTokenAmount)
      .dividedBy(pool.lpTokenSupply)

    // const [unclaimedCollateral, unclaimedPayment] = Object.values(
    //   await ammContract.getUnclaimedBalances(),
    // )

    // // #2.1
    // const unclaimedCollateralProRata = new BigNumber(
    //   unclaimedCollateral.toString(),
    // )
    //   .multipliedBy(lpTokenAmount)
    //   .dividedBy(pool.lpTokenSupply)

    // // #2.2
    // const unclaimedPaymentProRata = new BigNumber(unclaimedPayment.toString())
    //   .multipliedBy(lpTokenAmount)
    //   .dividedBy(paymentTokensPerCollateralToken)
    //   .dividedBy(pool.lpTokenSupply)

    // // #3.1
    // const ammCollateralProRata = new BigNumber(
    //   await (await collateralTokenContract.balanceOf(pool.address)).toString(),
    // )
    //   .multipliedBy(lpTokenAmount)
    //   .dividedBy(pool.lpTokenSupply)

    // // #3.2
    // const ammPaymentProRata = new BigNumber(
    //   await (await paymentTokenContract.balanceOf(pool.address)).toString(),
    // )
    //   .multipliedBy(lpTokenAmount)
    //   .dividedBy(paymentTokensPerCollateralToken)
    //   .dividedBy(pool.lpTokenSupply)

    // // #4
    // const tokenSaleValue = await ammContract.getTokensSaleValue(
    //   lpTokenAmountBN.toString(),
    // )

    // // #2.1 + #2.2 + #3.1 + #3.2 + #4
    // const expectedCollateral = unclaimedCollateralProRata
    //   .plus(unclaimedPaymentProRata)
    //   .plus(ammCollateralProRata)
    //   .plus(ammPaymentProRata)
    //   .plus(tokenSaleValue.toString())

    return {
      bestCase: collateralBestCaseProRata.toNumber(),
      sellTokens: 0,
      // expectedCollateral
      //   .shiftedBy(-pool.collateralTokenDecimals)
      //   .toNumber(),
    }
  }

  const fetchPoolAssets = async (ammAddress: string) => {
    const pool = pools.filter((m) => m.address === ammAddress)[0]
    if (!pool || !provider || !address) return []

    const minterAmmContract = MinterAmmFactory.connect(pool.address, provider)
    const collateralTokenContract = ERC20UpgradeSafeFactory.connect(
      pool.collateralTokenAddress,
      provider,
    )
    const paymentTokenContract = ERC20UpgradeSafeFactory.connect(
      pool.paymentTokenAddress,
      provider,
    )

    const [collateralBal, paymentBal, unclaimedBals] = await Promise.all([
      collateralTokenContract.balanceOf(ammAddress),
      paymentTokenContract.balanceOf(ammAddress),
      minterAmmContract.getUnclaimedBalances(),
    ])

    const [unclaimedCollateral, unclaimedPayment] = Object.values(unclaimedBals)

    const collateralTokenBalance = new BigNumber(collateralBal.toString())
      .plus(new BigNumber(unclaimedCollateral.toString()))
      .shiftedBy(-pool.collateralTokenDecimals)

    const paymentTokenBalance = new BigNumber(paymentBal.toString())
      .plus(new BigNumber(unclaimedPayment.toString()))
      .shiftedBy(-pool.paymentTokenDecimals)

    const activeMarkets = markets.filter(
      (m) => m.ammAddress === ammAddress && m.status === "open",
    )

    const wTokenBalancePromises = activeMarkets.map(async (m) => {
      const wTokenContract = ERC20UpgradeSafeFactory.connect(
        m.wTokenAddress,
        provider,
      )

      return {
        name: `$${utils.commify(m.strike)} ${formatShortLocaleDate(
          m.expiration,
        )} wTokens`,
        balance: new BigNumber(
          (await wTokenContract.balanceOf(ammAddress)).toString(),
        ).shiftedBy(-m.wTokenDecimals),
      }
    })

    const wTokenBalances = await Promise.all(wTokenBalancePromises)

    return [
      { name: pool.collateralTokenSymbol, balance: collateralTokenBalance },
      { name: pool.paymentTokenSymbol, balance: paymentTokenBalance },
      ...wTokenBalances,
    ]
  }

  const withdrawCapital = async (
    lpTokenAmount: BigNumber,
    expectedCollateral: number,
    sellTokens: boolean,
    ammAddress: string,
  ) => {
    if (!provider) return
    const pool = pools.filter((m) => m.address === ammAddress)[0]
    if (!pool) return
    const signer = provider.getSigner()

    const lpTokenAmountScaled = lpTokenAmount.shiftedBy(pool.lpTokenDecimals)

    const minCollateral = new BigNumber(expectedCollateral)
      .multipliedBy(1 - slippage)
      .shiftedBy(pool.collateralTokenDecimals)
      .decimalPlaces(0)

    const ammContract = MinterAmmFactory.connect(pool.address, signer)
    await (
      await ammContract.withdrawCapital(
        lpTokenAmountScaled.toString(10),
        sellTokens,
        minCollateral.toString(10),
      )
    ).wait(1)

    subgraphClient &&
      address &&
      (await getLiquidityPools(subgraphClient, address))
    subgraphClient && (await getMarkets(subgraphClient))
    subgraphClient &&
      address &&
      (await getPositions(subgraphClient, address, markets))
  }

  const claimRewards = async () => {
    const rewardsApiUrl = process.env.REACT_APP_SI_REWARDS_API
    const siRewardsDistributorAddress =
      process.env.REACT_APP_SI_REWARDS_DISTRIBUTOR
    if (
      !provider ||
      !sirenRewards.claimMessage ||
      !sirenRewards.recipient ||
      !(sirenRewards.claimableRewards > 0) ||
      !address ||
      !rewardsApiUrl ||
      !siRewardsDistributorAddress
    )
      return

    const distributor = SIRewardDistributorFactory.connect(
      siRewardsDistributorAddress,
      provider.getSigner(),
    )

    try {
      await (
        await distributor.claim(
          {
            amount: sirenRewards.recipient.amount,
            nonce: sirenRewards.recipient.nonce,
            wallet: sirenRewards.recipient.wallet,
          },
          sirenRewards.claimMessage.v,
          sirenRewards.claimMessage.r,
          sirenRewards.claimMessage.s,
        )
      ).wait(1)

      const newClaim = (await (
        await fetch(`${rewardsApiUrl}/?address=${address}`)
      ).json()) as SirenRewardsResponse

      setSirenRewards({
        claimableRewards: Number.parseFloat(newClaim.claimableRewards),
        claimedRewards: Number.parseFloat(newClaim.claimedRewards),
        totalRewards: Number.parseFloat(newClaim.totalRewards),
        claimMessage: newClaim.claimMessage,
        recipient: newClaim.recipient,
      })
    } catch (error) {
      console.log(error)
      return
    }
  }

  const handleSelectWalletConnect = async () => {
    if (onboard && !isReady) {
      let walletReady = !!wallet
      if (!walletReady) {
        walletReady = await onboard.walletSelect()
      }
      walletReady && (await checkIsReady())
    }
  }

  const stake = async (amountToStake: string) => {
    const lpTokenAddress = process.env.REACT_APP_POOL2_LP_TOKEN_ADDRESS
    const stakingContractAddress = process.env.REACT_APP_POOL2_STAKING_CONTRACT

    if (!lpTokenAddress || !stakingContractAddress || !provider || !address)
      return
    const signer = provider.getSigner()

    const lpToken = tokens[lpTokenAddress]

    const amountToStakeBN = new BigNumber(amountToStake).shiftedBy(
      lpToken.decimals,
    )

    const lpTokenAllowance = lpToken.allowance
      ? new BigNumber(
          (await lpToken.allowance(address, stakingContractAddress)).toString(),
        )
      : new BigNumber(0)

    if (lpTokenAllowance.lt(amountToStakeBN)) {
      lpToken.approve &&
        (await (
          await lpToken.approve(
            stakingContractAddress,
            amountToStakeBN.toString(10),
          )
        ).wait(1))
    }
    const stakingContract = StakingRewardsFactory.connect(
      stakingContractAddress,
      signer,
    )

    await (await stakingContract.stake(amountToStakeBN.toString(10))).wait(1)
    await updateStakedBalances()
  }

  const unstake = async (amountToUnstake: string) => {
    const lpTokenAddress = process.env.REACT_APP_POOL2_LP_TOKEN_ADDRESS
    const stakingContractAddress = process.env.REACT_APP_POOL2_STAKING_CONTRACT
    debugger
    if (!stakingContractAddress || !provider || !lpTokenAddress) return

    const signer = provider.getSigner()
    const lpToken = tokens[lpTokenAddress]

    const amountToUnstakeBN = new BigNumber(amountToUnstake).shiftedBy(
      lpToken.decimals,
    )

    const stakingContract = StakingRewardsFactory.connect(
      stakingContractAddress,
      signer,
    )

    await (await stakingContract.withdraw(amountToUnstakeBN.toString(10))).wait(
      1,
    )
    await updateStakedBalances()
  }

  const claimPool2Rewards = async () => {
    const stakingContractAddress = process.env.REACT_APP_POOL2_STAKING_CONTRACT
    if (!stakingContractAddress || !provider) return
    const signer = provider.getSigner()
    const stakingContract = StakingRewardsFactory.connect(
      stakingContractAddress,
      signer,
    )
    await (await stakingContract.getReward()).wait(1)
    await updateStakedBalances()
  }

  return (
    <SirenMarketsContext.Provider
      value={{
        disclaimerAccepted,
        acceptDisclaimer,
        markets,
        positions,
        pools,
        quoteBuyOption,
        buyOption,
        exerciseOption,
        closePosition,
        withdrawCollateral,
        quoteSellOption,
        sellOption,
        quoteProvideCapital,
        quoteWithdrawCapital,
        provideCapital,
        withdrawCapital,
        handleSelectWalletConnect,
        sirenRewards,
        refreshPortfolio: () =>
          subgraphClient &&
          address &&
          getPositions(subgraphClient, address, markets),
        stake,
        unstake,
        claimRewards,
        rewardsAvailable,
        stakedBalance,
        claimPool2Rewards,
        siPrice,
        poolAPY,
        fetchPoolAssets,
      }}
    >
      {children}
    </SirenMarketsContext.Provider>
  )
}

function useSirenMarketsContext() {
  const context = React.useContext(SirenMarketsContext)
  if (context === undefined) {
    throw new Error(
      "useSirenMarketsContext must be used within a SirenMarketsProvider",
    )
  }
  return context
}

export { SirenMarketsProvider, useSirenMarketsContext }
