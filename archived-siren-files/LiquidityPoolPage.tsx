import {
  Button,
  CircularProgress,
  Dialog,
  Grid,
  makeStyles,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import React, { useState } from "react"
import { useSirenMarketsContext } from "../Contexts/SirenMarketsContext"
import clsx from "clsx"

import { useWeb3 } from "@chainsafe/web3-context"
import PoolList from "./PoolList"
import ProvideCapitalDialog from "./ProvideCapitalDialog"
import WithdrawCapitalDialog from "./WithdrawCapitalDialog"
import { BigNumber } from "bignumber.js"
import { utils } from "ethers"

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  root: {
    alignContent: "center",
  },
  emojiBacking: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 84,
    width: 84,
    borderRadius: 84,
    marginTop: 120,
    marginBottom: 120,
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: palette.primary.dark,
    borderColor: palette.primary.main,
    borderStyle: "solid",
    borderWidth: 2,
  },
  toggleButtonOpen: {
    backgroundColor: palette.primary.dark,
  },
  toggleButtonOpenSelected: {
    backgroundColor: `${palette.primary.main} !important`,
  },
  toggleButtonClosed: {
    backgroundColor: palette.secondary.dark,
  },
  toggleButtonClosedSelected: {
    backgroundColor: `${palette.secondary.main} !important`,
  },
}))

