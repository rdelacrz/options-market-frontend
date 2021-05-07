import React, { FunctionComponent, useCallback } from 'react';
import { Bar, Button, IconHome, IconSettings } from '@aragon/ui';
import classnames from 'classnames';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import EthAccountButton from './EthAccountButton';

import './styles.scss';

interface TopBarProps {
  className?: string;
  solid?: boolean;
}

export const TopBar: FunctionComponent<TopBarProps> = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();

  /**
   * Navigates back to the home page if not already there.
   */
  const handleHomeClick = useCallback(() => {
    if (location.pathname !== '/') {
      dispatch(push('/'));
    }
  }, [location.pathname]);

  return (
    <React.Fragment>
      <Bar
        className={classnames('top-bar-wrapper', { solid: props.solid })}
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
            <EthAccountButton className='eth-button' />
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
