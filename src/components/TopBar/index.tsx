import React, { FunctionComponent, useState } from 'react';
import { Bar, Button, IconHome, IconConnect, IconSettings } from '@aragon/ui';
import classnames from 'classnames';
import { useScrollPosition } from '@n8tb1t/use-scroll-position';
import { getWeb3 } from '@utilities';

import './styles.scss';

interface TopBarProps {
  className?: string;
}

export const TopBar: FunctionComponent<TopBarProps> = () => {
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
            />
          </React.Fragment>
        }
        secondary={
          <div className='action-buttons'>
            <Button id='osmBtn' className='primary' label='OSM' />
            <Button
              id='connectAccountBtn'
              className='primary'
              label='Connect Account'
              onClick={getWeb3}
              icon={<IconConnect className='icon' />}
            />
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