const LiquidityPoolPage: React.FC<{}> = () => {
  const { isReady } = useWeb3()
  const {
    pools,
    handleSelectWalletConnect,
    sirenRewards,
    claimRewards,
  } = useSirenMarketsContext()
  const [selectedPoolId, setSelectedPoolId] = useState<string | undefined>()
  const [action, setAction] = useState<"provide" | "withdraw" | undefined>()
  const [isClaiming, setIsClaiming] = useState(false)
  const classes = useStyles()

  const selectedPool = selectedPoolId
    ? pools.find((p) => p.address === selectedPoolId)
    : undefined
  const { breakpoints } = useTheme()
  const desktop = useMediaQuery(breakpoints.up("sm"))

  const totalTvl = new BigNumber(
    pools.reduce(
      (totalTVL, pool) =>
        pool.collateralTokenSymbol.toLowerCase() === "usdc"
          ? (totalTVL += pool.totalPoolValue)
          : (totalTVL += pool.totalPoolValue * pool.exchangeRate),
      0,
    ),
  )
    .decimalPlaces(2)
    .toString()

  const handleClaim = async () => {
    setIsClaiming(true)
    await claimRewards()
    setIsClaiming(false)
  }

  return (
    <Grid container direction="row" spacing={4} className={classes.root}>
      <>
        <Grid item xs={12} sm={8} md={9}>
          <Grid container spacing={4}>
            <Grid
              item
              container
              xs={12}
              direction="row"
              style={{ fontWeight: 500 }}
            >
              <Typography variant="h3">Liquidity Pools</Typography>
            </Grid>
            <Grid item container xs={12} direction="row">
              <Typography variant="h5">
                TVL: ${utils.commify(totalTvl)}
              </Typography>
            </Grid>
            <Grid item container xs={12} direction="row" alignItems="center">
              {isReady ? (
                <>
                  <Grid item xs={4}>
                    <Typography variant="h5">
                      Rewards Earned:{" "}
                      {utils.commify(
                        new BigNumber(sirenRewards.totalRewards)
                          .decimalPlaces(2)
                          .toString(),
                      )}{" "}
                      SI
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h5">
                      Available to claim:{" "}
                      {utils.commify(
                        new BigNumber(sirenRewards.claimableRewards)
                          .decimalPlaces(2)
                          .toString(),
                      )}{" "}
                      SI
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      onClick={handleClaim}
                      disabled={
                        sirenRewards.claimableRewards <= 0 || isClaiming
                      }
                      variant="contained"
                      size="large"
                      color="primary"
                    >
                      Claim &nbsp;
                      <span role="img" aria-label="tada">
                        🎉
                      </span>
                      {isClaiming && (
                        <CircularProgress
                          variant="indeterminate"
                          color="primary"
                          size={14}
                        />
                      )}
                    </Button>
                  </Grid>
                </>
              ) : (
                <Typography>Provide liquidity to earn SI</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <PoolList
                pools={pools}
                selectedPoolId={selectedPoolId}
                selectPool={setSelectedPoolId}
              />
            </Grid>
          </Grid>
        </Grid>
        {desktop && (
          <Grid item xs={12} sm={4} md={3} style={{ alignSelf: "center" }}>
            <Paper>
              {!isReady ? (
                <Grid
                  container
                  direction="column"
                  style={{ textAlign: "center" }}
                >
                  <Typography variant="h6">Lets get started</Typography>
                  <Typography>
                    Connect your wallet to make your first siren trade
                  </Typography>
                  <div className={clsx(classes.emojiBacking)}>
                    <img
                      src="/🧜.png"
                      alt="mermaid"
                      style={{ width: "41px" }}
                    ></img>
                  </div>
                  <Button
                    onClick={handleSelectWalletConnect}
                    variant="contained"
                    color="primary"
                  >
                    Connect Wallet
                  </Button>
                </Grid>
              ) : !selectedPool ? (
                <Grid
                  container
                  direction="column"
                  style={{ textAlign: "center" }}
                >
                  <Typography variant="h6">
                    Select a pool to continue
                  </Typography>
                  <div className={clsx(classes.emojiBacking)}>
                    <img
                      src="/🧜.png"
                      alt="mermaid"
                      style={{ width: "41px" }}
                    ></img>
                  </div>
                </Grid>
              ) : !action ? (
                <Grid
                  container
                  direction="column"
                  style={{ textAlign: "center" }}
                >
                  <Typography variant="h6">Choose an action</Typography>
                  <div className={clsx(classes.emojiBacking)}>
                    <img
                      src="/🧜.png"
                      alt="mermaid"
                      style={{ width: "41px" }}
                    ></img>
                  </div>
                  <Grid container item direction="row" spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setAction("provide")}
                        fullWidth
                      >
                        Provide
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setAction("withdraw")}
                        fullWidth
                      >
                        Withdraw
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              ) : action === "provide" ? (
                <ProvideCapitalDialog
                  pool={selectedPool}
                  clearSelection={() => {
                    setSelectedPoolId(undefined)
                    setAction(undefined)
                  }}
                />
              ) : (
                <WithdrawCapitalDialog
                  pool={selectedPool}
                  clearSelection={() => {
                    setSelectedPoolId(undefined)
                    setAction(undefined)
                  }}
                />
              )}
            </Paper>
          </Grid>
        )}
      </>
      {!desktop && selectedPool && (
        <Dialog
          open={!!selectedPool}
          onClose={() => setSelectedPoolId(undefined)}
          fullWidth
        >
          <Paper>
            {!isReady ? (
              <Grid
                container
                direction="column"
                style={{ textAlign: "center" }}
              >
                <Typography variant="h6">Lets get started</Typography>
                <Typography>
                  Connect your wallet to make your first siren trade
                </Typography>
                <div className={clsx(classes.emojiBacking)}>
                  <img
                    src="/🧜.png"
                    alt="mermaid"
                    style={{ width: "41px" }}
                  ></img>
                </div>
                <Button onClick={handleSelectWalletConnect} variant="contained">
                  Connect Wallet
                </Button>
              </Grid>
            ) : !action ? (
              <Grid
                container
                direction="column"
                style={{ textAlign: "center" }}
              >
                <Typography variant="h6">Choose an action</Typography>
                <div className={clsx(classes.emojiBacking)}>
                  <img
                    src="/🧜.png"
                    alt="mermaid"
                    style={{ width: "41px" }}
                  ></img>
                </div>
                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setAction("provide")}
                      fullWidth
                    >
                      Provide
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setAction("withdraw")}
                      fullWidth
                    >
                      Withdraw
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            ) : action === "provide" ? (
              <ProvideCapitalDialog
                pool={selectedPool}
                clearSelection={() => {
                  setSelectedPoolId(undefined)
                  setAction(undefined)
                }}
              />
            ) : (
              <WithdrawCapitalDialog
                pool={selectedPool}
                clearSelection={() => {
                  setSelectedPoolId(undefined)
                  setAction(undefined)
                }}
              />
            )}
          </Paper>
        </Dialog>
      )}
    </Grid>
  )
}

export default LiquidityPoolPage
