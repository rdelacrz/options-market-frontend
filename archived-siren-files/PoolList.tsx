import React from "react"
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import {
  LiquidityPool,
  useSirenMarketsContext,
} from "../Contexts/SirenMarketsContext"
import { BigNumber } from "bignumber.js"
import PoolGridItem from "./PoolGridItem"
import { utils } from "ethers"

const PoolList: React.FC<{
  pools: LiquidityPool[]
  selectPool(id: string): void
  selectedPoolId?: string
}> = ({ pools, selectPool, selectedPoolId }) => {
  const { siPrice } = useSirenMarketsContext()
  const { breakpoints } = useTheme()
  const desktop = useMediaQuery(breakpoints.up("sm"))
  return desktop ? (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Collateral</TableCell>
          <TableCell>TVL</TableCell>
          <TableCell>Balance</TableCell>
          <TableCell>Share (%)</TableCell>
          <TableCell>APY</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pools?.length > 0 &&
          pools.map((p) => {
            return (
              <TableRow
                hover
                key={p.address}
                selected={p.address === selectedPoolId}
                onClick={() => selectPool(p.address)}
              >
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <Typography>
                    {utils.commify(
                      new BigNumber(p.totalPoolValue)
                        .decimalPlaces(4)
                        .toString(),
                    )}
                  </Typography>
                  {p.collateralTokenSymbol.toLowerCase() !== "usdc" && (
                    <Typography variant="caption">
                      ($
                      {utils.commify(
                        new BigNumber(p.totalPoolValue * p.exchangeRate)
                          .decimalPlaces(0)
                          .toString(),
                      )}
                      )
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {p.userBalance?.decimalPlaces(4).toString(10) || 0}
                </TableCell>
                <TableCell>
                  {p.userBalance && p.lpTokenSupply
                    ? p.userBalance
                        .dividedBy(p.lpTokenSupply)
                        .multipliedBy(100)
                        .decimalPlaces(2)
                        .toString()
                    : 0}
                </TableCell>
                <TableCell>
                  {p.siRewards === 0
                    ? "0"
                    : p.totalPoolValue
                    ? Math.round(
                        ((p.siRewards * siPrice * 365) /
                          (p.collateralTokenSymbol.toLowerCase() === "usdc"
                            ? p.totalPoolValue
                            : p.totalPoolValue * p.exchangeRate)) *
                          100,
                      )
                    : "∞"}{" "}
                  %
                </TableCell>
              </TableRow>
            )
          })}
      </TableBody>
    </Table>
  ) : (
    <Grid container direction="column" spacing={4}>
      {pools.length > 0 &&
        pools.map((p) => (
          <PoolGridItem
            pool={p}
            key={p.address}
            selectPool={() => selectPool(p.address)}
          />
        ))}
    </Grid>
  )
}

export default PoolList
