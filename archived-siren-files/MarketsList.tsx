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
import { useLanguageContext } from "../Contexts/LanguageContext"
import { Market } from "../Contexts/SirenMarketsContext"
import { BigNumber } from "bignumber.js"
import MarketGridItem from "./MarketGridItem"
import { utils } from "ethers"

const MarketList: React.FC<{
  markets: Market[]
  selectedMarketId?: string
  selectOption(id: string | number): void
}> = ({ markets, selectOption, selectedMarketId }) => {
  const { formatLocaleDate } = useLanguageContext()

  const { breakpoints } = useTheme()
  const desktop = useMediaQuery(breakpoints.up("sm"))

  const exchangeRate =
    markets.length > 0
      ? markets[0].type === "Call"
        ? new BigNumber(markets[0].paymentPerCollateral)
            .decimalPlaces(2)
            .toNumber()
        : new BigNumber(1 / markets[0].paymentPerCollateral)
            .decimalPlaces(2)
            .toNumber()
      : 0

  const collateralTokenSymbol =
    markets.length > 0
      ? markets[0].type === "Call"
        ? markets[0].collateralTokenSymbol
        : markets[0].paymentTokenSymbol
      : "WBTC"

  const paymentTokenSymbol =
    markets.length > 0
      ? markets[0].type === "Call"
        ? markets[0].paymentTokenSymbol
        : markets[0].collateralTokenSymbol
      : "USDC"

  const itmOptions = markets
    .filter((m) => m.strike >= exchangeRate)
    .sort((a, b) =>
      a.strike > b.strike
        ? 1
        : a.strike === b.strike
        ? a.expiration > b.expiration
          ? 1
          : -1
        : -1,
    )
  const otmOptions = markets
    .filter((m) => m.strike < exchangeRate)
    .sort((a, b) =>
      a.strike > b.strike
        ? 1
        : a.strike === b.strike
        ? a.expiration > b.expiration
          ? 1
          : -1
        : -1,
    )

  return desktop ? (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align="left">Strike</TableCell>
          <TableCell align="center">Expiration</TableCell>
          <TableCell align="center">Premium</TableCell>
          <TableCell align="center">Open Interest</TableCell>
          <TableCell align="center">Break Even</TableCell>
          <TableCell align="center">Delta</TableCell>
          <TableCell align="center">Gamma</TableCell>
          <TableCell align="center">Theta</TableCell>
          <TableCell align="right">Vega</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {otmOptions?.length > 0 &&
          otmOptions.map((o) => (
            <TableRow
              hover
              selected={o.marketAddress === selectedMarketId}
              key={o.marketAddress}
              onClick={() => selectOption(o.marketAddress)}
            >
              <TableCell align="left">${utils.commify(o.strike)}</TableCell>
              <TableCell align="left">
                {formatLocaleDate(o.expiration)}
              </TableCell>
              <TableCell align="center">{o.premium}</TableCell>
              <TableCell align="center">
                {utils.commify(o.openInterest)}
              </TableCell>
              <TableCell align="center">
                $
                {o.type === "Call"
                  ? utils.commify(
                      new BigNumber(o.premium * exchangeRate + o.strike)
                        .decimalPlaces(2)
                        .toString(),
                    )
                  : utils.commify(
                      new BigNumber(o.strike)
                        .minus(o.premium * exchangeRate)
                        .decimalPlaces(2)
                        .toString(),
                    )}
              </TableCell>
              <TableCell align="center">{o.greeks.delta}</TableCell>
              <TableCell align="center">{o.greeks.gamma}</TableCell>
              <TableCell align="center">{o.greeks.theta}</TableCell>
              <TableCell align="right">{o.greeks.vega}</TableCell>
            </TableRow>
          ))}
        {exchangeRate ? (
          <TableRow>
            <TableCell align="center" colSpan={8}>
              <b>
                Current Price: {paymentTokenSymbol} {exchangeRate}/
                {collateralTokenSymbol}
              </b>
            </TableCell>
          </TableRow>
        ) : null}
        {itmOptions?.length > 0 &&
          itmOptions.map((o) => (
            <TableRow
              hover
              selected={o.marketAddress === selectedMarketId}
              key={o.marketAddress}
              onClick={() => selectOption(o.marketAddress)}
            >
              <TableCell align="left">${utils.commify(o.strike)}</TableCell>
              <TableCell align="left">
                {formatLocaleDate(o.expiration)}
              </TableCell>
              <TableCell align="center">{o.premium}</TableCell>
              <TableCell align="center">
                {utils.commify(o.openInterest)}
              </TableCell>
              <TableCell align="center">
                $
                {o.type === "Call"
                  ? utils.commify(
                      new BigNumber(o.premium * exchangeRate + o.strike)
                        .decimalPlaces(2)
                        .toString(),
                    )
                  : utils.commify(
                      new BigNumber(o.strike)
                        .minus(o.premium * exchangeRate)
                        .decimalPlaces(2)
                        .toString(),
                    )}
              </TableCell>
              <TableCell align="center">{o.greeks.delta}</TableCell>
              <TableCell align="center">{o.greeks.gamma}</TableCell>
              <TableCell align="center">{o.greeks.theta}</TableCell>
              <TableCell align="right">{o.greeks.vega}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  ) : (
    <Grid container direction="column" spacing={4}>
      {otmOptions?.length > 0 &&
        otmOptions.map((o) => (
          <MarketGridItem
            market={o}
            key={o.marketAddress}
            selectOption={() => selectOption(o.marketAddress)}
          />
        ))}
      {exchangeRate ? (
        <Grid
          item
          container
          xs={12}
          direction="row"
          alignContent="center"
          justify="center"
        >
          <Typography align="center">
            Current Price: {paymentTokenSymbol} {exchangeRate}/
            {collateralTokenSymbol}
          </Typography>
        </Grid>
      ) : null}
      {itmOptions?.length > 0 &&
        itmOptions.map((o) => (
          <MarketGridItem
            market={o}
            key={o.marketAddress}
            selectOption={() => selectOption(o.marketAddress)}
          />
        ))}
    </Grid>
  )
}

export default MarketList
