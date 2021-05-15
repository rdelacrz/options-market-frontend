import { gql } from "apollo-boost"

const accountBalanceQuery = gql`
  query GetAccountBalance($id: String!) {
    accountBalances(where: { account: $id }) {
      amount
      token {
        name
        type
        decimals
        market {
          id
        }
      }
    }
  }
`

const marketsQuery = gql`
  query GetMarkets {
    markets {
      id
      marketStyle
      marketIndex
      amm {
        id
      }
      createdBlock
      createdTimestamp
      createdTransaction
      collateralToken {
        id
        decimals
        name
        symbol
      }
      paymentToken {
        id
        decimals
        name
        symbol
      }
      marketName
      expirationDate
      priceRatio
      exerciseFeeBasisPoints
      closeFeeBasisPoints
      claimFeeBasisPoints
      wToken {
        id
        decimals
        totalSupply
      }
      bToken {
        id
        decimals
        totalSupply
      }
    }
  }
`

const liquidityPoolsQuery = gql`
  query GetLiquidityPools {
    amms {
      id
      collateralToken {
        id
        decimals
        symbol
        name
      }
      paymentToken {
        id
        decimals
        symbol
        name
      }
      lpToken {
        id
        decimals
        totalSupply
      }
    }
  }
`

export { marketsQuery, accountBalanceQuery, liquidityPoolsQuery }
