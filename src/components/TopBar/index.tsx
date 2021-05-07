import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import { Bar, Button, IconHome, IconConnect, IconSettings, IdentityBadge, useToast } from '@aragon/ui';
import classnames from 'classnames';
import { useScrollPosition } from '@n8tb1t/use-scroll-position';
import { useWeb3React } from '@web3-react/core';
import { injectedConnector } from '@utilities';
//import { getWeb3 } from '@utilities';

import './styles.scss';

interface TopBarProps {
  className?: string;
}

export const TopBar: FunctionComponent<TopBarProps> = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const toast = useToast();

  // Gets Web3 attributes
  const { connector, library, chainId, account, activate, deactivate, active, error } = useWeb3React();
  
  useEffect(() => {
    // Error message: request of type 'wallet_requestPermissions' already pending for origin
    if (error && error['code'] === -32002) {
      toast('Wallet permissions have already been requested. Please complete wallet authentication, then try again.');
    }
  }, [error]);

  // Local variable for determining solid state of bar
  const [solid, setSolid] = useState(false);

  // Controls whether top bar is solid or not depending on scroll position
  useScrollPosition(
    ({ currPos }) => {
      const solidNow = currPos.y > 0;
      if (solidNow !== solid) {
        setSolid(solidNow);   // Only performs action if value has changed
      }
    },
    [solid],
    undefined,
    true,
    100
  );

  /**
   * Navigates back to the home page if not already there.
   */
  const handleHomeClick = useCallback(() => {
    if (location.pathname !== '/') {
      dispatch(push('/'));
    }
  }, [location.pathname]);

  const handleConnectionClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      activate(injectedConnector);
    }
  }, [activate]);

  return (
    <React.Fragment>
      <Bar
        className={classnames('top-bar-wrapper', { solid: solid })}
        primary={
          <React.Fragment>
            <Button
              id='homeBtn'
              className='primary'
              label='Home'
              display='icon'
              icon={<IconHome className='icon' />}
              onClick={handleHomeClick}
            />
          </React.Fragment>
        }
        secondary={
          <div className='action-buttons'>
            <Button id='osmBtn' className='primary' label='OSM' />
            {!active ? (
              <Button
                id='connectAccountBtn'
                className='primary'
                label='Connect Account'
                icon={<IconConnect className='icon' />}
                onClick={handleConnectionClick}
              />
            ) : (
              <IdentityBadge className='ethereum-address-badge' entity={account} connectedAccount />
            )}
            
            <Button
              id='settingsBtn'
              className='primary'
              label='Settings'
              display='icon'
              icon={<IconSettings className='icon' />}
            />
          </div>
        }
      />
      <div className='top-bar-fixed-buffer' />
    </React.Fragment>
  );
};
