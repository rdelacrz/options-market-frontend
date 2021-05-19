// @ts-ignore
import React, { FunctionComponent, useCallback, useState } from "react";
import {
  ContextMenu,
  ContextMenuItem,
  DataView,
  IconStar,
  IconStarFilled,
  LoadingRing,
} from "@aragon/ui";
import BigNumber from "bignumber.js";
import classnames from "classnames";
import { push } from "connected-react-router";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AmmData, OptionsEntry } from "@models";
import { State, updateFlaggedFunds } from "@reduxConfig";
import { useWindowSize } from "@utilities";
import { EthToken } from "../EthToken";

import "./styles.scss";

const OPTIONS_FIELDS = [
  "Type",
  "Pair",
  "Price",
  "STRIKE",
  "Expiration",
  "Premium",
  "LP",
  "Share%",
  "BOP",
  "WOP",
  "Status",
];

interface OptionsTableViewProps {
  className?: string;
  entries: OptionsEntry[]; // Base fund list data parsed from markets
  entryExtensions: OptionsEntry[]; // Updated fund list data containing data parsed from AMM data
  loading?: boolean;
  detailMode?: boolean;
}

export const OptionsTableView: FunctionComponent<OptionsTableViewProps> = (
  props
) => {
  const [activeFund, setActiveFund] = useState<any>({});
  const flaggedFunds =
    useSelector<State, { [id: string]: boolean }>(
      (state) => state.fundInfo.flaggedFunds
    ) || {};
  const dispatch = useDispatch();
  const [isPopover, setPopover] = useState(false);

  const { width } = useWindowSize();
  const mode = width > 900 ? "table" : "list";

  /**
   * Flags a fund and updates star state accordingly based on the given id and updated state value.
   *
   * @param fundId Fund id associated with star clicked.
   * @param updatedState True if fund is flagged, false otherwise (determines state of displayed star).
   */
  const handleStarClick = useCallback(
    (fundId: string, updatedState: boolean) => {
      dispatch(updateFlaggedFunds({ ...flaggedFunds, [fundId]: updatedState }));
    },
    [flaggedFunds]
  );

  /**
   * Navigates to the fund page associated with the selected entry.
   */
  const handleDetailsClick = useCallback(
    (fundId: number) => {
      dispatch(push(`/funds/${fundId}`));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line no-restricted-globals
    [location.pathname]
  );

  const getSortedEntries = () => {
    const favoriteEntries = [];
    const notFavoriteEntries = [];
    for (let i = 0; i < props.entries.length; i++) {
      const entry = props.entries[i];
      if (flaggedFunds[entry.id]) {
        favoriteEntries.push(entry);
      } else {
        notFavoriteEntries.push(entry);
      }
    }
    return [...favoriteEntries, ...notFavoriteEntries];
  };
  console.log("activeFund", activeFund);
  const renderPopoverBody = () => {};

  return (
    <div
      className={classnames("options-table-view-wrapper", mode, {
        [props.className]: !!props.className,
      })}
    >
      <DataView
        mode={mode}
        status={props.loading ? "loading" : "default"}
        fields={OPTIONS_FIELDS}
        entries={props.loading ? [] : getSortedEntries()}
        renderEntry={(optionsEntry: OptionsEntry, index: number) => {
          const entryExtension =
            index < props.entryExtensions.length
              ? props.entryExtensions[index]
              : undefined;

          let dateText = "",
            timeZone = "";
          if (optionsEntry.expiration) {
            const expirationDate = new Date(optionsEntry.expiration);
            dateText = format(expirationDate, "dd/MM/yyyy");
            timeZone = format(expirationDate, "hh:mm");
          }

          return [
            <div className={classnames("option-type", optionsEntry.type)}>
              {optionsEntry.type.toUpperCase()}
            </div>,
            <Link className="options-pair-link" to={`/funds/${index}`}>
              {optionsEntry.pair}
            </Link>,
            <div className="price">
              {entryExtension?.price === undefined ? (
                <LoadingRing />
              ) : (
                `$${entryExtension.price}`
              )}
            </div>,
            <div className="strike-price">${optionsEntry.strike}</div>,
            <div className="expiration-container">
              <div className="date-text">{dateText}</div>
              <div className="time-zone">{timeZone} UTC</div>
            </div>,
            entryExtension?.premium,
            entryExtension?.lp,
            entryExtension?.share,
            <EthToken
              popperTitle="bToken Address"
              tokenAddress={optionsEntry.bop.id}
            />,
            <EthToken
              popperTitle="wToken Address"
              tokenAddress={optionsEntry.wop.id}
            />,
            optionsEntry.status,
          ];
        }}
        renderEntryActions={(optionsEntry: OptionsEntry, index: number) => {
          const entryFlagged = !!flaggedFunds[optionsEntry.id];
          return (
            <div className="entry-actions-wrapper">
              {entryFlagged ? (
                <IconStarFilled
                  className="entry-flag"
                  onClick={() =>
                    handleStarClick(optionsEntry.id, !entryFlagged)
                  }
                />
              ) : (
                <IconStar
                  className="entry-flag"
                  onClick={() =>
                    handleStarClick(optionsEntry.id, !entryFlagged)
                  }
                />
              )}
              <ContextMenu>
                <ContextMenuItem
                  onClick={() => {
                    const currentEntity = props.entryExtensions.find(
                      (el) => el.id === optionsEntry.id
                    );
                    setActiveFund(currentEntity);
                    console.log(currentEntity);
                    setPopover(true);
                  }}
                >
                  Provide
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setPopover(true);
                  }}
                >
                  Withdraw
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setPopover(true);
                  }}
                >
                  Buy
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setPopover(true);
                  }}
                >
                  Exercise
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setPopover(true);
                  }}
                >
                  Sell
                </ContextMenuItem>
                {!props.detailMode && (
                  <ContextMenuItem onClick={() => handleDetailsClick(index)}>
                    Details
                  </ContextMenuItem>
                )}
              </ContextMenu>
            </div>
          );
        }}
      />

      <div className={`popover ${isPopover ? "active" : ""}`}>
        {activeFund && activeFund.pair ? (
          <>
            <div className="header-block">
              <div className="pair-block">{activeFund.pair}</div>
              <div className="price-block">
                {`Current ${activeFund.pair.slice(
                  0,
                  activeFund.pair.indexOf("/")
                )} price: 
                ${activeFund.price}$
                `}
              </div>
            </div>
            <div>{activeFund.type}</div>
            <div>{activeFund.strike}</div>
            <div>{activeFund.expiration}</div>
            <div>{activeFund.pair.slice(activeFund.pair.indexOf("/") + 1)}</div>
          </>
        ) : null}
      </div>
    </div>
  );
};
